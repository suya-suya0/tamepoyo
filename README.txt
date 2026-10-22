ためぽよ v8.2：家計簿の「内容」を任意入力に変更

GitHubのtamepoyoリポジトリのトップ階層へ
index_v82.html と tamepoyo_v82.js をアップロードしてください。
index.html / sw.js / manifest.json / 既存のPNG / Supabaseは変更不要です。

更新後の確認URL：
https://suya-suya0.github.io/tamepoyo/index_v82.html

動作：通常の「今日の収支」と「収支を入力／編集」両方で内容が空欄でも保存できます。
内容のDB値はNULLではなく空文字列として保存します。
