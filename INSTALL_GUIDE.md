# はじめて使う人向けインストール手順

このガイドは、できるだけ専門用語を減らして書いています。

## 0. 事前に必要なもの

- Discord アカウント
- Google アカウント
- 管理者から共有された Bot 招待リンク

## 1. Botをサーバーに入れる

1. 招待リンクを開く
2. 追加したいDiscordサーバーを選ぶ
3. 承認する

## 2. Google Apps Scriptを作る

1. Google Drive で新しいスプレッドシートを作る
2. メニューの `拡張機能` → `Apps Script` を開く
3. 共有されたコードを貼り付けて保存

## 3. 設定値を入れる

Apps Script の `プロジェクトの設定` → `スクリプト プロパティ` で次を追加します。

- `PROXY_TOKEN` : 32文字以上のランダム文字列
- `CALENDAR_ID` : まずは `primary` でOK

## 4. Webアプリとして公開する

1. 右上の `デプロイ` → `新しいデプロイ`
2. 種類を `ウェブアプリ` にする
3. `アクセスできるユーザー` を `全員` にする
4. デプロイして `.../exec` のURLをコピー

## 5. Discordで接続設定する

1. Discordで `/setup` を実行
2. 入力画面に次を入れる
   - `GAS Webhook URL` : さっきコピーした `.../exec`
   - `PROXY_TOKEN` : GASに入れたものと同じ値
3. `Setup saved.` が出たら完了

## 6. 動作確認

- `/ping`
- `/schedule`

これで返事が来れば完了です。

## よくあるエラー

### `Setup not found. Run /setup first.`
`/setup` が未実行です。先に `/setup` を実行してください。

### `GAS request failed.`
次を確認してください。

- URL が `.../exec` になっているか（`.../dev` ではない）
- Webアプリの公開範囲が `全員` か
- `PROXY_TOKEN` がGAS設定と `/setup` 入力で一致しているか
- デプロイ後の最新URLを使っているか
