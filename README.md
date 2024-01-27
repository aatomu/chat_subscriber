# chat_subscriber
複数のLive配信のチャットを接続する

## How To Use
Open URL in Browser or Open Browser in OBS

Example URL:  
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>`
* `https://live.aatomu.work/?watch=<Youtube Video ID>`
* `https://live.aatomu.work/?twitch=<Twitch Channel ID>`
* `https://live.aatomu.work/?niconico=<Niconico User ID>`
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>&twitch=<Twitch Channel ID>&limit=10`
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>&youtube=<Twitch Channel ID>&limit=10?cleanup=120`

| Key | Value | Description |
| :- | :- | :- |
| youtube | YoutubeのChannelID(@ProjectCBW) | 読み込むYoutube配信のチャンネル |
| watch | YoutubeのURL `watch?v=` | 読み込むYoutube動画のID |
| twitch | TwitchのChannelID(projectcbw) | 読み込むTwitch配信のチャンネル |
| niconico | NiconicoのUserID | 読み込むニコ生配信のチャンネル |
| limit | number | 同時に表示するメッセージの最大数 |
| clenup | number | n秒後に徐々に消え始める |

OBS Custom CSS:  
```css
body {
    background-color: rgba(0,0,0,0);
    overflow: hidden;
}
```

## Supported Message,Event List
| Site     | Message            | Emoji/Emote        | Tip                  |
| :-:      | :-:                | :-:                | :-:                  |
| Youtube  | :white_check_mark: | :white_check_mark: | :white_check_mark:   |
| Twitch   | :white_check_mark: | :white_check_mark: | :small_red_triangle: |
| Niconico | :white_check_mark: | :x:                | :x:                  |
| Twicas   | :x:                | :x:                | :x:                  |
| OpenREC  | :x:                | :x:                | :x:                  |

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

* Niconico Bits Chat
```html
<div class="contents">
  <div class="content niconico">
    <span class="time">00:00:00</span>
    <div class="icon">
      <img src="...">
    </div>
    <span class="name">...</span>
    <div class="message-root">
      <span class="message"><span class="money" style="background-color: var(--twitch);">$0.00</span>...</span>
      <span class="channel">...</span>
    </div>
  </div>
</div>
```

## Screen Shot
* Youtube * Twitch cross chat
![Youtube*twitch cross chat screen shot](./example-youtube-twitch.png)

## Credit
License: `Apache License`
※ できたら URLを張っていただけると幸いです
* Code
  * [aatomu(@aatomu)](https://x.com/aatomu21263): Front:HTML,JavaScript,CSS Background: Typescript
* Design
  * [椛野りあ(@KuoN_aLia)](https://x.com/KuoN_aLia): Default CSS
* Special Thanks
  * [ProjectCBW(@ProjectCBW)](https://x.com/ProjectCBW): Youtube/Twitch live test
  * Project CBW Listeners: Message view test, Design layout check