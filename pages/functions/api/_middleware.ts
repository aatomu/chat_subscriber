interface Env {}

import * as youtube from "./youtube";
import * as niconico from "./niconico";
import * as twicas from "./twicas";
import * as openrec from "./openrec";

export const onRequestGet: PagesFunction<Env> = async (context): Promise<Response> => {
  const request: Request = context.request;

  const REQUEST_PATH = new URL(request.url).pathname.split("/");
  //const REQUEST_EntryPoint = REQUEST_PATH[1];
  const REQUEST_SITE = REQUEST_PATH[2];
  const REQUEST_API = REQUEST_PATH[3];
  const SEARCH_PARAMS = new URLSearchParams(new URL(request.url).search);
  console.log(`Date:${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}, URL: "${request.url}", Target:"${REQUEST_SITE}"\n  API:"${REQUEST_API}"`);

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
              console.log(`retried: ${retried}, keys: ${keys}`);
              if (!keys) {
                await sleep(10000);
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

          return new Response(JSON.stringify(await niconico.getApiKeys(ID)), {
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

          return new Response(JSON.stringify(await niconico.getUsername(ID)), {
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

          return new Response(JSON.stringify(await twicas.getLiveChat(ID)), {
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

          return new Response(JSON.stringify(await openrec.getLiveChat(ID)), {
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

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
