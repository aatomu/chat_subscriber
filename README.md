# chat_subscriber
複数のLive配信のチャットを接続する

## How To Use
Example URL:  
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>`
* `https://live.aatomu.work/?twitch=<Twitch Channel ID>`
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>&twitch=<Twitch Channel ID>&limit=10`
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>&youtube=<Twitch Channel ID>&limit=10`

| Key | Value | Description |
| :- | :- | :- |
| youtube | YoutubeのChannelID(@ProjectCBW) | 読み込むYoutube配信のチャンネル |
| twitch | TwitchのChannelID(projectcbw) | 読み込むTwitch配信のチャンネル |
| limit | number | 同時に表示するメッセージの最大数 |

OBS Custom CSS:
```css
body {
    background-color: rgba(0,0,0,0);
    overflow: hidden;
}
```

## Credit
License: `Apache License`
※ できたら URLを張っていただけると幸いです
* Code
  * [aatomu(@aatomu)](https://x.com/aatomu21263): HTML&JavaScript and CSS
* Design
  * [椛野りあ(@KuoN_aLia)](https://x.com/KuoN_aLia): Default CSS
* Special Thanks
  * [ProjectCBW(@ProjectCBW)](https://x.com/ProjectCBW): Live test
  * Others: Text test and Design test