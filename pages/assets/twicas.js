// @ts-check
/// <reference path="index.js"/>

/**
 * @typedef TwicasToken
 * @type {object}
 * @property {string} channelName Twicas live streamer name
 * @property {string} websocketUrl Twicas watch websocket url
 */

/**
 * @param {TwicasToken} token
 */
function twicasSubscribe(token) {
	const WEBSOCKET = new WebSocket(token.websocketUrl)

	// Open twitch IRC(Websocket) connection
	WEBSOCKET.addEventListener("open", function (event) {
		console.log(`Twicas Websocket Open(${token.channelName}):`, event)
	})

	// Receive message
	WEBSOCKET.addEventListener("message", function (event) {
		if (!event.data) {
			return
		}
		const CHAT_LIST = JSON.parse(event.data)
		CHAT_LIST.forEach(chat => {
			console.log(`Twicas WebSocket Message(@${token.channelName}):`, chat)
			addMessage(chat.createdAt,chat.author.profileImage,chat.author.name,chat.message,token.channelName,"twicas")
		})
	})
}
