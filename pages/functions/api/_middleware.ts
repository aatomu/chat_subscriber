interface Env {}

const youtube = new Youtube();

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

          const keys = await (async () => {
            for (let retried = 0; retried < 10; retried++) {
              const keys = await youtube.getApiKeys(`https://www.youtube.com/${ID}/live`);
              if (!keys) {
                await sleep(5000);
                continue;
              }
              return keys;
            }
            return undefined;
          })();

          return new Response(JSON.stringify(keys), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
            },
          });
        }
        case "watch": {
          // https://..../youtube/watch?id=xxxxx
          const ID = SEARCH_PARAMS.get("id");
          if (!ID) {
            break;
          }

          const keys = await (async () => {
            for (let retried = 0; retried < 10; retried++) {
              const keys = await youtube.getApiKeys(`https://www.youtube.com/watch?v=${ID}`);
              if (!keys) {
                await sleep(5000);
                continue;
              }
              return keys;
            }
            return undefined;
          })();

          return new Response(JSON.stringify(keys), {
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

          return new Response(await youtube.getLiveChat(API_KEY, CLIENT_VERSION, CONTINUATION), {
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

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
