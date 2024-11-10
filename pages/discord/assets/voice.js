// @ts-check

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
      const INDEX = (BigInt(user.id) >> 22n) % 6n
      ICON.src = `https://cdn.discordapp.com/embed/avatars/${INDEX}.png`
    }
  }
  if (user.avatar_decoration_data) {
    /** @type {HTMLImageElement?} */
    const DECO = USER.querySelector(".decoration")
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
