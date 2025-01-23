// @ts-check
/// <reference path="index.js"/>

/**
 * @typedef OpenrecToken
 * @type {object}
 * @property {string} channelName Twicas live streamer name
 * @property {string} movieId Twicas live movie id
 */

/**
 * @param {OpenrecToken} token
 */
function openrecSubscribe(token) {
	const WEBSOCKET = new WebSocket(`wss://chat.openrec.tv/socket.io/?movieId=${token.movieId}&EIO=3&transport=websocket`)

	// Open twitch IRC(Websocket) connection
	WEBSOCKET.addEventListener("open", function (event) {
		console.log(`Openrec Websocket Open(${token.channelName}):`, event)

		setInterval(function () {
			WEBSOCKET.send("2")
		}, 10000)
	})

	// Receive message
	WEBSOCKET.addEventListener("message", function (event) {
		if (!event.data) {
			return
		}

		if (event.data.startsWith("42")) {
			const MESSAGE = JSON.parse(JSON.parse(event.data.substring(2))[1])
			if (MESSAGE.type != 0) {
				return
			}

			const CHAT = MESSAGE.data
			console.log(`Openrec WebSocket Message(@${token.channelName}):`, CHAT)
			addMessage(new Date(CHAT.message_dt).getTime(), CHAT.user_icon, CHAT.user_name, CHAT.message, token.channelName, "openrec")
		}
	})
}
