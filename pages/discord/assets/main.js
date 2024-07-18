// @ts-check

let localUserID = ""
let currentVoiceChannel = ""
let isError = false
// Constant values
const SEARCH_PARAMS = new URLSearchParams(window.location.search)
const DISCORD_CLIENT_ID = SEARCH_PARAMS.get("id")
const DISCORD_SECRET_ID = SEARCH_PARAMS.get("secret")
const CHANNEL_ID = SEARCH_PARAMS.get("channel")


let discordClientID = ""
if (!DISCORD_CLIENT_ID) {
  const cachedClientID = getCookie("clientId")
  if (cachedClientID) {
    SEARCH_PARAMS.set("id", cachedClientID)
    window.location.href = window.location.pathname + "?" + SEARCH_PARAMS.toString()
  }
  newError("Client IDが見つかりません")
} else {
  discordClientID = DISCORD_CLIENT_ID
  setCookie(`clientId=${DISCORD_CLIENT_ID}`)
}

let discordSecretID = ""
if (!DISCORD_SECRET_ID) {
  const cachedSecretID = getCookie("secretId")
  if (cachedSecretID) {
    SEARCH_PARAMS.set("secret", cachedSecretID)
    window.location.href = window.location.pathname + "?" + SEARCH_PARAMS.toString()
  } else {
    newError("Client Secretが見つかりません")
  }
} else {
  discordSecretID = DISCORD_SECRET_ID
  setCookie(`secretId=${DISCORD_SECRET_ID}`)
}

let channelId = ""
if (CHANNEL_ID) {
  channelId = CHANNEL_ID
}


const DISCORD_REDIRECT_URI = "https://live.aatomu.work"
const DISCORD_CONNECTOR = `ws://127.0.0.1:16463/websocket?id=${discordClientID}`
const OAUTH_SCOPES = ["rpc", "identify","email"]
const nonce = new class Nonce {
  num
  constructor() {
    this.num = 0
  }
  get() {
    this.num++
    return this.num.toString(16).padStart(4, "0")
  }
}


const WEBSOCKET = new WebSocket(DISCORD_CONNECTOR)
WEBSOCKET.addEventListener("open", function (event) {
  console.log("Open", event)
})
WEBSOCKET.addEventListener("message", async function (event) {
  if (!event.data) {
    return
  }
  const RPC = JSON.parse(event.data)
  console.log("Message", RPC)


  // Receive Event
  switch (RPC.cmd) {
    case "DISPATCH": {
      switch (RPC.evt) {
        // First call
        case "READY": {
          if (isError) {
            return
          }

          const access_token = getCookie("token")
          if (access_token) {
            console.log("Access token is cached")
            sendMessage("AUTHENTICATE", "", { access_token: access_token })
          } else {
            console.log("access token is not Cached")
            sendMessage("AUTHORIZE", "", { "client_id": discordClientID, "scopes": OAUTH_SCOPES })
          }
          return
        }

        // Voice events
        case "VOICE_STATE_CREATE": {
          const STATE = RPC.data
          userAdd(STATE.user)
          userSort()
          return
        }
        case "VOICE_STATE_UPDATE": {
          const STATE = RPC.data
          userUpdate(STATE.nick, STATE.user, STATE.voice_state)
          userSort()
          return
        }
        case "VOICE_STATE_DELETE": {
          const USER_ID = RPC.data.user.id
          const USER = document.getElementById(USER_ID)
          if (USER) {
            USER.remove()
          }

          // if me
          if (USER_ID == localUserID) {
            sendMessage("UNSUBSCRIBE", "VOICE_STATE_CREATE", { channel_id: currentVoiceChannel }) // Connect
            sendMessage("UNSUBSCRIBE", "VOICE_STATE_UPDATE", { channel_id: currentVoiceChannel }) // Change VC state
            sendMessage("UNSUBSCRIBE", "VOICE_STATE_DELETE", { channel_id: currentVoiceChannel }) // Disconnect
            sendMessage("UNSUBSCRIBE", "SPEAKING_START", { channel_id: currentVoiceChannel }) // Speak start
            sendMessage("UNSUBSCRIBE", "SPEAKING_STOP", { channel_id: currentVoiceChannel }) // Speak stop
            const USERS = document.getElementById("users")
            if (USERS) {
              while (USERS.firstChild) {
                USERS.removeChild(USERS.firstChild);
              }
            }
            const CHANNEL_NAME = document.getElementById("channel")
            if (CHANNEL_NAME) {
              CHANNEL_NAME.innerText = ""
            }
            currentVoiceChannel = ""
          }
          return
        }
        case "SPEAKING_START": {
          const USER_ID = RPC.data.user_id
          const USER = document.getElementById(USER_ID)
          if (USER) {
            USER.classList.add("speaking")
          }
          return
        }
        case "SPEAKING_STOP": {
          const USER_ID = RPC.data.user_id
          const USER = document.getElementById(USER_ID)
          if (USER) {
            USER.classList.remove("speaking")
          }
          return
        }
        // Channel events
        case "MESSAGE_CREATE": {
          addMessage(RPC.data.message)
          return
        }
      }
      return
    }
    case "AUTHORIZE": {
      if (RPC.evt == "ERROR") {
        newError("Discord App との認証に失敗しました。")
        return
      }

      const OAUTH = await fetch("https://discordapp.com/api/oauth2/token", {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          client_id: discordClientID,
          client_secret: discordSecretID,
          grant_type: "authorization_code",
          code: RPC.data.code,
          redirect_uri: window.location.origin
        }).toString()
      }).then(res => {
        return res.json()
      })
      console.log("AUTHORIZE", OAUTH)
      sendMessage("AUTHENTICATE", "", { access_token: OAUTH.access_token })
      setCookie(`token=${OAUTH.access_token}`)
      return
    }
    case "AUTHENTICATE": {
      if (RPC.evt == "ERROR") {
        newError("Discord Server との認証に失敗しました。")
        setCookie(`token=reset; max-age=0`)
        return
      }

      localUserID = RPC.data.user.id

      if (channelId) {
        sendMessage("GET_CHANNEL", "", { "channel_id": channelId })
        sendMessage("SUBSCRIBE", "MESSAGE_CREATE", { "channel_id": channelId })
        return
      }

      setInterval(function () {
        if (currentVoiceChannel == "") {
          console.log("Check New Channel!")
          sendMessage("GET_SELECTED_VOICE_CHANNEL", "", {}) // Get current channel
        }
      }, 500)

      return
    }
    // Voice events
    case "GET_SELECTED_VOICE_CHANNEL": {
      console.log("GET_SELECTED_VOICE_CHANNEL", RPC.data)
      if (!RPC.data || RPC.evt != null) {
        return
      }

      // Channel Name
      const CHANNEL_NAME = document.getElementById("channel")
      if (CHANNEL_NAME) {
        CHANNEL_NAME.innerText = RPC.data.name
      }
      // SUBSCRIBE
      const VOICE_CHANNEL_ID = RPC.data.id.toString()
      sendMessage("SUBSCRIBE", "VOICE_STATE_CREATE", { channel_id: VOICE_CHANNEL_ID }) // Connect
      sendMessage("SUBSCRIBE", "VOICE_STATE_UPDATE", { channel_id: VOICE_CHANNEL_ID }) // Change VC state
      sendMessage("SUBSCRIBE", "VOICE_STATE_DELETE", { channel_id: VOICE_CHANNEL_ID }) // Disconnect
      sendMessage("SUBSCRIBE", "SPEAKING_START", { channel_id: VOICE_CHANNEL_ID }) // Speak start
      sendMessage("SUBSCRIBE", "SPEAKING_STOP", { channel_id: VOICE_CHANNEL_ID }) // Speak stop
      currentVoiceChannel = VOICE_CHANNEL_ID
      // Add users
      RPC.data.voice_states.forEach((state) => {
        userAdd(state.user)
        userUpdate(state.nick, state.user, state.voice_state)
      });
      userSort()
      return
    }
    // Channel events
    case "GET_CHANNEL": {
      // Channel Name
      const CHANNEL_NAME = document.getElementById("channel")
      if (CHANNEL_NAME) {
        CHANNEL_NAME.innerText = RPC.data.name
      }

      RPC.data.messages.forEach((message) => {
        addMessage(message)
      })
      return
    }
  }
})

WEBSOCKET.addEventListener("error", function (event) {
  console.log("Error", event)
  newError("Discord-Connectorに接続できませんでした")
})
WEBSOCKET.addEventListener("close", function (event) {
  console.log("Close", event)
  newError("Discord-Connectorとの接続が切断されました")
})

function newError(err) {
  isError = true
  const MESSAGE = document.createElement("div")
  MESSAGE.innerHTML = err

  const ERRORS = document.getElementById("errors")
  if (ERRORS) {
    ERRORS.append(MESSAGE)
  }
}
/**
 * @param {string} command
 * @param {string} event
 * @param {object} argumentsObject
 */
function sendMessage(command, event, argumentsObject) {
  WEBSOCKET.send(JSON.stringify({
    nonce: nonce.get(),
    cmd: command,
    evt: event,
    args: argumentsObject
  }))
}

/**
 * @param {string} key get cookie key
 * @return {string | null}
 */
function getCookie(key) {
  const cookies = document.cookie
  const parts = cookies.split(";")
  for (let i = 0; i < parts.length; i++) {
    const cookie = parts[i]
    const content = cookie.split("=", 2)
    content[0] = content[0].replace(/^ +/, "")
    console.log(content)
    console.log(content[0], content[0] === key)
    if (content[0] === key) {
      return content[1]
    }
  }
  return null
}
/**
 * @param {string} data example: key=value; opts...
 */
function setCookie(data) {
  document.cookie = data
}