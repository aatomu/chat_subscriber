// @ts-check
/// <reference path="index.js"/>

/**
 * @typedef TwitchTag
 * @type {Object.<string,any>}
*/
/**
 * @typedef IRCPrefix
 * @type {object}
 * @property {string?} nick
 * @property {string?} user
 * @property {string?} host
 * @property {string} raw
*/
/**
 * @typedef TwitchMessage
 * @type {object}
 * @property {TwitchTag} tags
 * @property {IRCPrefix} prefix
 * @property {string} command
 * @property {string[]} params
*/

/**
 * @param {string} channelID Subscribe Twitch streamerID
 */
function twitchSubscribe(channelID) {
  const WEBSOCKET = new WebSocket(TWITCH_IRC_URI)

  // Open twitch IRC(Websocket) connection
  WEBSOCKET.addEventListener("open", function (event) {
    console.log(`Twitch Websocket Open(#${channelID}):`, event)
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
        case "PING":
          WEBSOCKET.send("PONG")
          break
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
              sliceMessage.splice(EMOTE.start, EMOTE.end - EMOTE.start + 1, `<img class="emoji" src="https://static-cdn.jtvnw.net/emoticons/v2/${EMOTE.id}/default/light/1.0">`)
            }
            message = sliceMessage.join("")
          }

          if (chat.tags.bits) {
            message += `<span class="money" style="background-color: var(--twitch);">${chat.tags.bits}Bits</span> `
          }

          let authorName = ""
          switch (true) {
            case (chat.tags["display-name"] != ""):
              authorName = chat.tags["display-name"]
              break
            case (chat.prefix.nick != null):
              authorName = chat.prefix.nick
              break
            case (chat.prefix.user != null):
              authorName = chat.prefix.user
              break
            default:
              authorName = "Unknown"
          }

          console.log(`Twitch WebSocket Message(${chat.params[0]}):`, chat)
          addMessage(new Date().getTime(), "", authorName, message, chat.params[0], "twitch")
          break
      }
    })
  })
}

/**
 * @see https://dev.twitch.tv/docs/irc/example-parser/
 * @param {string} messages Twitch IRC messages(split string: \r\n)
 * @returns {TwitchMessage[]} Twitch parsed messages
 */
function twitchParseMessage(messages) {
  let chatList = []
  messages.split("\r\n").forEach((message) => {
    if (message == "") {
      return
    }
    let chat = {}

    // Tags
    if (message.startsWith("@")) {
      const NEXT_SPACE = message.indexOf(" ")
      const TAGS = message.substring(1, NEXT_SPACE)
      message = message.substring(NEXT_SPACE + 1)
      chat["tags"] = twitchParseTags(TAGS)
    }

    // Prefix
    if (message.startsWith(":")) {
      const NEXT_SPACE = message.indexOf(" ")
      const PREFIX = message.substring(1, NEXT_SPACE)
      message = message.substring(NEXT_SPACE + 1)
      chat.prefix = twitchParsePrefix(PREFIX)
    }

    // IRC-Trailing To IRC-Params
    const SPLIT = message.split(" :", 2)
    chat.params = SPLIT[0].split(" ")
    if (SPLIT.length == 2) {
      chat.params.push(SPLIT[1])
    }

    // IRC-Params To IRC-Command + IRC-Params
    chat.command = chat.params[0].toUpperCase()
    chat.params.shift()

    chatList.push(chat)
  })
  return chatList
}

/**
 * @see https://dev.twitch.tv/docs/irc/tags/#privmsg-tags
 * @param {string} tags Twitch tags string
 * @returns {Object.<string,object>} Twitch tags object
 */

function twitchParseTags(tags) {
  let parsedTags = {}
  const SPLIT_TAGS = tags.split(";")

  SPLIT_TAGS.forEach((tag) => {
    const SPLIT_TAG = tag.split("=", 2)
    let tagValue = null
    if (SPLIT_TAG[1] != "") {
      tagValue = SPLIT_TAG[1]
    }

    switch (SPLIT_TAG[0]) {
      case "badge-info":
      case "badge":
        if (tagValue == null) {
          parsedTags[SPLIT_TAG[0]] = null
          break
        }

        let badgeDict = {}
        const BADGES = tagValue.split(",")
        BADGES.forEach((pair) => {
          const BADGE_PARTS = pair.split("/", 2)
          badgeDict[BADGE_PARTS[0]] = BADGE_PARTS[1]
        })

        parsedTags[SPLIT_TAG[0]] = badgeDict
        break
      case "emotes":
        if (tagValue == null) {
          parsedTags[SPLIT_TAG[0]] = null
          break
        }

        let emoteDict = {}
        const EMOTES = tagValue.split("/")
        EMOTES.forEach((emote) => {
          const EMOTE_PARTS = emote.split(":")
          let textPositions = []

          const POSITIONS = EMOTE_PARTS[1].split(",")
          POSITIONS.forEach((position) => {
            const POSITION_PARTS = position.split("-", 2)
            textPositions.push({
              start: parseInt(POSITION_PARTS[0]),
              end: parseInt(POSITION_PARTS[1])
            })
          })
          emoteDict[EMOTE_PARTS[0]] = textPositions
        })
        parsedTags[SPLIT_TAG[0]] = emoteDict
        break
      case "emote-sets":
        if (tagValue == null) {
          parsedTags[SPLIT_TAG[0]] = null
          break
        }
        const EMOTE_SET_IDS = tagValue.split(",")
        parsedTags[SPLIT_TAG[0]] = EMOTE_SET_IDS
        break
      default:
        parsedTags[SPLIT_TAG[0]] = tagValue
    }
  })

  return parsedTags
}

/**
 * @see https://datatracker.ietf.org/doc/html/rfc1459#section-2.3.1
 * @param {string} prefix IRC prefix string
 * @returns {IRCPrefix} IRC prefix object
 */
function twitchParsePrefix(prefix) {
  let parsedPrefix = {}
  const SPLIT_PREFIX = prefix.split(/!|@/)

  switch (SPLIT_PREFIX.length) {
    case 1:
      parsedPrefix["host"] = SPLIT_PREFIX[0]
      break
    case 2:
      parsedPrefix["nick"] = SPLIT_PREFIX[0]
      parsedPrefix["host"] = SPLIT_PREFIX[1]
      break
    case 3:
      parsedPrefix["nick"] = SPLIT_PREFIX[0]
      parsedPrefix["user"] = SPLIT_PREFIX[1]
      parsedPrefix["host"] = SPLIT_PREFIX[2]
      break
  }
  parsedPrefix["raw"] = prefix

  return parsedPrefix
}
