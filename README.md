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

### Supported Live Chat
| Key | Value Type | Description | Example |
| :-: | :-: | :-: | :- |
| youtube | string | Youtube Live Channel | `youtube=@ProjectCBW` |
| watch | string | Youtube Video ID | `watch=xxxxxxx` |
| twitch | string | Twitch Live Channel | `twitch=ProjectCBW` |
| niconico | string | Niconico Live Channel | `niconico=xxxxx` |

### Supported Options
| Key | Value Type | Description | Example | Default |
| :-: | :-: | :-: | :- | :-: |
| limit | number | Display Limit | `limit=10` | 20 |
| cleanup | number | Cleanup Delay(Second) | `cleanup=10` |  |
| tip | number,number,number | Tip Message Read Config<br>`index,rate,volume`<br>*Required enable button click  | `tip=0,1,1` |  |
| message | number,number,number | Normal Message Read Config<br>`index,rate,volume`<br>*Required enable button click  | `message=0,1,1` |  |

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
| Niconico | :white_check_mark: |                    | :x:                  |
| Twicas   | :white_check_mark: |                    | :x:                  |
| OpenREC  | :white_check_mark: | :x:                | :x:                  |

## Contents HTML Tree
* Normal Chat
```html
<div class="contents">
  <div class="content {Site}">
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

* Tip Chat
```html
<div class="contents">
  <div class="content {Site}">
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

## Screen Shot
* Youtube * Twitch cross chat
![Youtube*twitch cross chat screen shot](./example-youtube-twitch.png)
* Twitch multi chat
![Twitch multi chat screen shot](./example-multi-twitch.png)


## Credit
License: `Apache License`
※ できたら URLを張っていただけると幸いです
* Code
  * [aatomu(@aatomu)](https://x.com/aatomu21263): Front:HTML,JavaScript,CSS Background: Typescript
  * [らる(@rarula)](https://twitter.com/rarula_): Background: Typescript review
* Design
  * [椛野りあ(@KuoN_aLia)](https://x.com/KuoN_aLia): Default CSS
* Special Thanks
  * [ProjectCBW(@ProjectCBW)](https://x.com/ProjectCBW): Youtube/Twitch live test
  * Project CBW Listeners: Message view test, Design layout check
	* [しぐりむん(@shiglimnn)](https://twitter.com/shiglimnn): Multi Twitch live test
