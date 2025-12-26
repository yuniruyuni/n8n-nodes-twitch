# n8n-nodes-twitch

[![CI](https://github.com/yuniruyuni/n8n-nodes-twitch/actions/workflows/ci.yml/badge.svg)](https://github.com/yuniruyuni/n8n-nodes-twitch/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@yuniruyuni%2Fn8n-nodes-twitch.svg)](https://www.npmjs.com/package/@yuniruyuni/n8n-nodes-twitch)

Twitch API統合のためのn8nコミュニティノードパッケージです。Twitch Helix API操作の包括的なサポートと、WebSocketによるリアルタイムEventSub通知を提供します。

[n8n](https://n8n.io/)は[フェアコードライセンス](https://docs.n8n.io/reference/license/)のワークフロー自動化プラットフォームです。

[English](README.md) | 日本語

## 機能

### 34のTwitch APIリソース

すべてのノードはTwitch Helix APIのリソース指向構造に従っています:

**ユーザー＆チャンネル管理:**
- **Twitch Users** - ユーザー情報の取得
- **Twitch Channels** - チャンネル情報の取得
- **Twitch Streams** - 配信情報の取得

**コンテンツ＆メディア:**
- **Twitch Clips** - クリップの取得、作成
- **Twitch Videos** - 動画の取得
- **Twitch Games** - ゲーム情報、人気ゲームの取得
- **Twitch Search** - カテゴリ、チャンネル、配信の検索

**チャット＆コミュニケーション:**
- **Twitch Chat Messages** - メッセージの送信
- **Twitch Chatters** - チャット参加者リストの取得
- **Twitch Emotes** - チャンネルエモートの取得
- **Twitch Announcements** - アナウンスの送信
- **Twitch Whispers** - ウィスパー（DM）の送信

**チャンネルポイント＆リワード:**
- **Twitch Custom Rewards** - カスタムリワードの作成、取得、更新、削除
- **Twitch Redemptions** - リワード交換の取得、ステータス更新

**モデレーション:**
- **Twitch Bans** - ユーザーのBAN、BAN解除、BAN済みユーザーの取得
- **Twitch Moderators** - モデレーターの取得、追加、削除

**エンゲージメント:**
- **Twitch Polls** - 投票の取得、作成、終了
- **Twitch Predictions** - 予想の取得、作成、ロック、解決
- **Twitch Raids** - レイドの開始、キャンセル

**収益化:**
- **Twitch Bits Leaderboard** - Bitsリーダーボードの取得
- **Twitch Cheermotes** - Cheermotesの取得
- **Twitch Subscriptions** - ブロードキャスターのサブスク情報取得、ユーザーサブスク確認

**スケジュール＆チーム:**
- **Twitch Schedule** - 配信スケジュールの取得、作成、更新、削除
- **Twitch Teams** - チャンネルチーム、チーム情報の取得

### EventSubトリガーノード

**Twitch Trigger** - WebSocketによるリアルタイムイベント通知:

- **配信イベント:** オンライン、オフライン
- **チャンネルイベント:** 更新、フォロー、サブスク、サブスク終了/ギフト/メッセージ、Cheer、レイド、BAN、BAN解除
- **チャットイベント:** メッセージ、クリア、通知、メッセージ削除、ユーザーメッセージクリア
- **チャンネルポイント:** カスタムリワード追加/更新/削除、リワード交換追加/更新
- **投票:** 開始、進行、終了
- **予想:** 開始、進行、ロック、終了
- **ゴール:** 開始、進行、終了
- **Hype Train:** 開始、進行、終了
- **モデレーター:** 追加、削除
- **シールドモード:** 開始、終了
- **シャウトアウト:** 作成、受信

**76のEventSubイベントをサポート**し、自動サブスクリプション管理を提供します。

## 認証

**Twitch User Access Token** - すべての操作にユーザーアクセストークンを使用
- Authorization Code Grant Flowを使用
- API操作とEventSub WebSocketサブスクリプションの両方に必要
- 包括的なスコープ（80スコープ）が事前設定済み:
  - 全76のEventSubイベント
  - すべてのTwitch Helix API操作
  - チャット、モデレーション、チャンネル管理など
- 必要な情報: Client ID、Client Secret、OAuth リダイレクトURL

## インストール

### n8nからインストール（推奨）

1. **設定** > **コミュニティノード**に移動
2. **インストール**をクリック
3. パッケージ名フィールドに`@yuniruyuni/n8n-nodes-twitch`を入力
4. **インストール**をクリック

n8n Cloudとセルフホストインスタンスのどちらでも動作します。

### 手動インストール（開発用）

このパッケージを開発またはデバッグする場合:

**npm経由:**
```bash
npm install @yuniruyuni/n8n-nodes-twitch
```

**カスタム拡張パス経由:**
```bash
N8N_CUSTOM_EXTENSIONS="/path/to/@yuniruyuni/n8n-nodes-twitch"
```

**Docker用:**
パッケージディレクトリをマウントするか、カスタムノードディレクトリに追加してください。

## 互換性

- **n8nバージョン:** 1.0.0以上
- **Node.jsバージョン:** 21.0.0以上（グローバルWebSocketサポートに必要）

## 使用方法

### Twitch認証情報の設定

1. [Twitch Developer Console](https://dev.twitch.tv/console/apps)にアクセス
2. 新しいアプリケーションを作成するか、既存のアプリケーションを使用
3. Client IDとClient Secretをメモ
4. OAuth リダイレクトURLをn8nインスタンスに設定（例: `https://your-n8n.com/rest/oauth2-credential/callback`）

### Twitchノードの使用

1. ワークフローにTwitchノードを追加
2. 新しい**Twitch User Access Token**認証情報を作成
3. 実行したいリソースと操作を選択
4. 必要なパラメータを設定
5. ワークフローを実行

### Twitchトリガーの使用

1. ワークフローにTwitchトリガーノードを追加
2. **Twitch User Access Token**認証情報を作成
3. 受信したいEventSubイベントタイプを選択
4. ブロードキャスターIDとその他の必要なパラメータを設定
5. ワークフローをアクティブ化してイベント受信を開始

トリガーはWebSocketを使用してTwitchからリアルタイムイベントを受信します。ワークフローをアクティブ化すると、ノードは自動的に:
- Twitch EventSub WebSocket（`wss://eventsub.wss.twitch.tv/ws`）に接続
- セッションIDを受信し、EventSubサブスクリプションを作成
- WebSocket経由でリアルタイムイベント通知を受信
- 自動的に再接続を処理
- ワークフロー非アクティブ化時にサブスクリプションを自動クリーンアップ

## 開発

### 前提条件

- Node.js 21.0.0以上（グローバルWebSocketサポートに必要）
- npm

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yuniruyuni/n8n-nodes-twitch.git
cd n8n-nodes-twitch

# 依存関係をインストール
npm install

# ノードをビルド
npm run build

# ノードをロードしてn8nを起動（開発モード）
npm run dev
```

### 利用可能なスクリプト

| スクリプト            | 説明                                                         |
| --------------------- | ------------------------------------------------------------ |
| `npm run dev`         | ノードをロードしてn8nを起動し、変更を監視                    |
| `npm run build`       | TypeScriptをJavaScriptにコンパイル                           |
| `npm run build:watch` | ウォッチモードでビルド（変更時に自動再ビルド）               |
| `npm run lint`        | コードのエラーとスタイルの問題をチェック                     |
| `npm run lint:fix`    | リント問題を自動修正                                         |
| `npm run release`     | 新しいリリースを作成                                         |

### リリースプロセス

このプロジェクトは`n8n-node release`（`release-it`ベース）を使用した自動リリースを行います:

**推奨: GitHub Actions**

1. **Actions** → **Release** → **Run workflow**に移動
2. **Run workflow**をクリック
3. GitHub Actionsが自動的に実行:
   - lintとbuildを実行
   - package.jsonのバージョンを更新（デフォルトインクリメント）
   - CHANGELOGを生成
   - gitコミットとタグを作成
   - npmに公開
   - リリースノート付きのGitHubリリースを作成

**代替: ローカルリリース**

ローカル開発ワークフローの場合:
```bash
npm run release
```
`n8n-node release`によって管理されるインタラクティブなリリースプロセスを提供します。

**前提条件**:
- GitHubリポジトリ設定で`NPM_TOKEN`シークレットを設定
- `@yuniruyuni/n8n-nodes-twitch`のnpm公開権限を保持
- ローカルリリースの場合: `npm login`と`master`ブランチのクリーンなgit状態が必要

## アーキテクチャ

このパッケージはTwitch API操作に**宣言的/ローコードスタイル**を使用しています:

- Twitch Helix API（`https://api.twitch.tv/helix`）への直接呼び出し
- HTTPリクエストにn8nの`routing`プロパティを使用
- Twitch Helix APIに合わせたリソース指向構造

TwitchトリガーノードはNode.jsグローバルWebSocket（Node.js 21+で利用可能）を使用して、WebSocket（`wss://eventsub.wss.twitch.tv/ws`）経由でEventSub通知を受信します。外部依存関係は不要です。

## リソース

- [n8nドキュメント](https://docs.n8n.io/)
- [Twitch APIドキュメント](https://dev.twitch.tv/docs/api/)
- [Twitch EventSubドキュメント](https://dev.twitch.tv/docs/eventsub/)
- [Twitch Developer Console](https://dev.twitch.tv/console)

## ライセンス

[MIT](LICENSE.md)