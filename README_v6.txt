ためぽよ v6 GitHub更新セット

1. ZIPを解凍します。
2. GitHub suya-suya0/tamepoyo のリポジトリ直下へ index_v6.html と tamepoyo_v6.js を追加します。
3. sw.js は更新用なので既存の同名ファイルと置き換えます。
4. Commit changes を押します。
5. https://suya-suya0.github.io/tamepoyo/index_v6.html で直接確認してください。
6. 自動最新版ルーター index.html の動作は別途確認が必要です（index.htmlは変更しません）。

追加SQLは不要です。既存 tamepoyo.categories.icon カラムにぽよアイコンIDを保存します。
初回ログイン時に不足した初期カテゴリをユーザーごとに自動作成します。既存カテゴリは保持します。
各カテゴリのアイコンはユーザーごとに保存されます。
円グラフは支払い済みの「支出」だけでカテゴリ別内訳を表示。収入・予定は除きます。
古いブラウザで画面更新されない場合はアプリの再起動、ブラウザの再読み込みを試してください。
Supabase接続・2人同期は稼働済みアカウントでの実機試験が必要です。
