// @ts-check
/// <reference path="index.js"/>

function twicasSubscribe(token) {
	const WEBSOCKET = token.websocket_url

	// Open twitch IRC(Websocket) connection
	WEBSOCKET.addEventListener("open", function (event) {
		console.log(`Twicas Websocket Open(${token.channel_name}):`, event)
	})

	// Recive message
	WEBSOCKET.addEventListener("message", function (event) {
		console.log(event)
	})
}
