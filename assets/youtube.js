// @ts-check

/**
 * @typedef YoutubeAuthor
 * @type {object}
 * @property {string} name Author screen name
 * @property {string} id Author id
 * @property {object[]} image Author image list
 * @property {YoutubeMembership?} membership Author membership information
 */
/**
 * @typedef YoutubeMembership
 * @type {object}
 * @property {string} label Membership label
 * @property {YoutubeImage[]} image Membership icon image list
 */
/**
 * @typedef YoutubeMessageData
 * @type {object}
 * @property {string} text Text or emojiID or emojiText
 * @property {boolean?} isCustomEmoji
 * @property {YoutubeImage[]?} image Emoji image list
 */
/**
 * @typedef YoutubeSuperchat
 * @type {object}
 * @property {string} amount Superchat amount
 * @property {string} textColor Superchat text color
 * @property {string} backgroundColor Superchat background color
 * @property {YoutubeSticker?} sticker Superchat sticker information
 */
/**
 * @typedef YoutubeSticker
 * @type {object}
 * @property {YoutubeImage[]} image Sticker image list
 * @property {string} label Sticker label/text
 */
/**
 * @typedef YoutubeImage
 * @type {object}
 * @property {string} url Image url
 * @property {number} height Image height
 * @property {number} width Image width
 */
/**
 * @typedef YoutubeMessage
 * @type {object}
 * @property {YoutubeAuthor} author Author information
 * @property {YoutubeMessageData[]?} message Message informations
 * @property {YoutubeSuperchat?} superchat Superchat information
 * @property {boolean} isMembership Author joined membership?
 * @property {boolean} isOwner Author is owner(is liver)?
 * @property {boolean} isModerator Author is moderator(have wrench)?
 * @property {boolean} isVerified Author is verified?
 * @property {number} timestampMilliSecond Message send timestamp milli seconds(UTC)
*/

/**
 * @param {object} actions Youtube live chat actions/messages
 * @returns {YoutubeMessage[]} Youtube parsed messages
 */
function youtubeParseChat(actions) {
  let chatList = []
  actions.forEach(action => {
    const RENDERER = actionToRenderer(action)
    if (!RENDERER) {
      return
    }

    /**
     * @type {YoutubeMessageData[]}
     */
    let messageList = []
    if ("message" in RENDERER) {
      const MESSAGE_RUNS = RENDERER.message.runs
      for (let index = 0; index < MESSAGE_RUNS.length; index++) {
        const RUN = MESSAGE_RUNS[index]
        if (RUN.text) {
          messageList.push({
            text: RUN.text,
            isCustomEmoji: null,
            image: null,
          })
          continue
        }
        if (RUN.emoji) {
          const IS_CUSTOM_EMOJI = RUN.emoji.isCustomEmoji
          messageList.push({
            text: IS_CUSTOM_EMOJI ? RUN.emoji.shortcuts[0] : RUN.emoji.emojiId,
            isCustomEmoji: IS_CUSTOM_EMOJI,
            image: RUN.emoji.image.thumbnails,
          })
        }
      }
    }

    let authorName = ""
    if (RENDERER.authorName) {
      authorName = RENDERER.authorName.simpleText
    }

    /**
     * @type {YoutubeMessage}
     */
    const CHAT = {
      author: {
        name: authorName,
        id: RENDERER.authorExternalChannelId,
        image: RENDERER.authorPhoto.thumbnails,
        membership: null
      },
      message: messageList,
      superchat: null,

      isMembership: false,
      isOwner: false,
      isModerator: false,
      isVerified: false,
      timestampMilliSecond: Math.floor(RENDERER.timestampUsec / 1000),
    }

    // Badge
    if (RENDERER.authorBadges) {
      RENDERER.authorBadges.forEach(badgeData => {
        const BADGE = badgeData.liveChatAuthorBadgeRenderer
        switch (true) {
          case BADGE.tooltip.includes("Owner") || BADGE.tooltip.includes("所有者"):
            CHAT.isOwner = true
            break
          case BADGE.tooltip.includes("Moderator") || BADGE.tooltip.includes("モデレーター"):
            CHAT.isModerator = true
            break
          case BADGE.tooltip.includes("Verified") || BADGE.tooltip.includes("確認済み"):
            CHAT.isVerified = true
            break
          case BADGE.tooltip.includes("Member"):
            CHAT.author.membership = {
              label: BADGE.tooltip,
              image: BADGE.customThumbnail.thumbnails,
            }
            CHAT.isMembership = true
            break
        }
      })
    }
    // Super Chat
    if (RENDERER.sticker) {
      console.log(RENDERER)
      let textColor = "#000000"
      if (RENDERER.bodyTextColor) {
        textColor = numToHexColor(RENDERER.bodyTextColor)
      }
      let backgroundColor = "#FFFFFF"
      if (RENDERER.backgroundColor) {
        backgroundColor = numToHexColor(RENDERER.backgroundColor)
      }
      if (RENDERER.bodyBackgroundColor) {
        backgroundColor = numToHexColor(RENDERER.bodyBackgroundColor)
      }

      CHAT.superchat = {
        amount: RENDERER.purchaseAmountText.simpleText,
        textColor: textColor,
        backgroundColor: backgroundColor,
        sticker: {
          image: RENDERER.sticker.thumbnails,
          label: RENDERER.sticker.accessibility.accessibilityData.label,
        }
      }
    } else if (RENDERER.purchaseAmountText) {
      console.log(RENDERER)
      let textColor = "#000000"
      if (RENDERER.bodyTextColor) {
        textColor = numToHexColor(RENDERER.bodyTextColor)
      }
      let backgroundColor = "#FFFFFF"
      if (RENDERER.backgroundColor) {
        backgroundColor = numToHexColor(RENDERER.backgroundColor)
      }
      if (RENDERER.bodyBackgroundColor) {
        backgroundColor = numToHexColor(RENDERER.bodyBackgroundColor)
      }

      CHAT.superchat = {
        amount: RENDERER.purchaseAmountText.simpleText,
        textColor: textColor,
        backgroundColor: backgroundColor,
        sticker: null,
      }
    }

    chatList.push(CHAT)
  })
  return chatList
}

function actionToRenderer(action) {
  if (!action.addChatItemAction) {
    return null
  }
  const ITEM = action.addChatItemAction.item

  if (ITEM.liveChatTextMessageRenderer) {
    return ITEM.liveChatTextMessageRenderer
  }
  if (ITEM.liveChatPaidMessageRenderer) {
    return ITEM.liveChatPaidMessageRenderer
  }
  if (ITEM.liveChatPaidStickerRenderer) {
    return ITEM.liveChatPaidStickerRenderer
  }
  if (ITEM.liveChatMembershipItemRenderer) {
    return ITEM.liveChatMembershipItemRenderer
  }
  return null
}

function numToHexColor(num = 0) {
  return `#${num.toString(16).slice(2).toLocaleUpperCase()}`
}