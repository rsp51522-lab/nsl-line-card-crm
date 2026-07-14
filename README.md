# NSL LINE名刺CRM

営業担当者、個人事業主、中小企業経営者向けの営業支援型名刺CRMです。

## 実装済みの土台

- ホームダッシュボード
- 名刺一覧
- 名刺詳細
- OCR確認画面
- タグ管理
- 商談履歴
- 検索
- 設定/連携
- Supabase向けDBスキーマ
- タグ追加API
- 商談履歴追加API
- 名刺保存API
- OpenAI Responses API によるAIお礼文生成API

## 起動方法

```bash
npm install
npm run dev
```

Supabaseをまだ設定していない場合は、仮データでそのまま画面確認できます。

## 画面の狙い

- `ホーム`: 今日やるべき営業行動を最初に見せる
- `名刺詳細`: 顧客カルテとして使える1画面構成
- `OCR確認`: 誤読候補だけ赤で確認
- `商談履歴`: 営業日報として積み上げられる
- `設定`: AI営業支援と外部連携の見取り図

## DBスキーマ

Supabase用の初期スキーマは `supabase/schema.sql` にあります。

## Supabase接続

1. `.env.example` を元に `.env.local` を作成
2. `NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を設定
3. `supabase/schema.sql` を実行
4. 必要なら `supabase/seed.sql` で初期データを投入

環境変数が入っていればDBを読みます。入っていなければ仮データへ自動フォールバックします。

## OpenAI API接続

1. `.env.local` に `OPENAI_API_KEY` を設定
2. 必要なら `OPENAI_MODEL` を設定
   既定値は `gpt-5.6`
3. 名刺詳細画面の `お礼文を生成` を押す

実装は OpenAI 公式 JavaScript SDK と Responses API を使用しています。OpenAI API未設定時は、画面上で設定不足を明示しつつ代替文面も返すため、操作自体は止まりません。
