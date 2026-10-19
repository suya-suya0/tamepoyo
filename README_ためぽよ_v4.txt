ためぽよ v4 — GitHub Pages・Supabase導入手順
==========================================
1. この ZIP を解凍し、入っている全ファイルを「ためぽよ」GitHub Pages リポジトリのルート（index.html と同じ場所）にアップロード。
2. 既存 index.html と index_v1.html / v2 / v3 は削除・置換しない。
3. index_v4.html, tamepoyo_v4.js, brand-main-v4.png は新規ファイル。
4. sw.js はPWA更新用なので、GitHubに既存の sw.js があればこのファイルで置き換える。manifest.json は既存を使用。
5. GitHub Pages 公開反映後、いつものトップURLを開くと index.html が index_v4.html を検出して開く仕組み。
6. スマホでログイン。メール確認のリンクをGitHub Pagesに戻せるよう、Supabase Authentication > URL Configuration に公開URLを追加する。
7. 一方が「共有」→「ペアを作成」、他方が招待コードを入力。
8. 本番使用前に双方から個人の非公開データが読めないこと、共有オン時だけ見えることを確認。

注意：
- Supabaseの既存「読書の杜」プロジェクトと認証基盤を共用するため、Authentication > Providers の既存設定を変更しない。
- ためぽよ専用 tamepoyo スキーマを使用する。public のデータにSQL変更不要。
- このv4では新規の記録はクラウドへ保存。v3までのlocalStorageデータを自動移行しない。
  先にv3の設定からJSONバックアップを保存しておくこと。
- 共有画面はペア相手が実際に連携した後に有効。匿名公開はしない。
- 公開用の sb_publishable_ キーのみ使用。secret/service_role はアップロードしない。
- GitHubの最新版自動検出は「公開リポジトリでGitHub APIを読める」ことが前提。
- PWAは既存インストール端末で再起動／更新が必要な場合がある。
- Supabaseの認証メールやログイン・RLSの動作は実際の2つのアカウントで必ずテスト。
