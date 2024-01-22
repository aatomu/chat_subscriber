# chat_subscriber
複数のLive配信のチャットを接続する

## How To Use
Open URL in Browser or Open Browser in OBS

Example URL:  
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>`
* `https://live.aatomu.work/?twitch=<Twitch Channel ID>`
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>&twitch=<Twitch Channel ID>&limit=10`
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>&youtube=<Twitch Channel ID>&limit=10?cleanup=120`

| Key | Value | Description |
| :- | :- | :- |
| youtube | YoutubeのChannelID(@ProjectCBW) | 読み込むYoutube配信のチャンネル |
| twitch | TwitchのChannelID(projectcbw) | 読み込むTwitch配信のチャンネル |
| limit | number | 同時に表示するメッセージの最大数 |
| clenup | number | n秒後に徐々に消え始める |

OBS Custom CSS:  
```css
body {
    background-color: rgba(0,0,0,0);
    overflow: hidden;
}
```

## Contents HTML Tree
* Youtube Normal Chat
```html
<div class="contents">
  <div class="content youtube">
    <span class="time">00:00:00</span>
    <div class="icon">
      <img src="...">
    </div>
    <span class="name">...</span>
    <div class="message-root">
      <span class="message">...</span>
      <span class="channel">...</span>
    </div>
  </div>
</div>
```

* Youtube Super Chat
```html
<div class="contents">
  <div class="content youtube">
    <span class="time">00:00:00</span>
    <div class="icon">
      <img src="...">
    </div>
    <span class="name">...</span>
    <div class="message-root">
      <span class="message"><span class="money" style="color: #000000;background-color: #000000;">$0.00</span>...</span>
      <span class="channel">...</span>
    </div>
  </div>
</div>
```

* Twitch Normal Chat
```html
<div class="contents">
  <div class="content twitch">
    <span class="time">00:00:00</span>
    <div class="icon">
      <img src="...">
    </div>
    <span class="name">...</span>
    <div class="message-root">
      <span class="message">...</span>
      <span class="channel">...</span>
    </div>
  </div>
</div>
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