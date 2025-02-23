// @ts-check
/// <reference path="index.js"/>

const API_SERVER = `${window.location.origin}/api`

// constant values
const SEARCH_PARAMS = new URLSearchParams(window.location.search)
/// chat limit
let charCountLimitString = SEARCH_PARAMS.get("limit")
if (charCountLimitString == null) {
	charCountLimitString = "20"
}
const CHAT_COUNT_LIMIT = parseInt(charCountLimitString)
/// chat cleanup
const CHAT_CLEANUP_TIME = SEARCH_PARAMS.get("cleanup")
/// tip read config
const TIP_READ_CONFIG = SEARCH_PARAMS.get("tip")
const MESSAGE_READ_CONFIG = SEARCH_PARAMS.get("message")

// develop message
if (SEARCH_PARAMS.size == 0) {
	addMessage(0, "https://pbs.twimg.com/profile_images/1480130282099740684/uNSmGF1F_400x400.jpg", "aatomu", `Check This! <a href="https://github.com/aatomu/chat_subscriber">Github</a>`, "#develop-message", "youtube")
}

// Youtube Channel
SEARCH_PARAMS.getAll("youtube").forEach(async (channelID) => {
	console.log("Youtube Channel: ", channelID)
	const TOKEN = await fetch(`${API_SERVER}/youtube/channel?id=${channelID}`)
		.then(res => { return res.json() })

	console.log(`Youtube(#${channelID}):`, TOKEN)
	if (TOKEN.continuation == "") {
		addMessage(0, "", "ERROR", "This channelID live not found", channelID, "youtube")
		return
	}

	youtubeSubscribe(TOKEN)
})

// Youtube Limited Live
SEARCH_PARAMS.getAll("watch").forEach(async (videoID,) => {
	console.log("Youtube Watch: ", videoID)
	const TOKEN = await fetch(`${API_SERVER}/youtube/watch?id=${videoID}`)
		.then(res => { return res.json() })

	console.log(`Youtube(${videoID}):`, TOKEN)
	if (TOKEN.continuation == "") {
		addMessage(0, "", "ERROR", "This videoID live not found", videoID, "youtube")
		return
	}

	youtubeSubscribe(TOKEN)
})

// Twitch Channel
const TWITCH_IRC_URI = "wss://irc-ws.chat.twitch.tv:443"
SEARCH_PARAMS.getAll("twitch").forEach((channelID) => {
	// Information
	console.log("Twitch Channel: ", channelID)

	twitchSubscribe(channelID)
})

// Niconico Channel
SEARCH_PARAMS.getAll("niconico").forEach(async (channelID) => {
	// Information
	console.log("Niconico Channel: ", channelID)
	const TOKEN = await fetch(`${API_SERVER}/niconico/channel?id=${channelID}`)
		.then(res => { return res.json() })

	console.log(`Niconico(#${channelID}):`, TOKEN)
	if (TOKEN.websocketUrl == "") {
		addMessage(0, "", "ERROR", "This channelID live not found", channelID, "niconico")
		return
	}

	niconicoSubscribe(TOKEN)
})

// Twicas Channel
SEARCH_PARAMS.getAll("twicas").forEach(async (channelID) => {
	// Information
	console.log("Twicas Channel: ", channelID)
	const TOKEN = await fetch(`${API_SERVER}/twicas/channel?id=${channelID}`)
		.then(res => { return res.json() })

	console.log(`Twicas(#${channelID}):`, TOKEN)
	if (TOKEN.websocketUrl == "") {
		addMessage(0, "", "ERROR", "This channelID live not found", channelID, "twicas")
		return
	}

	twicasSubscribe(TOKEN)
})

// Openrec Channel
SEARCH_PARAMS.getAll("openrec").forEach(async (channelID) => {
	// Information
	console.log("Openrec Channel: ", channelID)
	const TOKEN = await fetch(`${API_SERVER}/openrec/channel?id=${channelID}`)
		.then(res => { return res.json() })

	console.log(`Openrec(#${channelID}):`, TOKEN)
	if (TOKEN.movieId == "") {
		addMessage(0, "", "ERROR", "This channelID live not found", channelID, "twicas")
		return
	}

	openrecSubscribe(TOKEN)
})

voiceCheck()
