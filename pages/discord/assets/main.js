// @ts-check

let localUserID = ""
let currentVoiceChannel = ""
let currentCoolDown = 10
// Constant values
const DISCORD_CLIENT_ID = "1201816266344759326"
const DISCORD_ORIGIN = "https://aatomu.work"
const DISCORD_CONNECTOR = `ws://127.0.0.1:16463/websocket?id=${DISCORD_CLIENT_ID}&origin=${DISCORD_ORIGIN}`
const nonce = new class Nonce {
  num
  constructor() {
    this.num = 0
  }
  get() {
    return this.num.toString(16).padStart(4, "0")
  }
}
const SEARCH_COOL_DOWN = 10

const WEBSOCKET = new WebSocket(DISCORD_CONNECTOR)

WEBSOCKET.addEventListener("open", function (event) {
  console.log("Open", event)
})
WEBSOCKET.addEventListener("message", function (event) {
  if (!event.data) {
    return
  }
  const RPC = JSON.parse(event.data)
  console.log("Message", RPC)

  // Receive Event
  switch (RPC.cmd) {
    case "DISPATCH": {
      switch (RPC.evt) {
        case "READY": {
          Send(WEBSOCKET, "AUTHORIZE", "", { "client_id": DISCORD_CLIENT_ID, "scopes": ["rpc"] })
          return
        }
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
            Send(WEBSOCKET, "UNSUBSCRIBE", "VOICE_STATE_CREATE", { channel_id: currentVoiceChannel }) // Connect
            Send(WEBSOCKET, "UNSUBSCRIBE", "VOICE_STATE_UPDATE", { channel_id: currentVoiceChannel }) // Change VC state
            Send(WEBSOCKET, "UNSUBSCRIBE", "VOICE_STATE_DELETE", { channel_id: currentVoiceChannel }) // Disconnect
            Send(WEBSOCKET, "UNSUBSCRIBE", "SPEAKING_START", { channel_id: currentVoiceChannel }) // Speak start
            Send(WEBSOCKET, "UNSUBSCRIBE", "SPEAKING_STOP", { channel_id: currentVoiceChannel }) // Speak stop
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
      }
      return
    }
    case "AUTHORIZE": {
      const TOKEN = RPC.data.code
      console.log(TOKEN)
      return
    }
    case "GET_SELECTED_VOICE_CHANNEL": {
      console.log("GET_SELECTED_VOICE_CHANNEL", RPC.data)
      if (!RPC.data) {
        return
      }
      // Channel Name
      const CHANNEL_NAME = document.getElementById("channel")
      if (CHANNEL_NAME) {
        CHANNEL_NAME.innerText = RPC.data.name
      }
      // SUBSCRIBE
      const VOICE_CHANNEL_ID = RPC.data.id.toString()
      Send(WEBSOCKET, "SUBSCRIBE", "VOICE_STATE_CREATE", { channel_id: VOICE_CHANNEL_ID }) // Connect
      Send(WEBSOCKET, "SUBSCRIBE", "VOICE_STATE_UPDATE", { channel_id: VOICE_CHANNEL_ID }) // Change VC state
      Send(WEBSOCKET, "SUBSCRIBE", "VOICE_STATE_DELETE", { channel_id: VOICE_CHANNEL_ID }) // Disconnect
      Send(WEBSOCKET, "SUBSCRIBE", "SPEAKING_START", { channel_id: VOICE_CHANNEL_ID }) // Speak start
      Send(WEBSOCKET, "SUBSCRIBE", "SPEAKING_STOP", { channel_id: VOICE_CHANNEL_ID }) // Speak stop
      currentVoiceChannel = VOICE_CHANNEL_ID
      // Add users
      RPC.data.voice_states.forEach((state) => {
        userAdd(state.user)
        userUpdate(state.nick, state.user, state.voice_state)
      });
      userSort()
    }
  }
  // Auth result
  if (RPC.cmd == "AUTHENTICATE") {
    setInterval(function () {
      if (currentVoiceChannel == "") {
        console.log("Should Check New Channel?")
        if (currentCoolDown > 0) {
          currentCoolDown--
          return
        }
        console.log("Check New Channel!")
        Send(WEBSOCKET, "GET_SELECTED_VOICE_CHANNEL", "", {}) // Get current channel
        currentCoolDown = SEARCH_COOL_DOWN
      }
    }, 100)
    localUserID = RPC.data.user.id
  }
})

WEBSOCKET.addEventListener("error", function (event) {
  console.log("Error", event)
})
WEBSOCKET.addEventListener("close", function (event) {
  console.log("Close", event)
})

/**
 * @param {WebSocket} ws
 * @param {string} command
 * @param {string} event
 * @param {object} argumentsObject
 */
function Send(ws, command, event, argumentsObject) {
  ws.send(JSON.stringify({
    nonce: nonce.get(),
    cmd: command,
    evt: event,
    args: argumentsObject
  }))
}

/**
 * @typedef User
 * @type {object}
 * @property {number} id
 * @property {string} username
 * @property {string} global_name
 * @property {string} avatar
 * @property {object} avatar_decoration_data
 * @property {string} bot
 * @property {number} flags
 * @property {number} premium_type
*/
/**
 * @typedef VoiceState
 * @type {object}
 * @property {boolean} mute mute by server
 * @property {boolean} deaf deaf by server
 * @property {boolean} self_mute mute by self
 * @property {boolean} self_deaf deaf by self
 * @property {boolean} suppress permission to speak denied
 */

/**
 * @param {User} user
 */
function userAdd(user) {
  const USER = document.createElement("div")
  USER.classList.add("user")
  USER.id = user.id.toString()
  if (USER.id == localUserID) {
    USER.classList.add("me")
  }

  const ICON = document.createElement("img")
  ICON.classList.add("icon")
  USER.append(ICON)
  if (user.avatar_decoration_data) {
    const DECO = document.createElement("img")
    DECO.classList.add("decoration")
    USER.append(DECO)
  }
  const NICK = document.createElement("span")
  NICK.classList.add("nick")
  USER.append(NICK)
  const NAME = document.createElement("span")
  NAME.classList.add("name")
  USER.append(NAME)

  const USERS = document.getElementById("users")
  if (USERS) {
    USERS.append(USER)
  }
}

/**
 * @param {string} nick
 * @param {User} user
 * @param {VoiceState} voice_state
 * @returns
 */
function userUpdate(nick, user, voice_state) {
  const USER = document.getElementById(user.id.toString())
  if (!USER) {
    return
  }

  // User
  /** @type {HTMLImageElement?} */
  const ICON = USER.querySelector(".icon")
  if (ICON) {
    if (user.avatar) {
      ICON.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
    } else {
      const INDEX = (user.id >> 22) % 6
      ICON.src = `https://cdn.discordapp.com/embed/avatars/${INDEX}.png`
    }
  }
  if (user.avatar_decoration_data) {
    /** @type {HTMLImageElement?} */
    const DECO = USER.querySelector("decoration")
    if (DECO) {
      DECO.src = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}`
    }
  }
  /** @type {HTMLSpanElement?} */
  const NICK = USER.querySelector(".nick")
  if (NICK) {
    NICK.innerText = nick
  }
  /** @type {HTMLSpanElement?} */
  const NAME = USER.querySelector(".name")
  if (NAME) {
    NAME.innerText = user.username
  }

  // Voice
  USER.classList.remove("deaf")
  if (voice_state.deaf) { USER.classList.add("deaf") }
  USER.classList.remove("self_deaf")
  if (voice_state.self_deaf) { USER.classList.add("self_deaf") }
  USER.classList.remove("mute")
  if (voice_state.mute) { USER.classList.add("mute") }
  USER.classList.remove("self_mute")
  if (voice_state.self_mute) { USER.classList.add("self_mute") }
  USER.classList.remove("suppress")
  if (voice_state.suppress) { USER.classList.add("suppress") }
}

function userSort() {
  const USERS = document.getElementById("users")
  if (!USERS) {
    return
  }

  let userArray = Array.prototype.slice.call(USERS.children)
  userArray.sort(function (a, b) {
    const A_NICK = a.querySelector(".nick").innerText.toLowerCase()
    const B_NICK = b.querySelector(".nick").innerText.toLowerCase()
    if (A_NICK > B_NICK) {
      return 1
    } else if (A_NICK < B_NICK) {
      return -1
    }
    return 0
  })

  for (let index = 0; index < userArray.length; index++) {
    const USER = USERS.removeChild(userArray[index])
    USERS.appendChild(USER)
  }
  console.log(userArray)
}
