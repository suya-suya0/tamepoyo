ためぽよ v8.3 Google Play公開準備（第一段階）

1. Supabase SQL Editorで 01_account_deletion_requests.sql を実行
2. tamepoyoリポジトリ直下に index_v83.html, tamepoyo_v83.js, privacy.html, support.html, delete-account.html, delete-request-v83.js をアップロード
3. index_v83.html を開き、設定→削除を依頼するを試す。delete-account.htmlもブラウザでテスト。
4. 複数アプリで同じSupabase Authを共有しているため、アカウントの自動削除は実装していません。依頼を受けたら運営者が管理画面で確認・削除作業を行う必要があります。
5. プライバシーポリシーと問い合わせページは草案です。運営者名・連絡先メール・実際の保存/削除運用を必ず確認してから公開してください。
6. Google Play申請では、削除URLに https://suya-suya0.github.io/tamepoyo/delete-account.html 、プライバシーポリシーURLに https://suya-suya0.github.io/tamepoyo/privacy.html を設定する想定です（公開後にURLが開けるか確認）。
7. GitHubの認証キーや署名鍵はアップロード不要。
8. v8.2以降の最新版自動取得は既存のindex.html側の仕組みを利用します。

重要: この更新版は「削除依頼の受付」であり「削除完了」ではありません。申請に先立ち実処理と問い合わせ体制の確立が必要です。
