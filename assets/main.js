// @ts-check

// constant values
const SEARCH_PARAMS = new URLSearchParams(window.location.search)
let charCountLimitString = SEARCH_PARAMS.get("limit")
if (charCountLimitString == null) {
  charCountLimitString = "20"
}
const CHAT_COUNT_LIMIT = parseInt(charCountLimitString)
const CHAT_CLEANUP_TIME = SEARCH_PARAMS.get("cleanup")

// develop message
if (SEARCH_PARAMS.size == 0) {
  addMessage(0, "https://pbs.twimg.com/profile_images/1480130282099740684/uNSmGF1F_400x400.jpg", "aatomu", `How To Use:
  /?youtube=@ChannelID&twitch=ChannelID&limit=ChatLimit&clenup=CleanupDelay
  More Information: <a href="https://github.com/aatomu/chat_subscriber">Github</a>`, "#develop-message", "youtube")
}

// Youtube Channel
SEARCH_PARAMS.getAll("youtube").forEach(async (channelID,) => {
  console.log("Youtube: ", channelID)
  const TOKEN = await fetch(`https://live-chat.aatomu.workers.dev?youtube=${channelID}`).then(res => {
    return res.json()
  }).then(json => {
    return json
  })
  console.log(TOKEN)
  if (TOKEN.continuation == "") {
    addMessage(0,"","ERROR","This channelID live not found",channelID,"youtube")
    return
  }

  youtubeSubscribe(TOKEN)
})

// Youtube Limited Live
SEARCH_PARAMS.getAll("watch").forEach(async (channelID,) => {
  console.log("Youtube Limited: ", channelID)
  const TOKEN = await fetch(`https://live-chat.aatomu.workers.dev?watch=${channelID}`).then(res => {
    return res.json()
  }).then(json => {
    return json
  })
  console.log(TOKEN)
  if (TOKEN.continuation == "") {
    addMessage(0,"","ERROR","This channelID live not found",channelID,"youtube")
    return
  }

  youtubeSubscribe(TOKEN)
})

// Twitch Channel
const TWITCH_IRC_URI = "wss://irc-ws.chat.twitch.tv:443"
SEARCH_PARAMS.getAll("twitch").forEach((channelID) => {
  // Information
  console.log("Twtich: ", channelID)
  const WEBSOCKET = new WebSocket(TWITCH_IRC_URI)

  // Open twitch IRC(Websocket) connection
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

  // Recive message
  WEBSOCKET.addEventListener("message", function (event) {
    const CHAT_LIST = twitchParseMessage(event.data)
    CHAT_LIST.forEach(chat => {
      switch (chat.command) {
        case "PRIVMSG":
          let message = chat.params[1]
          if (chat.tags.emotes) {
            // Parse emotes
            let emoteReplaceList = []
            const EMOTE_ID_LIST = Object.keys(chat.tags.emotes)
            for (let index = 0; index < EMOTE_ID_LIST.length; index++) {
              const EMOTE_ID = EMOTE_ID_LIST[index]
              const EMOTE_POSITIONS = chat.tags.emotes[EMOTE_ID]
              EMOTE_POSITIONS.forEach(emotePosition => {
                emoteReplaceList.push({
                  id: EMOTE_ID,
                  start: emotePosition.start,
                  end: emotePosition.end,
                })
              })
            }
            // Sort by end
            emoteReplaceList.sort((a, b) => {
              if (a.start > b.start) {
                return -1
              } else {
                return 1
              }
            })
            // Replace emote string => Emote image
            message = message.replace(/^\x01|\x01$/g, "") // Delete special character set
            message = message.replace(/^ACTION /, "")// Delete action
            let sliceMessage = [...message]

            for (let index = 0; index < emoteReplaceList.length; index++) {
              const EMOTE = emoteReplaceList[index]
              sliceMessage.splice(EMOTE.start, EMOTE.end - EMOTE.start + 1, `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${EMOTE.id}/default/light/1.0">`)
            }
            message = sliceMessage.join("")
          }

          console.log(`WebSocket Message(${chat.params[0]}):\n`, chat)
          let authorName = "Unknown"
          if (chat.prefix.nick) {
            authorName = chat.prefix.nick
          }
          if (chat.tags.bits) {
            message += `<span class="money" style="background-color: var(--twitch);">${chat.tags.bits}Bits</span>`
          }

          addMessage(new Date().getTime(), "", authorName, message, chat.params[0], "twitch")
          break
        case "PING":
          WEBSOCKET.send("PONG")
          break
      }
    })
  })
})




function youtubeSubscribe(token,) {
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
      const CHAT_LIST = youtubeParseChat(CHAT_CONTENTS.actions)
      CHAT_LIST.forEach((chat) => {
        const CHAT_OFFSET_TIME = (chat.timestampMilliSecond + 5000) - (new Date().getTime())
        setTimeout(function () {
          let message = ""
          if (chat.superchat) {
            message = `<span class="money" style="color:${chat.superchat.textColor} ; background-color: ${chat.superchat.backgroundColor};">${chat.superchat.amount}</span> `
          }
          if (chat.message) {
            for (let index = 0; index < chat.message.length; index++) {
              const MESSAGE = chat.message[index]
              if (MESSAGE.image) {
                message += `<img src="${MESSAGE.image.pop().url}">`
                continue
              }
              message += chat.message[index].text
            }
          }
          console.log(`Youtube Message(${token.user_name}):\n`, chat)
          addMessage(chat.timestampMilliSecond, chat.author.image[0].url, chat.author.name, message, token.channel_name, "youtube")
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
}