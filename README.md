# Stream Tools Index

- Chat Subscriber(複数の配信チャットを表示): [こちら](#chat_subscriber)
- Discord Connector(Discord のいろいろ): [こちら](#discord_connector)

※ このソフトは[Discord の Alpha API](https://discord.com/developers/docs/topics/rpc)を利用しています

# chat_subscriber

## Description

Youtube や Twitch などの複数を同時に表示 Emoji/Emote や投げ銭にも対応

## How To Use

- User like : `Open URL` in Browser
- Streamer like : `Browser Source` in OBS (Recommended CSS is written below)

Example URL:

- `https://live.aatomu.work/?youtube=<Youtube Channel ID>`
- `https://live.aatomu.work/?twitch=<Twitch Channel ID>`
- `https://live.aatomu.work/?youtube=<Youtube Channel ID>&twitch=<Twitch Channel ID>&limit=10`
- `https://live.aatomu.work/?youtube=<Youtube Channel ID>&limit=10?cleanup=120`

### Supported Live Chat

|   Key    | Value Type |      Description      | Example               |
| :------: | :--------: | :-------------------: | :-------------------- |
| youtube  |   string   | Youtube Live Channel  | `youtube=@ProjectCBW` |
|  watch   |   string   |   Youtube Video ID    | `watch=xxxxxxx`       |
|  twitch  |   string   |  Twitch Live Channel  | `twitch=ProjectCBW`   |
| niconico |   string   | Niconico Live Channel | `niconico=xxxxx`      |
|  twicas  |   string   |  Twicas Live Channel  | `twicas=xxxxx`        |
| openrec  |   string   | OpenRec Live Channel  | `openrec=xxxxx`       |

### Supported Options

|   Key   |      Value Type      |                                     Description                                     | Example         | Default |
| :-----: | :------------------: | :---------------------------------------------------------------------------------: | :-------------- | :-----: |
|  limit  |        number        |                                    Display Limit                                    | `limit=10`      |   20    |
| cleanup |        number        |                                Cleanup Delay(Second)                                | `cleanup=10`    |         |
|   tip   | number,number,number |  Tip Message Read Config<br>`index,rate,volume`<br>\*Required enable button click   | `tip=0,1,1`     |         |
| message | number,number,number | Normal Message Read Config<br>`index,rate,volume`<br>\*Required enable button click | `message=0,1,1` |         |

OBS Custom CSS:

```css
body {
  background-color: rgba(0, 0, 0, 0);
  overflow: hidden;
}
```

## Supported Message,Event List

|   Site   |      Message       |    Emoji/Emote     |         Tip          |
| :------: | :----------------: | :----------------: | :------------------: |
| Youtube  | :white_check_mark: | :white_check_mark: |  :white_check_mark:  |
|  Twitch  | :white_check_mark: | :white_check_mark: | :small_red_triangle: |
| Niconico | :white_check_mark: |                    |         :x:          |
|  Twicas  | :white_check_mark: |                    |         :x:          |
| OpenREC  | :white_check_mark: |        :x:         |         :x:          |

## Contents HTML Tree

- Normal Chat

```html
<div class="contents">
  <div class="content {Site}">
    <span class="time">00:00:00</span>
    <div class="icon">
      <img src="..." />
    </div>
    <span class="name">...</span>
    <div class="message-root">
      <span class="message">...</span>
      <span class="channel">...</span>
    </div>
  </div>
</div>
```

- Tip Chat

```html
<div class="contents">
  <div class="content {Site}">
    <span class="time">00:00:00</span>
    <div class="icon">
      <img src="..." />
    </div>
    <span class="name">...</span>
    <div class="message-root">
      <span class="message">
        <span class="money" style="color: #000000;background-color: #000000;"
          >$0.00</span
        >
        ...
      </span>
      <span class="channel">...</span>
    </div>
  </div>
</div>
```

## Screen Shot

- Youtube * Twitch cross chat<br>
  <img src="./images/youtube-twitch.png" style="max-width: 50%;" alt="Youtube*twitch cross chat screen shot">
- Twitch multi chat<br>
  <img src="./images/multi-twitch.png" style="max-width: 50%;" alt="Twitch multi chat screen shot">

## Credit

※ クレジット表記をしていただけると開発者が喜びます。<br>
例: `Chat Subscriber(https://github.com/aatomu/chat_subscriber/tree/main#chat_subscriber) を利用しています`

### Developers
| Name | Products |
| :-: | :-: |
| [aatomu(@aatomu)](https://x.com/aatomu21263) | Front: `HTML,Javascript,CSS`<br>Background:`Typescript` |
| [らる(@rarula)](https://twitter.com/rarula_) | Background: `Typescript(Refactoring)` |
| [椛野りあ(@KuoN_aLia)](https://x.com/KuoN_aLia) | Front: `CSS(Design)` |

### Special Thanks
| Name | Products |
| :-: | :-: |
| [ProjectCBW(@ProjectCBW)](https://x.com/ProjectCBW) | Youtube/Twitch live test |
| Project CBW Listeners | Message view test, Design layout check |
| [しぐりむん(@shiglimnn)](https://twitter.com/shiglimnn) | Multi Twitch live test |

---

# discord_connector

## Description

- Discord の VC を移動しても自動で追いかけるように
- VC の名前を表示する,Discord ニトロの装飾を表示
- Advanced: Discord のプロフィールをカスタマイズする

## How To Use

### 初回設定

1. [DiscordConnector-Win64.exe](https://github.com/aatomu/chat_subscriber/blob/main/discord-connector/build/DiscordConnector-Win64.exe) を開く<br>
   Raw の 2 つ右のアイコン 📥 をクリックしダウンロード(以下`DiscordConnector`)<br>
   <img src="./images/download-DiscordConnector.png" style="max-width: 70%;" alt="download DiscordConnector"><br>
   デスクトップ等に`DiscordConnector`をファイルを移動する<br>
   `DiscordConnector`をダブルクリックし起動する(この際 ファイアウォールを許可する)
2. [Discord Develop Applications](https://discord.com/developers/applications) を開く
3. `New Applications`をクリックする<br>
   <img src="./images/create-application.png" style="max-width: 90%;" alt="create discord application"><br>
   `Name`に`Connector`と入力する<br>
   利用規約に同意し`Create`する<br>
   <img src="./images/set-application-name.png" style="max-width: 35%;" alt="set application name"><br>
4. `https://live.aatomu.work/discord/?id=➀&secret=➁`<br>
   上記をコピーし メモ帳などに貼り付ける
5. サイドバーの`Oauth2`をクリックする<br>
   <img src="./images/application-oauth2.png" style="max-width: 90%;" alt="select OAuth2"><br>
6. `Client ID`を`Copy`を押し ➀ を書き換える
7. `Client Secret`のところの`Reset Secret`を押し<br>
   **(※この際 2FA が入る場合があります)**<br>
   表示された`Copy`を押し ➁ を書き換える
8. `Redirects`の`Add Redirects`を押し<br>
   `https://live.aatomu.work`を入力した後<br>
   `Save Changes`する
9. 書き換え終わった URL を`OBSのブラウザソース`の URL に設定する<br>
   **(※配信をしない人は飛ばしてください)**
10. Discord に表示される認証で`認証`を押す
11. **※以下 プロフィールを書き換える人用(Advanced Settings)**<br>
    サイドバーの`Rich Presence`を開き<br>
    `Add Image(s)`で画像を追加,名前を設定し<br>
    `Save Changes`する<br>
    <img src="./images/application-assets.png" style="max-width: 70%;" alt="select Rich Presence"><br>
12. [activity.json](https://github.com/aatomu/chat_subscriber/blob/main/discord-connector/build/activity.json) をダウンロード<br>
    `DiscordConnector` と同じところに置く<br>
    中身を好きなように書き換える
13. ブラウザーでリンクを開きなおす<br>
    **※毎回 開きっぱなしにする必要があります**

### 二回目以降の起動方法

1. Discord-Connector の exe を実行する
2. OBS を起動する<br>Discord に認証画面が表示されるので、認証を押す

### 上記手順を自動化する方法

1. Discord-Connector の exe へのショートカットを作成する。
2. `Windows`+`R` を押し、出てきた画面に shell:startup と入力する
3. 開いた場所に、ショートカットを移動する。
   PC 起動時に自動的に exe が実行されるため、起動忘れがなくなります！

OBS Custom CSS:<br>
※ さらにカスタムするときはこちら [Discord CSS Generator](https://live.aatomu.work/discord-css)

```css
body {
  background-color: rgba(0, 0, 0, 0);
  overflow: hidden;
}
.channel {
  display: none;
}
```

## Contents HTML Tree

```html
<div id="errors" class="error">...</div>
<div id="root" class="root">
  <div id="channel" class="channel">XXXXXX</div>
  <div id="users" class="users">
    <div id="0000000" class="user me">
      <img class="icon" src="https://cdn.discordapp.com/avatars/...." />
      <span class="nick">....</span>
      <span class="name">....</span>
    </div>
    <div id="111111111" class="user">
      <img class="icon" src="https://cdn.discordapp.com/avatars/...." />
      <img class="decoration" src="https://cdn.discordapp.com/...." />
      <span class="nick">....</span>
      <span class="name">....</span>
    </div>
  </div>
</div>
```

## Credit

※ クレジット表記をしていただけると開発者が喜びます。<br>
例: `DiscordConnector(https://github.com/aatomu/chat_subscriber/tree/main#discord_connector) を利用しています`

### Developers
| Name | Products |
| :-: | :-: |
| [aatomu(@aatomu)](https://x.com/aatomu21263) | Front: `HTML,Javascript,CSS`<br>Background:`Golang` |
| [椛野りあ(@KuoN_aLia)](https://x.com/KuoN_aLia) | Front: `CSS(Design)` |

### Special Thanks
| Name | Products |
| :-: | :-: |
| [RinProducts(@RinProducts)](https://x.com/RinProducts) | README review & Screenshot provider |
