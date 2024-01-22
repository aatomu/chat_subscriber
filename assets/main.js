const SEARCH_PARAMS = new URLSearchParams(window.location.search)
const CHAT_COUNT_LIMIT = SEARCH_PARAMS.get("limit") ? parseInt(SEARCH_PARAMS.get("limit")) : 20
const CHAT_CLEANUP_TIME = SEARCH_PARAMS.get("cleanup")

if (SEARCH_PARAMS.size == 0) {
  document.getElementById("contents").innerHTML += `
  <div class="content youtube">
    <span class="time">99:99:99</span>
    <div class="icon">
      <img src="https://pbs.twimg.com/profile_images/1480130282099740684/uNSmGF1F_400x400.jpg">
    </div>
    <span class="name">aatomu</span>
    <div class="message-root">
      <span class="message">How To Use:
        /?youtube=@ChannelID&youtube=ChannelID&twitch=ChannelID&twitch=ChannelID&limit=ChatLimit
        More Information: <a href="https://github.com/aatomu/chat_subscriber">https://github.com/aatomu/chat_subscriber</a></span>
      <span class="channel">#develop-message</span>
    </div>
  </div>
</div>
`
}

// Twitch
const TWITCH_IRC_URI = "wss://irc-ws.chat.twitch.tv:443"
SEARCH_PARAMS.getAll("twitch").forEach((channelID) => {
  console.log("Twtich: ", channelID)
  const WEBSOCKET = new WebSocket(TWITCH_IRC_URI)

  WEBSOCKET.addEventListener("open", function (event) {
    console.log(`WebSocket Open(#${channelID}):\n`, event)
    WEBSOCKET.send("CAP REQ :twitch.tv/tags twitch.tv/commands")
    WEBSOCKET.send("PASS SCHMOOPIIE")
    const RANDOM_NUMBER = Math.floor(Math.random() * 100000)
    const USER_NAME = `justinfan${String(RANDOM_NUMBER).padStart(5, "0")}`
    WEBSOCKET.send(`NICK ${USER_NAME}`)
    WEBSOCKET.send(`USER ${USER_NAME} 8 * :${USER_NAME}`)
    WEBSOCKET.send(`JOIN #${channelID}`)
  })
  WEBSOCKET.addEventListener("message", function (event) {
    const CHAT_LIST = twitchParseMessage(event.data)
    CHAT_LIST.forEach(chat => {
      switch (chat.command) {
        case "PRIVMSG":
          // Parse Emotes
          let emoteReplaceList = []
          for (emoteID in chat.tags.emotes) {
            const EMOTE_POSITIONS = chat.tags.emotes[emoteID]
            EMOTE_POSITIONS.forEach(emotePosition => {
              emoteReplaceList.push({
                id: emoteID,
                start: emotePosition.start,
                end: emotePosition.end,
              })
            })
          }
          emoteReplaceList.sort((a, b) => {
            if (a.start > b.start) {
              return -1
            } else {
              return 1
            }
          })
          // Replace Emote string => Emote image
          let message = chat.params[1]
          message = message.replaceAll(/^\x01|\x01$/g, "") // 特殊文字削除
          message = message.replace(/^ACTION /, "")// Action削除
          let sliceMessage = [...message]

          for (let index = 0; index < emoteReplaceList.length; index++) {
            const EMOTE = emoteReplaceList[index]
            sliceMessage.splice(EMOTE.start, EMOTE.end - EMOTE.start + 1, `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${EMOTE.id}/default/light/1.0">`)
          }

          console.log(`WebSocket Message(${chat.params[0]}):\n`, chat)
          addMessage(new Date().getTime(), "", chat.prefix.nick, sliceMessage.join(""), chat.params[0], "twitch")
          break;
        case "PING":
          WEBSOCKET.send("PONG")
          break
      }
    })
  })
  WEBSOCKET.addEventListener("close", function (event) {
    console.log(`WebSocket Close(#${channelID}):\n`, event)
  })
  WEBSOCKET.addEventListener("error", function (event) {
    console.log(`WebSocket Error(#${channelID}):\n`, event)
  })
})


// Youtube
SEARCH_PARAMS.getAll("youtube").forEach(async (channelID,) => {
  console.log("Youtube: ", channelID)
  const TOKEN = await fetch(`https://live-chat.aatomu.workers.dev?id=${channelID}`).then(res => {
    return res.json()
  }).then(json => {
    return json
  })
  console.log(TOKEN)

  let token = TOKEN
  setInterval(async function () {
    const CHAT_RESPONSE = await fetch(`https://live-chat.aatomu.workers.dev?api_key=${token.api_key}&client_version=${token.client_version}&continuation=${token.continuation}`).then(res => {
      return res.json()
    }).then(json => {
      return json
    })

    if (!CHAT_RESPONSE.continuationContents) {
      return
    }
    const CHAT_CONTENTS = CHAT_RESPONSE.continuationContents.liveChatContinuation

    // Parse Chat Data
    if (CHAT_CONTENTS.actions) {
      const CHAT_LIST = youtubeParseChat(CHAT_CONTENTS.actions, channelID)
      CHAT_LIST.forEach((chat) => {
        const CHAT_OFFSET_TIME = (chat.timestampMilliSecond + 5000) - (new Date().getTime())
        setTimeout(function () {
          let message = ""
          if (chat.superchat != null) {
            message = `<span class="money" style="color:${chat.superchat.textColor} ; background-color: ${chat.superchat.backgroundColor};">${chat.superchat.amount}</span> `
          }
          for (let index = 0; index < chat.message.length; index++) {
            message += chat.message[index].text
          }

          console.log(`Youtube Message(${channelID}):\n`, chat)
          addMessage(chat.timestampMilliSecond, chat.author.image[0].url, chat.author.name, message, channelID, "youtube")
        }, CHAT_OFFSET_TIME)
      })
    }

    // Move Chat Position
    const CONTINUATION_DATA = CHAT_CONTENTS.continuations[0]
    if (CONTINUATION_DATA.invalidationContinuationData) {
      token.continuation = CONTINUATION_DATA.invalidationContinuationData.continuation
    } else if (CONTINUATION_DATA.timedContinuationData) {
      token.continuation = CONTINUATION_DATA.timedContinuationData.continuation
    }
  }, 5000)
})