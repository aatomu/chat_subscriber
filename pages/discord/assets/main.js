// @ts-check

let localUserID = ""
let currentVoiceChannel = ""
// Constant values
const DISCORD_CONNECTOR = "ws://127.0.0.1:16463/websocket"
const DISCORD_ACCESS_TOKEN = "T0cJ3PN21itSa7jltuHDeVhLkVPIgz"
const nonce = new class Nonce {
  num
  constructor() {
    this.num = 0
  }
  get() {
    return this.num.toString(16).padStart(4, "0")
  }
}


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
  if (RPC.cmd == "DISPATCH") {
    switch (RPC.evt) {
      case "READY": {
        Send(WEBSOCKET, "AUTHENTICATE", "", { access_token: DISCORD_ACCESS_TOKEN })
        return
      }
      case "VOICE_STATE_CREATE": {
        const STATE = RPC.data
        userAdd(STATE.nick, STATE.user, STATE.voice_state)
        return
      }
      case "VOICE_STATE_UPDATE": {
        const STATE = RPC.data
        updateVoiceState(STATE.user.id, STATE.voice_state)
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
  }
  // Auth result
  if (RPC.cmd == "AUTHENTICATE") {
    setInterval(function () {
      console.log("Should Check New Channel?")
      if (currentVoiceChannel == "") {
        console.log("Check New Channel!")
        Send(WEBSOCKET, "GET_SELECTED_VOICE_CHANNEL", "", {}) // Get current channel
      }
    }, 5000)
    localUserID = RPC.data.user.id
  }
  // Parse user voice chat
  if (RPC.cmd == "GET_SELECTED_VOICE_CHANNEL") {
    console.log("GET_SELECTED_VOICE_CHANNEL", RPC.data)
    if (!RPC.data) {
      return
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
      userAdd(state.nick, state.user, state.voice_state)
    });
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
 * @param {string} nick
 * @param {User} user
 * @param {VoiceState} voice_state
 */
function userAdd(nick, user, voice_state) {
  const USER = document.createElement("div")
  USER.classList.add("user")
  USER.id = user.id.toString()

  const ICON = document.createElement("img")
  if (user.avatar) {
    ICON.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
  } else {
    const INDEX = (user.id >> 22) % 6
    ICON.src = `https://cdn.discordapp.com/embed/avatars/${INDEX}.png`
  }
  ICON.classList.add("icon")
  USER.append(ICON)
  if (user.avatar_decoration_data) {
    const DECO = document.createElement("img")
    DECO.src = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}`
    DECO.classList.add("decoration")
    USER.append(DECO)
    }
  const NICK = document.createElement("span")
  NICK.innerText = nick
  NICK.classList.add("nick")
  USER.append(NICK)
  const NAME = document.createElement("span")
  NAME.innerText = user.username
  NAME.classList.add("name")
  USER.append(NAME)

  const USERS = document.getElementById("users")
  if (USERS) {
    USERS.append(USER)
    updateVoiceState(user.id, voice_state)
  }
}

/**
 * @param {number} id
 * @param {VoiceState} voice_state
 * @returns
 */
function updateVoiceState(id, voice_state) {
  const USER = document.getElementById(id.toString())
  if (!USER) {
    return
  }

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
