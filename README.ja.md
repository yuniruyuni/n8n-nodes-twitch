# n8n-nodes-twitch

[![CI](https://github.com/yuniruyuni/n8n-nodes-twitch/actions/workflows/ci.yml/badge.svg)](https://github.com/yuniruyuni/n8n-nodes-twitch/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@yuniruyuni%2Fn8n-nodes-twitch.svg)](https://www.npmjs.com/package/@yuniruyuni/n8n-nodes-twitch)

Twitch API統合のためのn8nコミュニティノードパッケージです。Twitch Helix APIの包括的なサポートと、Webhook経由のリアルタイムEventSub通知を提供します。

[n8n](https://n8n.io/)は[フェアコードライセンス](https://docs.n8n.io/reference/license/)のワークフロー自動化プラットフォームです。

[English](README.md) | 日本語

## 機能

### 34個のTwitch APIリソース

すべてのノードはTwitch Helix APIのリソース指向構造に従っています：

**ユーザー＆チャンネル管理:**
- **Twitch Users** - ユーザー情報の取得
- **Twitch Channels** - チャンネル情報の取得
- **Twitch Streams** - 配信情報の取得

**コンテンツ＆メディア:**
- **Twitch Clips** - クリップの取得、作成
- **Twitch Videos** - 動画の取得
- **Twitch Games** - ゲーム情報の取得、人気ゲームの取得
- **Twitch Search** - カテゴリ、チャンネル、配信の検索

**チャット＆コミュニケーション:**
- **Twitch Chat Messages** - メッセージの送信
- **Twitch Chatters** - チャット参加者リストの取得
- **Twitch Emotes** - チャンネルエモートの取得
- **Twitch Announcements** - アナウンスの送信
- **Twitch Whispers** - ウィスパーの送信

**チャンネルポイント＆報酬:**
- **Twitch Custom Rewards** - カスタム報酬の作成、取得、更新、削除
- **Twitch Redemptions** - 引き換え状況の取得、更新

**モデレーション:**
- **Twitch Bans** - ユーザーのBAN、BAN解除、BANユーザーの取得
- **Twitch Moderators** - モデレーターの取得、追加、削除

**エンゲージメント:**
- **Twitch Polls** - 投票の取得、作成、終了
- **Twitch Predictions** - 予想の取得、作成、ロック、解決
- **Twitch Raids** - レイドの開始、キャンセル

**収益化:**
- **Twitch Bits Leaderboard** - Bitsリーダーボードの取得
- **Twitch Cheermotes** - Cheermotesの取得
- **Twitch Subscriptions** - 配信者のサブスクリプション取得、ユーザーサブスクリプション確認

**スケジュール＆チーム:**
- **Twitch Schedule** - 配信スケジュールの取得、作成、更新、削除
- **Twitch Teams** - チャンネルチーム、チーム情報の取得

### EventSub トリガーノード

**Twitch Trigger** - Webhook経由のリアルタイムイベント通知:

- **配信イベント:** オンライン、オフライン
- **チャンネルイベント:** 更新、フォロー、サブスクライブ、サブスク終了/ギフト/メッセージ、Cheer、レイド、BAN、BAN解除
- **チャットイベント:** メッセージ、クリア、通知、メッセージ削除、ユーザーメッセージクリア
- **チャンネルポイント:** カスタム報酬の追加/更新/削除、引き換えの追加/更新
- **投票:** 開始、進行、終了
- **予想:** 開始、進行、ロック、終了
- **目標:** 開始、進行、終了
- **Hype Train:** 開始、進行、終了
- **モデレーター:** 追加、削除
- **シールドモード:** 開始、終了
- **シャウトアウト:** 作成、受信

**76種類のEventSubイベントをサポート**、自動サブスクリプション管理と署名検証を実装しています。

## 認証

2つの認証方法をサポートしています：

1. **Twitch App Access Token** - サーバー間通信のためのアプリアクセストークン
   - 全EventSubイベントに対応する事前設定済みスコープを持つClient Credentials Grant Flowを使用
   - EventSub Webhookサブスクリプションに必須
   - 全76種類のEventSubイベントをサポート
   - ユーザー認証不要
   - 必要なもの: Client IDとClient Secret

2. **Twitch User Access Token** - ユーザー固有の操作のためのユーザーアクセストークン
   - Authorization Code Grant Flowを使用
   - ユーザー固有のデータにアクセスする操作に必須
   - Twitch API操作に必要な包括的なスコープが事前設定済み
   - 必要なもの: Client ID、Client Secret、OAuth Redirect URL

### どちらの認証情報を使うべきか？

- **Twitchノード**: **Twitch User Access Token**を使用（ほとんどの操作でユーザー認証が必要）
- **Twitch Trigger**: **Twitch App Access Token**を使用（EventSub Webhookにはスコープ付きAppトークンが必須）

## インストール

### セルフホスト版n8n

n8nのインストールディレクトリでnpm経由でインストール：

```bash
npm install @yuniruyuni/n8n-nodes-twitch
```

またはn8n環境に追加：

```bash
N8N_CUSTOM_EXTENSIONS="/path/to/@yuniruyuni/n8n-nodes-twitch"
```

Dockerインストールの場合は、パッケージをマウントするかカスタムノードディレクトリに追加してください。

### n8n Cloud

**完全互換** - このパッケージは外部依存関係のない宣言的ルーティングパターンを使用しています。Twitch TriggerノードはEventSub通知にWebhookを使用しており、n8n Cloudでシームレスに動作します。

## 互換性

- **n8nバージョン:** 1.0.0以上
- **Node.jsバージョン:** 18.10.0以上（推奨: 20.x）

## 使い方

### Twitch認証情報の設定

1. [Twitch Developer Console](https://dev.twitch.tv/console/apps)にアクセス
2. 新しいアプリケーションを作成するか、既存のものを使用
3. Client IDとClient Secretをメモ
4. OAuth2の場合、OAuth Redirect URLをn8nインスタンスに設定（例: `https://your-n8n.com/rest/oauth2-credential/callback`）

### Twitchノードの使用

1. ワークフローにTwitchノードを追加
2. **Twitch User Access Token**認証情報を作成
3. リソースと実行したい操作を選択
4. 必要なパラメータを設定
5. ワークフローを実行

### Twitch Triggerの使用

1. ワークフローにTwitch Triggerノードを追加
2. **Twitch App Access Token**認証情報を作成
3. リッスンしたいEventSubイベントタイプを選択
4. broadcaster IDとその他の必要なパラメータを設定
5. ワークフローをアクティブ化してイベントの受信を開始

トリガーはWebhookを使用してTwitchからリアルタイムイベントを受信します。n8nが自動的に安全なHTTPS Webhook URLを提供するため、手動でのWebhook設定は不要です。ワークフローをアクティブ化すると、ノードは自動的に：
- TwitchにEventSubサブスクリプションを作成
- TwitchのチャレンジメカニズムでWebhookを検証
- セキュリティのためにイベント署名を検証
- ワークフロー非アクティブ化時にサブスクリプションを自動クリーンアップ

## 開発

### 必要要件

- Node.js 18.10.0以上
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

| スクリプト            | 説明                                                      |
| --------------------- | --------------------------------------------------------- |
| `npm run dev`         | ノードをロードしてn8nを起動、変更を監視 |
| `npm run build`       | TypeScriptをJavaScriptにコンパイル |
| `npm run build:watch` | ウォッチモードでビルド（自動再ビルド） |
| `npm run lint`        | コードのエラーとスタイルの問題をチェック |
| `npm run lint:fix`    | lintの問題を自動修正 |
| `npm run release`     | 新しいリリースを作成 |

### リリースプロセス

このプロジェクトは `n8n-node release`（内部で`release-it`を使用）で自動リリースを行います：

**推奨: GitHub Actions**

1. **Actions** → **Release** → **Run workflow** に移動
2. **Run workflow** をクリック
3. GitHub Actionsが自動的に：
   - lintとbuildを実行
   - package.jsonのバージョンを更新（デフォルトの増分）
   - CHANGELOGを生成
   - gitのcommitとtagを作成
   - npmに公開
   - リリースノート付きのGitHubリリースを作成

**代替: ローカルリリース**

ローカル開発環境で実行する場合：
```bash
npm run release
```
`n8n-node release`による対話的なリリースプロセスを提供します。

**前提条件**:
- GitHubリポジトリ設定で `NPM_TOKEN` シークレットを設定
- `@yuniruyuni/n8n-nodes-twitch` のnpm公開権限があること
- ローカルリリースの場合: `npm login` と `master` ブランチでクリーンなgit状態が必要

## アーキテクチャ

このパッケージはすべてのノードで**宣言的/ローコードスタイル**を使用しています：

- Twitch Helix API (`https://api.twitch.tv/helix`) への直接呼び出し
- HTTPリクエストにn8nの `routing` プロパティを使用
- **外部依存関係なし** - n8n Cloudと完全互換
- Twitch Helix APIに合わせたリソース指向設計

Twitch Triggerノードはn8nのWebhookシステムを使用してHTTPS経由でEventSub通知を受信し、セキュリティのための署名検証が組み込まれています。

## リソース

- [n8nドキュメント](https://docs.n8n.io/)
- [Twitch APIドキュメント](https://dev.twitch.tv/docs/api/)
- [Twitch EventSubドキュメント](https://dev.twitch.tv/docs/eventsub/)
- [Twitch Developer Console](https://dev.twitch.tv/console)

## ライセンス

[MIT](LICENSE.md)

## バージョン履歴

### 0.1.32 (最新)

- 包括的なTwitch Helix APIをカバーする34個のTwitch APIリソース
- EventSub Webhookサポート（76種類のイベント）を持つTwitch Triggerノード
- デュアル認証システム:
  - 全EventSub Webhookに対応する事前設定済みスコープを持つTwitch App Access Token
  - ユーザー固有操作用のTwitch User Access Token
- Twitch Helix API構造に合わせたリソース指向アーキテクチャ
- **n8n Cloud互換** - 外部依存関係なし

### 0.1.0

- 初回リリース
