function youtubeParseChat(actions, channelID) {
  let chatList = []
  actions.forEach(action => {
    const RENDERER = actionToRenderer(action)
    if (!RENDERER) {
      return
    }

    let messageList = []
    if ("message" in RENDERER) {
      const MESSAGE_RUNS = RENDERER.message.runs
      for (let index = 0; index < MESSAGE_RUNS.length; index++) {
        const RUN = MESSAGE_RUNS[index]
        if (RUN.text) {
          messageList.push({
            text: RUN.text
          })
          continue
        }
        if (RUN.emoji) {
          const IS_CUSTOM_EMOJI = RUN.emoji.isCustomEmoji
          messageList.push({
            text: IS_CUSTOM_EMOJI ? RUN.emoji.shortcuts[0] : RUN.emoji.emojiId,
            isCustomEmoji: IS_CUSTOM_EMOJI,
            image: RUN.emoji.image.thumbnails
          })
        }
      }
    }

    let authorName = ""
    if (RENDERER.authorName) {
      authorName = RENDERER.authorName.simpleText
    }

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
              icon: BADGE.customThumbnail.thumbnails
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
          label: RENDERER.sticker.accessibility.accessibilityData.label
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