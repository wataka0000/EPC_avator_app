# agents/init.md

## Startup Init Pack

起動時は必ず以下の順で読むこと。

1. `agents/agents.md`
2. `agents/context.md`
3. `agents/architecture.md`

## 起動時チェックリスト
- 今回タスクが UI改善か、仕様変更かを判定する。
- 変更対象がフロント範囲内か確認する（DB/Edge/Realtime契約は除外）。
- `user_snapshots` 状態機械（idle/generating/ready/failed）を前提にする。
- 既存hook・既存props契約を壊さない方針を宣言する。
- v0生成物を使う場合は「reviewしてから統合」を前提にする。
- モックデータ・仮API・未定義トークン参照がないか確認する。
- 差分は最小化し、変更ファイルと理由を明示する。
- 不明点は推測せず `TODO:` として文書に残す。

## 実行ルール
- 実装前: 触るファイルを宣言する。
- 実装後: 状態別UI（idle/generating/ready/failed）を確認する。
- 報告時: 変更ファイル、互換性、手動確認項目を簡潔に提示する。
