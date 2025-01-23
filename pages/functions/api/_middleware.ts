interface Env {}

export const onRequestGet: PagesFunction<Env> = async (context): Promise<Response> => {
  const request: Request = context.request;

  const REQUEST_PATH = new URL(request.url).pathname.split("/");
  //const REQUEST_EntryPoint = REQUEST_PATH[1];
  const REQUEST_SITE = REQUEST_PATH[2];
  const REQUEST_API = REQUEST_PATH[3];
  const SEARCH_PARAMS = new URLSearchParams(new URL(request.url).search);
  console.log(`
    Date:${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}\n
    URL: "${request.url}"\n
    Target:"${REQUEST_SITE}"\n  API:"${REQUEST_API}"`);

  switch (REQUEST_SITE) {
    case "youtube":
      switch (REQUEST_API) {
        case "channel": {
          // https://..../youtube/channel?id=xxxxx
          const ID = SEARCH_PARAMS.get("id");
          if (!ID) {
            break;
          }

          const info = await youtubeGetApiKeys(`https://www.youtube.com/${ID}/live`, request.headers.get("Cookie"));
          let header = new Headers({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
          });
          info.headers.forEach((v) => {
            header.append("Set-Cookie", v);
          });

          return new Response(JSON.stringify(info.api), {
            headers: header,
          });
        }
        case "watch": {
          // https://..../youtube/watch?id=xxxxx
          const ID = SEARCH_PARAMS.get("id");
          if (!ID) {
            break;
          }

          const info = await youtubeGetApiKeys(`https://www.youtube.com/watch?v=${ID}`, request.headers.get("Cookie"));
          return new Response(JSON.stringify(info.api), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
            },
          });
        }
        case "get_chat": {
          // https://..../youtube/get_chat?api_key=xxxxx&client_version=xxxxx&continuation=xxxxx
          const API_KEY = SEARCH_PARAMS.get("api_key");
          const CLIENT_VERSION = SEARCH_PARAMS.get("client_version");
          const CONTINUATION = SEARCH_PARAMS.get("continuation");
          if (!API_KEY || !CLIENT_VERSION || !CONTINUATION) {
            break;
          }

          return new Response(await youtubeGetLiveChat(API_KEY, CLIENT_VERSION, CONTINUATION), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
            },
          });
        }
      }
      break;
    case "niconico":
      switch (REQUEST_API) {
        case "channel": {
          // https://..../niconico/channel?id=xxxxx
          const ID = SEARCH_PARAMS.get("id");
          if (!ID) {
            break;
          }

          return new Response(JSON.stringify(await niconicoGetApiKeys(ID)), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
            },
          });
        }
        case "name": {
          // https://..../niconico/name?id=xxxxx
          const ID = SEARCH_PARAMS.get("id");
          if (!ID) {
            break;
          }
          return new Response(JSON.stringify(await niconicoGetUsername(ID)), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
            },
          });
        }
      }
      break;
    case "twicas":
      switch (REQUEST_API) {
        case "channel": {
          // https://..../twicas/channel?id=xxxxx
          const ID = SEARCH_PARAMS.get("id");
          if (!ID) {
            break;
          }
          return new Response(JSON.stringify(await twicasGetLiveChat(ID)), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
            },
          });
        }
      }
      break;
    case "openrec":
      switch (REQUEST_API) {
        case "channel": {
          // https://..../openrec/channel?id=xxxx
          const ID = SEARCH_PARAMS.get("id");
          if (!ID) {
            break;
          }
          return new Response(JSON.stringify(await openrecGetLiveChat(ID)), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
            },
          });
        }
      }
  }
  return ErrorResponse();
};

function ErrorResponse() {
  return new Response("Check https://github.com/aatomu/chat_subscriber/blob/main/worker.ts");
}

async function youtubeGetApiKeys(url: string, cookie: string) {
  const LIVE_RESPONSE = await fetch(url, {
    headers: {
      Cookie: cookie,
    },
  });
  const LIVE_INFORMATION = await LIVE_RESPONSE.text();

  let video_id = "";
  const VIDEO_ID_START = LIVE_INFORMATION.indexOf(`rel="canonical" href="https://www\.youtube\.com/watch\?v=`);
  const VIDEO_ID_MATCH = LIVE_INFORMATION.substring(VIDEO_ID_START).match(/watch\?v=([A-Za-z0-9_-].+?)"/);
  if (VIDEO_ID_MATCH) {
    video_id = VIDEO_ID_MATCH[1];
  }

  let api_key = "";
  const API_KEY_START = LIVE_INFORMATION.indexOf(`"innertubeApiKey":`);
  const API_KEY_MATCH = LIVE_INFORMATION.substring(API_KEY_START).match(/"innertubeApiKey":"(.+?)"/);
  if (API_KEY_MATCH) {
    api_key = API_KEY_MATCH[1];
  }

  let client_version = "";
  const CLIENT_VERSION_START = LIVE_INFORMATION.indexOf(`"clientVersion":`);
  const CLIENT_VERSION_MATCH = LIVE_INFORMATION.substring(CLIENT_VERSION_START).match(/"clientVersion":"(.+?)"/);
  if (CLIENT_VERSION_MATCH) {
    client_version = CLIENT_VERSION_MATCH[1];
  }

  let continuation = "";
  const CONTINUATION_START = LIVE_INFORMATION.indexOf(`"continuation":`);
  const CONTINUATION_MATCH = LIVE_INFORMATION.substring(CONTINUATION_START).match(/"continuation":"(.+?)"/);
  if (CONTINUATION_MATCH) {
    continuation = CONTINUATION_MATCH[1];
  }

  let channelName = "";
  if (continuation != "") {
    const PLAYER_OBJECT_START = LIVE_INFORMATION.indexOf(`var ytInitialPlayerResponse =`);
    const PLAYER_OBJECT_MATCH = LIVE_INFORMATION.substring(PLAYER_OBJECT_START).match(/({.+?});/);
    if (PLAYER_OBJECT_MATCH) {
      const PLAYER_OBJECT = JSON.parse(PLAYER_OBJECT_MATCH[1]);
      channelName = PLAYER_OBJECT.videoDetails.author;
    }
  }

  return {
    headers: LIVE_RESPONSE.headers.getAll("Set-Cookie").map((v) => {
      return v.replace(/domain=\.youtube\.com; /i, "");
    }),
    api: {
      video_id: video_id,
      api_key: api_key,
      client_version: client_version,
      continuation: continuation,
      channel_name: channelName,
    },
  };
}

async function youtubeGetLiveChat(api_key: string, client_version: string, continuation: string) {
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

async function niconicoGetApiKeys(id: string) {
  const RES = await fetch(`https://live.nicovideo.jp/watch/user/${id}`)
    .then((res) => {
      return res.text();
    })
    .then((text) => {
      return text;
    });

  let watchWebsocketURL = "";
  let channelName = "";
  const EMBED_DATA_START = RES.indexOf(`data-props=`);
  const EMBED_DATA_MATCH = RES.substring(EMBED_DATA_START).match(/"(.+?)"/);
  if (EMBED_DATA_MATCH) {
    const EMBED_OBJECT = JSON.parse(EMBED_DATA_MATCH[1].replace(/&quot;/g, `"`));
    watchWebsocketURL = EMBED_OBJECT.site.relive.webSocketUrl;
    channelName = EMBED_OBJECT.program.supplier.name;
  }

  return {
    watch_websocket_url: watchWebsocketURL,
    channel_name: channelName,
  };
}

async function niconicoGetUsername(id: string) {
  const RES = await fetch(`https://www.nicovideo.jp/user/${id}`)
    .then((res) => {
      return res.text();
    })
    .then((text) => {
      return text;
    });

  let channelName = "";
  const CHANNEL_NAME_START = RES.indexOf(`"name":"`);
  const CHANNEL_NAME_MATCH = RES.substring(CHANNEL_NAME_START).match(/"name":"(.+?)"/);
  if (CHANNEL_NAME_MATCH) {
    channelName = CHANNEL_NAME_MATCH[1];
  }

  // Author icon check
  let idSlice = id.substring(0, id.length - 4);
  if (!idSlice) {
    idSlice = "0";
  }
  let iconURL = `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${idSlice}/${id}.jpg`;
  const IS_AUTHOR_ICON_USEABLE = await fetch(iconURL).then((res) => {
    return res.ok;
  });
  if (!IS_AUTHOR_ICON_USEABLE) {
    iconURL = "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg";
  }

  return {
    channel_name: channelName,
    icon_url: iconURL,
  };
}

type TwicasSubscribeResponse = {
  url: string;
};

async function twicasGetLiveChat(id: string) {
  const LIVE_INFORMATION = await fetch(`https://twitcasting.tv/${id}`).then((res) => {
    return res.text();
  });

  let movieID = "";
  const MOVIE_ID_START = LIVE_INFORMATION.indexOf("data-movie-id=");
  const MOVIE_ID_MATCH = LIVE_INFORMATION.substring(MOVIE_ID_START).match(/data-movie-id="(.+?)"/);
  if (MOVIE_ID_MATCH) {
    movieID = MOVIE_ID_MATCH[1];
  }

  let channelName = "";
  const CHANNEL_NAME_START = LIVE_INFORMATION.indexOf("data-name=");
  const CHANNEL_NAME_MATCH = LIVE_INFORMATION.substring(CHANNEL_NAME_START).match(/data-name="(.+?)"/);
  if (CHANNEL_NAME_MATCH) {
    channelName = CHANNEL_NAME_MATCH[1];
  }

  let websocketUrl = "";
  const FORM_BODY = new FormData();
  FORM_BODY.append("movie_id", movieID);
  const INFORMATION: TwicasSubscribeResponse = await fetch("https://twitcasting.tv/eventpubsuburl.php", { method: "POST", body: FORM_BODY }).then((res) => {
    return res.json();
  });
  if (INFORMATION) {
    websocketUrl = INFORMATION.url;
  }

  return {
    movie_id: movieID,
    channel_name: channelName,
    websocket_url: websocketUrl,
  };
}

type OpenrecResponse = {
  movie_id: number;
  channel: OpenrecChannel;
};

type OpenrecChannel = {
  nickname: string;
};

async function openrecGetLiveChat(id: string) {
  const LIVE_INFORMATION: OpenrecResponse = await fetch(`https://public.openrec.tv/external/api/v5/movies/${id}`).then((res) => {
    return res.json();
  });

  return {
    movie_id: LIVE_INFORMATION.movie_id,
    channel_name: LIVE_INFORMATION.channel.nickname,
  };
}
