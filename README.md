# Stream Tools Index
* Chat Subscriber(複数の配信チャットを表示): [こちら](#chat_subscriber)
* Discord Connector(Discordのいろいろ): [こちら](#discord_connector)

# chat_subscriber
## Description
YoutubeやTwitchなどの複数を同時に表示 Emoji/Emoteや投げ銭にも対応

## How To Use
* User like     : `Open URL` in Browser
* Streamer like : `Browser Source` in OBS (Recommended CSS is written below)

Example URL:
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>`
* `https://live.aatomu.work/?twitch=<Twitch Channel ID>`
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>&twitch=<Twitch Channel ID>&limit=10`
* `https://live.aatomu.work/?youtube=<Youtube Channel ID>&limit=10?cleanup=120`

### Supported Live Chat
| Key | Value Type | Description | Example |
| :-: | :-: | :-: | :- |
| youtube | string | Youtube Live Channel | `youtube=@ProjectCBW` |
| watch | string | Youtube Video ID | `watch=xxxxxxx` |
| twitch | string | Twitch Live Channel | `twitch=ProjectCBW` |
| niconico | string | Niconico Live Channel | `niconico=xxxxx` |
| twicas | string | Twicas Live Channel | `twicas=xxxxx` |
| openrec | string | OpenRec Live Channel | `openrec=xxxxx` |

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
      <span class="message">
        <span class="money" style="color: #000000;background-color: #000000;">$0.00</span>
        ...
      </span>
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

# discord_connector
## Description
* DiscordのVCを移動しても自動で追いかけるように
* VCの名前を表示する,Discordニトロの装飾を表示
* Advanced: Discordのプロフィールをカスタマイズする

# How To Use
1. Discord-ConnectorをDLし起動する(この際 ネットワークの許可は許可する) [一覧](https://github.com/aatomu/chat_subscriber/tree/main/discord-connector/build)
2. <a heref="https://discord.com/developers/applications" target="_blank">Discord Develop Applications</a>
3. `New Applications`をクリックして`Connector`に`Name`を設定し利用規約に同意し`Create`する
5. `https://live.aatomu.work/discord/?id=【ClientID】&secret=【ClientSecret】`をメモ帳などに張り付ける
4. サイドバー`Oauth2`を開く
5. `Client ID`を`Copy`を押し 先ほど貼り付けたものを書き換える
6. `Client Secret`のところの`Reset Secret`を押す(※この際2FAが入る場合があります)<br>表示された`Copy`を押し 先ほど貼り付けたものを書き換える
7. `Redirects`の`Add Redirects`を押し `https://live.aatomu.work`を入力した後`Save Changes`する
8. 書き換え終わったURLを`OBSのブラウザソース`のURLに設定する
9. Discordに表示される認証で`認証`を押す
* 以下 プロフィールを書き換える人用
10. `Rich Presence`を開き`Add Image`で画像を追加,名前を設定し`Save Changes`する
11. 書き換え終わったURLを`ブラウザ`で開き ブラウザコンソールを出す
12. 下にあるコード(Set Activity)を実行する ※随所書き換え

OBS Custom CSS:
```css
body {
    background-color: rgba(0,0,0,0);
    overflow: hidden;
}
.channel {
    display: none;
}
```

Set Activity:
```javascript
Send("SET_ACTIVITY","",{
  "pid": 0,
  "activity": {
    "details":"【説明】",
    "state": "【詳細説明】",
    "timestamps": {
        "start": new Date().getTime() - (1000 * 60 * 60 * 23.999)
    },
    "assets": {
        "large_image":"【さっき設定した名前】",
        "large_text":"【画像の説明】",
    },
    "party": {
      "id":"-1",
      "size":[【現在の人数】,【上限の人数】]
    }
  }
})
```
