// @ts-check
/// <reference path="index.js"/>

const CONTENTS = document.getElementById("contents")

/**
 * Append #contents child
 * @param {number} timestamp Message timestamp(UTC milliseconds)
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
	CONTENT.classList.add(site)
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
	if (iconURL) {
		const ICON = document.createElement("img")
		ICON.src = iconURL
		ICON_ROOT.append(ICON)
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

	// Speech
	const SPEECH_TEXT = message.replace(/<span.+?span>|<img.+?>/g, "")
	/// tip message
	if (TIP_READ_CONFIG != null && SPEECH_TEXT != "" && message.includes("money")) {
		const CONFIG = parseSpeechConfig(TIP_READ_CONFIG)
		speechText(CONFIG.index, CONFIG.rate, CONFIG.volume, SPEECH_TEXT)
	}
	/// normal message
	if (MESSAGE_READ_CONFIG != null && SPEECH_TEXT != "" && !message.includes("money")) {
		const CONFIG = parseSpeechConfig(MESSAGE_READ_CONFIG)
		speechText(CONFIG.index, CONFIG.rate, CONFIG.volume, SPEECH_TEXT)
	}

	bottomScroll()
}

/**
 * Scroll to page bottom
 */
function bottomScroll() {
	const ELEMENT = document.documentElement;
	const BOTTOM_HEIGHT = ELEMENT.scrollHeight - ELEMENT.clientHeight;
	// Move
	window.scroll(0, BOTTOM_HEIGHT);
}
