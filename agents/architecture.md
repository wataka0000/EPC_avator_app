# agents/architecture.md

## 目的
- このファイルは「壊してはいけない構造」と「互換性維持の要点」を定義する。
- 実装時はこの構造を前提に、UI層で完結する変更を優先する。

## システム構成（現行）
- フロント: Next.js App Router (`app/`)
- BaaS: Supabase（Auth / Database / Storage / Realtime / Edge Functions）
- 画像生成: `supabase/functions/generate-snapshot/index.ts`

## 状態機械（最重要）
- 中心テーブル: `user_snapshots`
- モデル: single-row-per-user（ユーザーごとに最新スナップショット1行）
- UIで扱う状態値: `idle | generating | ready | failed`
- 互換レイヤ: 一部実装で `queued` を受信し `generating` に正規化している
- 原則: 状態値の意味・遷移契約は変更しない

## 主要データフロー
1. ユーザーが `app/skills/page.tsx` で入力
2. `skill_assessments` と `skill_assessment_values` に保存
3. Edge Function `generate-snapshot` を呼び出し
4. 生成結果が Storage / `user_snapshots` に反映
5. ロビーが Realtime購読で更新を受信し再描画

## Realtime / 生成ロジック
- ロビー購読hook: `app/lobby/_hooks/useLobbySnapshot.ts`
- 生成トリガhook: `app/lobby/_hooks/useGenerateSnapshot.ts`
- Realtimeチャネル意味と購読条件は契約扱い（変更禁止）
- 再生成時は `latest_assessment_id` を使った既存フローを維持

## 主要テーブル（コードから確認できる範囲）
- `user_snapshots`
- `profiles`
- `skill_domains`
- `skill_subdomains`
- `skill_items`
- `skill_assessments`
- `skill_assessment_values`

## フロント主要パス
- ロビー:
  - `app/lobby/page.tsx`
  - `app/lobby/_components/*`
  - `app/lobby/_hooks/*`
  - `app/lobby/_types.ts`
- スキル入力: `app/skills/page.tsx`
- ログイン: `app/login/page.tsx`
- 他ユーザー: `app/users/page.tsx`
- 設定: `app/settings/page.tsx`
- 共通ユーティリティ:
  - `app/lib/supabaseClients.ts`
  - `app/lib/utils.ts`

## Edge Function配置
- `supabase/functions/generate-snapshot/index.ts`
- 関連設定:
  - `supabase/functions/deno.json`
  - `supabase/functions/deno.lock`

## 変更時の注意（破壊的変更禁止、互換性維持）
- 既存hookの引数/戻り値契約を壊さない。
- `snapshot` フィールドの rename/remove をしない。
- レスポンス形状を前提にした UI 部品の互換性を維持する。
- `generate-snapshot` の呼び出し契約を変更しない。
- `user_snapshots` の状態意味をUI都合で再解釈しない。
- Realtime不達時の挙動（現行の保険処理）を無断で撤去しない。

## UI改善で許可されるアーキテクチャ内変更
- コンポーネント分割/再配置（`app/lobby/_components` 内）
- Tailwindクラス、トークン、デザインシステムの整備
- 状態別描画のUI改善（意味不変）
- 防御的レンダリング強化（null/partial payload対応）

## 禁止される変更
- DBテーブル設計変更、RLS変更、トリガー変更
- Edge Function契約変更
- Realtimeチャンネル・イベント意味変更
- Storage運用ルール変更
- バックエンドのランク算出ロジック変更

## 既知の実装上注意点
- `app/lobby/_types.ts` には `queued` が型として残存している。
- UI側では `queued -> generating` 正規化を実施している。
- 上記は互換吸収として扱い、状態機械の公式意味は `idle|generating|ready|failed` を維持する。

## TODO
- TODO: `user_snapshots` の完全カラム定義はマイグレーション確認が必要（本ファイルはコード参照ベース）。
- TODO: Storageバケット名・パス命名規約の公式文書化が未整備。

