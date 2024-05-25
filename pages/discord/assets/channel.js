// @ts-check

/**
 * @typedef message
 * @type {object}
 * @property {User} author
 * @property {string} author_color
 * @property {boolean} bot
 * @property {string} content
 * @property {object} avatar_decoration_data
 * @property {string} nick
 * @property {string} timestamp
*/

/**
 * @param {message} message
 */
function addMessage(message) {
  const MESSAGE = document.createElement("div")
  MESSAGE.classList.add("message")
  if (message.author.id.toString() == localUserID) {
    MESSAGE.classList.add("me")
  }

  const ICON = document.createElement("img")
  ICON.classList.add("icon")
  if (message.author.avatar) {
    ICON.src = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}`
  } else {
    const INDEX = (message.author.id >> 22) % 6
    ICON.src = `https://cdn.discordapp.com/embed/avatars/${INDEX}.png`
  }
  MESSAGE.append(ICON)

  const NICK = document.createElement("span")
  NICK.classList.add("nick")
  NICK.innerText = message.nick
  NICK.style.color = message.author_color
  MESSAGE.append(NICK)

  const NAME = document.createElement("span")
  NAME.classList.add("name")
  NAME.style.color = message.author_color
  NAME.innerText = message.author.username
  MESSAGE.append(NAME)

  const TIMESTAMP = document.createElement("time")
  TIMESTAMP.classList.add("timestamp")
  TIMESTAMP.dateTime = message.timestamp
  const date = new Date(message.timestamp)
  TIMESTAMP.innerText = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
  MESSAGE.append(TIMESTAMP)

  const CONTENT = document.createElement("span")
  CONTENT.classList.add("content")
  CONTENT.innerText = message.content
  MESSAGE.append(CONTENT)

  const MESSAGES = document.getElementById("messages")
  if (MESSAGES) {
    MESSAGES.append(MESSAGE)
    if (MESSAGES.children.length > 15) {
      MESSAGES.children[0].remove()
    }
  }

  // Scroll to bottom
  const ELEMENT = document.documentElement
  const BOTTOM_HEIGHT = ELEMENT.scrollHeight - ELEMENT.clientHeight
  window.scroll(0, BOTTOM_HEIGHT)
}