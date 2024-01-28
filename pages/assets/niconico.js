// @ts-check
/// <reference path="index.js"/>

/**
 * @typedef NiconicoToken
 * @type {object}
 * @property {string} watch_websocket_url Niconico watch websocket url
 * @property {string} channel_name Niconico live streamer name
 */
/**
 * @typedef NiconicoData
 * @type {object}
 * @property {string} type Niconico data format type
 * @property {object} data Niconico data lists
 */
/**
 * @typedef NiconicoMessageData
 * @type {object}
 * @property {string} content Chat message
 * @property {number} date Send message timestamp seconds
 * @property {number} date_usec Send message timestamp micro second
 * @property {string?} mail If anonymity, "184" inputed
 * @property {number} no Message number
 * @property {number} premium Author flag 1:premium 3:owner
 * @property {string} thread Unknown Paramator
 * @property {string} user_id Author id
 * @property {number} vpos Unknown Paramator
 */

/**
 * @param {NiconicoToken} token
 */
function niconicoSubscribe(token) {
  // Connect niconico watch websocket
  const WATCH_SESSION = new WebSocket(token.watch_websocket_url)

  WATCH_SESSION.addEventListener("open", function (event) {
    console.log(`Niconico Websocket Open Watch(@${token.channel_name}):`, event)
    WATCH_SESSION.send(`
    {
      "type": "startWatching",
      "data": {
        "stream": {
          "quality": "abr",
          "protocol": "hls",
          "latency": "low",
          "chasePlay": false
        },
        "room": {
          "protocol": "webSocket",
          "commentable": true
        }, "reconnect": false
      }
    }`)
    // WATCH_SESSION.send(`
    // {
    //   "type":"getAkashic",
    //   "data":{
    //     "chasePlay":false
    //   }
    // }`)
  })

  WATCH_SESSION.addEventListener("message", function (event) {
    if (!event.data) {
      return
    }

    const REQUEST = JSON.parse(event.data)

    switch (REQUEST.type) {
      case "ping": // Keep watch websocket signal
        WATCH_SESSION.send(`{"type":"pong"}`)
        WATCH_SESSION.send(`{"type":"keepSeat"}`)
        break
      case "room": // Recive chat websoket information
        const CHAT_WEBSOCKET_URL = REQUEST.data.messageServer.uri
        const JOIN_MESSAGE = JSON.stringify([
          {
            "ping":
            {
              "content": "rs:0"
            }
          }, {
            "ping": {
              "content": "ps:0"
            }
          }, {
            "thread": {
              "thread": REQUEST.data.threadId,
              "version": "20061206",
              "user_id": "guest",
              "res_from": -150,
              "with_global": 1,
              "scores": 1,
              "nicoru": 0
            }
          }, {
            "ping": {
              "content": "pf:0"
            }
          }, {
            "ping": {
              "content": "rf:0"
            }
          }])

        // Connect niconico chat websocket
        const WEBSOCKET = new WebSocket(CHAT_WEBSOCKET_URL, 'niconama')
        WEBSOCKET.addEventListener("open", function (event) {
          console.log(`Niconico Websocket Open(@${token.channel_name}):`, event)
          WEBSOCKET.send(JOIN_MESSAGE)
        })
        WEBSOCKET.addEventListener("message", async function (event) {
          if (!event.data) {
            return
          }
          const MESSAGE = JSON.parse(event.data)

          // Send ping signal
          if (MESSAGE.ping) {
            WEBSOCKET.send("")
          }

          if (MESSAGE.chat) {
            /**
             * @type {NiconicoMessageData}
             */
            const CHAT = MESSAGE.chat
            const AUTHOR = await fetch(`${API_SERVER}/niconico/name?id=${CHAT.user_id}`).
              then(res => {
                return res.json()
              }).
              then(json => {
                return json
              })

            let username = "匿名さん"
            if (AUTHOR.channel_name) {
              username = AUTHOR.channel_name
            }

            console.log(`Niconico WebSocket Message(@${token.channel_name}):`, CHAT)
            addMessage(CHAT.date, AUTHOR.icon_url, username, CHAT.content, token.channel_name, "niconico")
          }
        })
    }
  })

}
