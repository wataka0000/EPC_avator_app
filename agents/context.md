# agents/context.md

## このプロジェクトの現在地
- プロジェクトは Next.js App Router + Supabase 構成で動作している。
- 主要機能は稼働済みで、現在は UI 改善フェーズ。
- 現フェーズの主対象は `lobby` 体験の品質向上（見た目、情報階層、状態表現）。

## 既に成立している機能（前提）
- ユーザーがスキルを入力する（0-5）。
- サーバー側ロジックでランクが算出される（Gold / Silver / Bronze）。
- Edge Function 経由でアバター画像を生成する。
- 生成画像は Supabase Storage に保存される。
- `user_snapshots` にユーザーごとの最新状態が保存される。
- ロビーは Realtime で `user_snapshots` 更新を受け取り描画更新する。

## 現在の開発フェーズ
- フェーズ: UI improvement / polish。
- 目的: enterprise-grade + game-inspired なロビーUIへ改善。
- スコープ: フロントエンド中心（構造、デザインシステム、UX、アクセシビリティ）。

## v0統合の前提
- v0はUI案の生成器として使う。
- v0の出力はそのまま採用せず、既存hook/props契約に合わせて統合する。
- v0が生成するモックデータ・仮API・未定義トークンは統合時に除去/調整する。
- 運用フローは「v0生成 → codex review → 最小差分統合」を標準とする。

## 変更してよいもの
- `app/lobby/**` のUI構造・スタイル・表示文言。
- 必要に応じた `app/**/_components/**` のUI部品整理。
- 既存契約を壊さない範囲での `app/**/_hooks/**` のUI都合修正。
- ローディング、エラー、空状態、スケルトン、フォーカス状態などの改善。
- Tailwindベースのデザイン統一、トークン化、レスポンシブ調整。

## 変更禁止（ユーザー明示指示なし）
- DB設計（テーブル、カラム、RLS、トリガー）。
- Edge Function の仕様・契約・振る舞い。
- `user_snapshots` 状態機械の意味変更。
- Realtime購読モデルの意味変更。
- Storageパス規約・公開設定変更。
- APIレスポンスの必須フィールド変更（rename/remove）。

## 今回のドキュメント分割の目的
- 役割と規約: `agents/agents.md`
- プロジェクトの現在地: `agents/context.md`（このファイル）
- 壊してはいけない構造: `agents/architecture.md`
- 起動時の読み込み手順: `agents/init.md`

## 旧ガイドの扱い
- 旧 `AGENTS.md` はアーカイブとして保持する。
- 新規運用では `agents/init.md` を起点に `agents/` 配下を参照する。

## TODO
- TODO: ランク算出ロジックの実装場所（DB function / Edge Function / 他）はコード上で明確に追跡未完了。仕様変更禁止対象としてのみ扱う。
- TODO: Storage の具体パス命名規約は本リポジトリ内に明示ドキュメントがないため、現行実装優先で保持。

