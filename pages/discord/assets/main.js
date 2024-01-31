// @ts-check

const DISCORD_CONNECTOR = "ws://127.0.0.1:16463/websocket"

const WEBSOCKET = new WebSocket(DISCORD_CONNECTOR)

WEBSOCKET.addEventListener("open",function(event) {
	console.log("Open",event)
	WEBSOCKET.send(`{"nonce":"0001","cmd":"AUTHENTICATE","evt":"","args": {"access_token": "T0cJ3PN21itSa7jltuHDeVhLkVPIgz"}}`)
})
WEBSOCKET.addEventListener("message",function(event) {
	console.log("Message",event)
})
WEBSOCKET.addEventListener("error",function(event) {
	console.log("Error",event)
})
WEBSOCKET.addEventListener("close",function(event) {
	console.log("Close",event)
})
