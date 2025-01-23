interface apiResponse {
  movie_id: number;
  channel: {
    nickname: string;
  };
}

interface apiKeys {
  channelName: string;
  movieId: number;
}

export async function getLiveChat(id: string): Promise<apiKeys | undefined> {
  const LIVE_INFORMATION: apiResponse = await fetch(`https://public.openrec.tv/external/api/v5/movies/${id}`).then((res) => {
    return res.json();
  });

  if (!LIVE_INFORMATION.channel || !LIVE_INFORMATION.movie_id) {
    return undefined;
  }

  return {
    channelName: LIVE_INFORMATION.channel.nickname,
    movieId: LIVE_INFORMATION.movie_id,
  };
}
