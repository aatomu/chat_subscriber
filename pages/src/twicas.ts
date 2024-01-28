export function twicasSubscribe(token) {
	const WEBSOCKET = new WebSocket(token.websocket_url)

	// Open twitch IRC(Websocket) connection
	WEBSOCKET.addEventListener("open", function (event) {
		console.log(`Twicas Websocket Open(${token.channel_name}):`, event)
	})

	// Receive message
	WEBSOCKET.addEventListener("message", function (event) {
		if (!event.data) {
			return
		}
		const CHAT_LIST = JSON.parse(event.data)
		CHAT_LIST.forEach(chat => {
			addMessage(chat.createdAt,chat.author.profileImage,chat.author.name,chat.message,token.channel_name,"twicas")
		})
	})
}
