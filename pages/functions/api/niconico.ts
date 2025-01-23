interface apiKeys {
  channelName: string;
  websocketUrl: string;
}

interface channel {
  channelName: string;
  iconUrl: string;
}

export async function getApiKeys(id: string): Promise<apiKeys | undefined> {
  const LIVE_INFORMATION = await fetch(`https://live.nicovideo.jp/watch/user/${id}`).then((res) => {
    return res.text();
  });

  let result: apiKeys = {
    channelName: "",
    websocketUrl: "",
  };

  const EMBED_DATA_START = LIVE_INFORMATION.indexOf(`data-props=`);
  const EMBED_DATA_MATCH = LIVE_INFORMATION.substring(EMBED_DATA_START).match(/"(.+?)"/);
  if (EMBED_DATA_MATCH) {
    const EMBED_OBJECT = JSON.parse(EMBED_DATA_MATCH[1].replace(/&quot;/g, `"`));
    result.channelName = EMBED_OBJECT.program.supplier.name;
    result.websocketUrl = EMBED_OBJECT.site.relive.webSocketUrl;
  } else {
    return undefined;
  }

  return result;
}

export async function getUsername(id: string): Promise<channel> {
  const USER = await fetch(`https://www.nicovideo.jp/user/${id}`).then((res) => {
    return res.text();
  });

  let result: channel = {
    channelName: "unknown",
    iconUrl: "",
  };
  const CHANNEL_NAME_START = USER.indexOf(`"name":"`);
  const CHANNEL_NAME_MATCH = USER.substring(CHANNEL_NAME_START).match(/"name":"(.+?)"/);
  if (CHANNEL_NAME_MATCH) {
    result.channelName = CHANNEL_NAME_MATCH[1];
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

  return result;
}
