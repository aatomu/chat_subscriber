// @ts-check
// --- Run in Cloudflare workers.js ---

export default {
  async fetch(request, env, ctx) {
    const SEARCH_PARAMS = new URLSearchParams(new URL(request.url).search)

    // Youtube Channel URL
    if (SEARCH_PARAMS.has("youtube")) {
      const ACCOUNT_URL = `https://www.youtube.com/${SEARCH_PARAMS.get("youtube")}/live`
      return new Response(JSON.stringify(await getYoutubeLiveChatObject(ACCOUNT_URL)), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET'
        }
      })
    }
    // Youtube Limited Member Live
    if (SEARCH_PARAMS.has("watch")) {
      const ACCOUNT_URL = `https://www.youtube.com/watch?v=${SEARCH_PARAMS.get("watch")}`
      return new Response(JSON.stringify(await getYoutubeLiveChatObject(ACCOUNT_URL)), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET'
        }
      })
    }

    if (SEARCH_PARAMS.has("api_key") && SEARCH_PARAMS.has("client_version") && SEARCH_PARAMS.has("continuation")) {
      const CHAT_RESPONSE = await fetch(`https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${SEARCH_PARAMS.get("api_key")}`, {
        method: "POST",
        headers: {
          'Content-Type': "application/json",
        },
        body: JSON.stringify({
          "context": {
            "client": {
              "clientName": "WEB",
              "clientVersion": SEARCH_PARAMS.get("client_version")
            }
          },
          "continuation": SEARCH_PARAMS.get("continuation")
        })
      }).then(res => {
        return res.text()
      }).then(text => {
        return text
      })

      return new Response(CHAT_RESPONSE, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET'
        }
      })
    }
    return new Response('Required /?id=<ChannelID> or ?video_id=<Video ID>&apikey=<API Key>&client_version=<Client Version>&continuation=');
  },
};

async function getYoutubeLiveChatObject(url) {
  const LIVE_INFOMATION = await fetch(url).
    then(res => {
      return res.text()
    }).
    then(body => {
      return body
    })

  let video_id = ""
  const VIDEO_ID_START = LIVE_INFOMATION.indexOf(`rel="canonical" href="https://www\.youtube\.com/watch\?v=`)
  const VIDEO_ID_MATCH = LIVE_INFOMATION.substring(VIDEO_ID_START).match(/watch\?v=([A-Za-z0-9_-].+?)"/)
  if (VIDEO_ID_MATCH) {
    video_id = VIDEO_ID_MATCH[1]
  }

  let api_key = ""
  const API_KEY_START = LIVE_INFOMATION.indexOf(`"innertubeApiKey":"`)
  const API_KEY_MATCH = LIVE_INFOMATION.substring(API_KEY_START).match(/"innertubeApiKey":"(.+?)"/)
  if (API_KEY_MATCH) {
    api_key = API_KEY_MATCH[1]
  }

  let client_version = ""
  const CLIENT_VERSION_START = LIVE_INFOMATION.indexOf(`"clientVersion":"`)
  const CLIENT_VERSION_MATCH = LIVE_INFOMATION.substring(CLIENT_VERSION_START).match(/"clientVersion":"(.+?)"/)
  if (CLIENT_VERSION_MATCH) {
    client_version = CLIENT_VERSION_MATCH[1]
  }

  let continuation = ""
  const CONTINUATION_START = LIVE_INFOMATION.indexOf(`"continuation":"`)
  const CONTINUATION_MATCH = LIVE_INFOMATION.substring(CONTINUATION_START).match(/"continuation":"(.+?)"/)
  if (CONTINUATION_MATCH) {
    continuation = CONTINUATION_MATCH[1]
  }

  let channelName = ""
  if (continuation != "") {
    const PLAYER_OBJECT_START = LIVE_INFOMATION.indexOf(`var ytInitialPlayerResponse =`)
    const PLAYER_OBJECT_MATCH = LIVE_INFOMATION.substring(PLAYER_OBJECT_START).match(/({.+?});/)
    if (PLAYER_OBJECT_MATCH) {
      const PLAYER_OBJECT = JSON.parse(PLAYER_OBJECT_MATCH[1])
      channelName = PLAYER_OBJECT.videoDetails.author
    }
  }

  return {
    video_id: video_id,
    api_key: api_key,
    client_version: client_version,
    continuation: continuation,
    channel_name: channelName,
  }
}