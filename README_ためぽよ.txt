# ためぽよ | GitHub Pages 自動最新版オープン

## 最初の1回だけ
ZIP内の `index.html`、`index_v1.html`、`poyo-mascot.png` をリポジトリの一番上（ルート）にアップロードしてコミットしてください。
以前の `index.html` は **この1回だけ** 新しい入口 `index.html` に置き換える必要があります。
GitHub Pages の公開元はリポジトリのルート（例: main /root）に設定してください。

## 次からの更新方法
**古いファイルや index.html は触らなくてOK！**
次の新バージョンのHTMLファイルを1個、同じ場所へアップロードするだけです。
例: `index_v2.html` → `index_v3.html` → `index_v4.html`
小数も対応: `index_v1.1.html`、`index_v2.2.html`
以前の数字より大きいバージョンが自動的に採用されます。

利用するURLは、いつも GitHub Pages のトップURL（`.../` または `.../index.html`）です。
入口にアクセスするたび GitHub の公開APIでファイル一覧を確認し、一番新しい番号のHTMLへ移動します。
GitHub Pagesの反映には少し時間がかかることがあります。

## 注意
- 公開GitHubリポジトリを想定しています。GitHub APIの制限、通信失敗、GitHub Pages反映待ちでは再試行が必要になる場合があります。
- `ユーザー名.github.io/リポジトリ名/` の通常の GitHub Pages URLを想定。独自ドメインでは自動でリポジトリを特定できません。
- `index_v2.html` のようにバージョン番号を付けてください。`index_v1.html` より新しい数字が選ばれます。
- 共有するURLはトップURL。バージョンファイルを直接ブックマークすると次版に切り替わりません。
- v1の家計簿データはブラウザのlocalStorageを使う試作です。別端末間同期はまだありません。
