// @ts-check

const CONTENTS = document.getElementById("contents")

/**
 * Append #contents child
 * @param {number} timestamp Message timestamp(UTC milli seconds)
 * @param {string} iconURL Author icon url
 * @param {string} name Author name
 * @param {string} message Message content(supported HTML)
 * @param {string} channelName Sent channel name
 * @param {string} site Sent channel site(youtube/twitch)
 */
function addMessage(timestamp, iconURL, name, message, channelName, site) {
  if (!CONTENTS) {
    return
  }
  // Root
  const CONTENT = document.createElement("div")
  CONTENT.classList.add("content")
  switch (site) {
    case "youtube":
      CONTENT.classList.add("youtube")
      break
    case "twitch":
      CONTENT.classList.add("twitch")
      break
  }
  if (CHAT_CLEANUP_TIME) {
    CONTENT.style.animation = `invisible 1s linear ${CHAT_CLEANUP_TIME}s 1 normal both`
  }

  // Timestamp
  const TIME = new Date(timestamp)
  const TIMESTAMP = document.createElement("span")
  TIMESTAMP.classList.add("time")
  TIMESTAMP.innerText = `${String(TIME.getHours()).padStart(2, "0")}:${String(TIME.getMinutes()).padStart(2, "0")}:${String(TIME.getSeconds()).padStart(2, "0")}`
  CONTENT.append(TIMESTAMP)

  // Icon
  const ICON_ROOT = document.createElement("div")
  ICON_ROOT.classList.add("icon")
  switch (site) {
    case "youtube":
      const ICON_YOUTUBE = document.createElement("img")
      ICON_YOUTUBE.src = iconURL
      ICON_ROOT.append(ICON_YOUTUBE)
      break
    case "twitch":
      const ICON_TWITCH = document.createElement("img")
      ICON_TWITCH.src = "https://www.freepnglogos.com/uploads/twitch-logo-symbol-25.png"

      ICON_ROOT.append(ICON_TWITCH)
      break
  }
  CONTENT.append(ICON_ROOT)

  // Name
  const NAME = document.createElement("span")
  NAME.classList.add("name")
  NAME.innerText = name
  CONTENT.append(NAME)

  // Message
  const MESSAGE_ROOT = document.createElement("div")
  MESSAGE_ROOT.classList.add("message-root")
  const MESSAGE = document.createElement("span")
  MESSAGE.classList.add("message")
  MESSAGE.innerHTML = message
  MESSAGE_ROOT.append(MESSAGE)
  const CHANNEL = document.createElement("span")
  CHANNEL.classList.add("channel")
  CHANNEL.innerText = channelName
  MESSAGE_ROOT.append(CHANNEL)
  CONTENT.append(MESSAGE_ROOT)

  if (CONTENTS.children.length >= CHAT_COUNT_LIMIT) {
    if (CONTENTS.firstElementChild) {
      CONTENTS.firstElementChild.remove()
    }
  }
  CONTENTS.append(CONTENT)

  bottomScroll()
}


function bottomScroll() {
  const ELEMENT = document.documentElement;
  const BOTTOM_HEIGHT = ELEMENT.scrollHeight - ELEMENT.clientHeight;
  // Move
  window.scroll(0, BOTTOM_HEIGHT);
}