// @ts-check
/// <reference path="index.js"/>

function openrecSubscribe(token) {
	const WEBSOCKET = new WebSocket(`wss://chat.openrec.tv/socket.io/?movieId=${token.movie_id}&EIO=3&transport=websocket`)

	// Open twitch IRC(Websocket) connection
	WEBSOCKET.addEventListener("open", function (event) {
		console.log(`Openrec Websocket Open(${token.channel_name}):`, event)

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
			console.log(`Openrec WebSocket Message(@${token.channel_name}):`, CHAT)
			addMessage(new Date(CHAT.message_dt).getTime(), CHAT.user_icon, CHAT.user_name, CHAT.message, token.channel_name, "openrec")
		}
	})
}
