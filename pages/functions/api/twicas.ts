interface subscribeResponse {
  url: string;
}

interface apiKeys {
  channelName: string;
  movieId: string;
  websocketUrl: string;
}

export async function getLiveChat(id: string): Promise<apiKeys | undefined> {
  const LIVE_INFORMATION = await fetch(`https://twitcasting.tv/${id}`).then((res) => {
    return res.text();
  });

  let result: apiKeys = {
    channelName: "",
    movieId: "",
    websocketUrl: "",
  };

  const CHANNEL_NAME_START = LIVE_INFORMATION.indexOf("data-name=");
  const CHANNEL_NAME_MATCH = LIVE_INFORMATION.substring(CHANNEL_NAME_START).match(/data-name="(.+?)"/);
  if (CHANNEL_NAME_MATCH) {
    result.channelName = CHANNEL_NAME_MATCH[1];
  } else {
    return undefined;
  }

  const MOVIE_ID_START = LIVE_INFORMATION.indexOf("data-movie-id=");
  const MOVIE_ID_MATCH = LIVE_INFORMATION.substring(MOVIE_ID_START).match(/data-movie-id="(.+?)"/);
  if (MOVIE_ID_MATCH) {
    result.movieId = MOVIE_ID_MATCH[1];
  } else {
    return undefined;
  }

  const FORM_BODY = new FormData();
  FORM_BODY.append("movie_id", result.movieId);
  const INFORMATION: subscribeResponse = await fetch("https://twitcasting.tv/eventpubsuburl.php", { method: "POST", body: FORM_BODY }).then((res) => {
    return res.json();
  });
  if (INFORMATION) {
    result.websocketUrl = INFORMATION.url;
  } else {
    return undefined;
  }

  return result;
}
