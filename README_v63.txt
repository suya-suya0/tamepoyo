ためぽよ v6.3 更新セット

GitHub Pages /tamepoyo/ のルートに、ZIPを解凍したファイルを配置してください。
新規追加: index_v63.html, tamepoyo_v63.js
更新: sw.js, manifest.json
継続使用: poyo-transparent-v61.png
index.html は置換不要。直接URL: https://suya-suya0.github.io/tamepoyo/index_v63.html

変更点: ほしいもの一覧で削除ボタン、確認後にSupabaseへ削除要求。
スマホ初回訪問時のインストール案内。Androidのブラウザが beforeinstallprompt を提供した場合のみネイティブ導線を実行。iOSはSafariでの手順案内。
この案内は同じタブで「あとで」を押すと非表示になり、設定の「インストール方法を見る」から再表示できます。

注意:
1. GitHubに index_v63.html と tamepoyo_v63.js の両方をアップロード（同じフォルダ）。
2. icon-192.png と icon-512.png が既存GitHubにある必要があります。
3. ログイン・Supabase/RLS・実端末のインストール表示は公開後に検証してください。
4. 削除が外部キー制約などで失敗したら画面にエラーが出ます。依存データは自動削除しません。
5. iPhoneのOS標準インストール確認画面をウェブから自動で開くことはできません。
