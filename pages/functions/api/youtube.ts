interface YoutubeApiKeys {
  channelName: string;
  videoId: string;
  apiKey: string;
  clientVersion: string;
  continuation: string;
}

class Youtube {
  async getApiKeys(url: string): Promise<YoutubeApiKeys | undefined> {
    const LIVE_INFORMATION = await fetch(url).then((res) => {
      return res.text();
    });

    let result: YoutubeApiKeys;

    const CHANNEL_NAME_START = LIVE_INFORMATION.indexOf(`http://schema.org/Person`);
    const CHANNEL_NAME_MATCH = LIVE_INFORMATION.substring(CHANNEL_NAME_START).match(/itemprop="name" content="(.+?)">/);
    if (CHANNEL_NAME_MATCH) {
      result.channelName = CHANNEL_NAME_MATCH[1];
    } else {
      undefined;
    }

    const VIDEO_ID_START = LIVE_INFORMATION.indexOf(`rel="canonical" href="https://www\.youtube\.com/watch\?v=`);
    const VIDEO_ID_MATCH = LIVE_INFORMATION.substring(VIDEO_ID_START).match(/watch\?v=([A-Za-z0-9_-].+?)"/);
    if (VIDEO_ID_MATCH) {
      result.videoId = VIDEO_ID_MATCH[1];
    } else {
      return undefined;
    }

    const API_KEY_START = LIVE_INFORMATION.indexOf(`"innertubeApiKey":`);
    const API_KEY_MATCH = LIVE_INFORMATION.substring(API_KEY_START).match(/"innertubeApiKey":"(.+?)"/);
    if (API_KEY_MATCH) {
      result.apiKey = API_KEY_MATCH[1];
    } else {
      return undefined;
    }

    const CLIENT_VERSION_START = LIVE_INFORMATION.indexOf(`"clientVersion":`);
    const CLIENT_VERSION_MATCH = LIVE_INFORMATION.substring(CLIENT_VERSION_START).match(/"clientVersion":"(.+?)"/);
    if (CLIENT_VERSION_MATCH) {
      result.clientVersion = CLIENT_VERSION_MATCH[1];
    } else {
      return undefined;
    }

    const CONTINUATION_START = LIVE_INFORMATION.indexOf(`"continuation":`);
    const CONTINUATION_MATCH = LIVE_INFORMATION.substring(CONTINUATION_START).match(/"continuation":"(.+?)"/);
    if (CONTINUATION_MATCH) {
      result.continuation = CONTINUATION_MATCH[1];
    } else {
      return undefined;
    }

    return result;
  }

  async getLiveChat(api_key: string, client_version: string, continuation: string) {
    const LIVE_CHATS = await fetch(`https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${api_key}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: client_version,
          },
        },
        continuation: continuation,
      }),
    })
      .then((res) => {
        return res.text();
      })
      .then((text) => {
        return text;
      });
    return LIVE_CHATS;
  }
}
