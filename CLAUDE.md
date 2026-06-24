@AGENTS.md

# 部署架構與規範（Deployment）

> 本章節為本專案的部署「真實來源」。每個 session 都要先讀並遵守。

## 帳號歸屬（重要）
- GitHub repo：放在「我（開發者）」的帳號，且為 **Public 公開 repo**。
  → 公開 repo 是為了讓朋友的 Vercel Hobby 免費版能跨帳號自動部署
    （Hobby 私有 repo 不支援協作，公開則免費）。
- Supabase：放在「朋友（產品擁有者）」的帳號，資料與帳單歸他。我被加為 Team 成員。
- Vercel：放在「朋友」的帳號，用他的 GitHub 登入，透過 collaborator 連到我的公開 repo
  （此為「方法 A」）。

## 部署流程（持續部署）
- 我 push 到公開 repo 的 main → 朋友的 Vercel 自動重新部署。
- 朋友的 Vercel 是用他的 GitHub 帳號登入，而他被加為我 repo 的 collaborator，
  所以看得到並能連結此 repo。
- 部署觸發者驗證：因為是公開 repo，協作不受 Hobby 限制，我的 commit 也能觸發部署。

## 環境變數（Environment Variables）
本機 .env.local 與 Vercel 專案的 Environment Variables 都要設定以下三個，值來自「朋友的」
Supabase 專案（Project Settings → API）：
- NEXT_PUBLIC_SUPABASE_URL        = 朋友 Supabase 的 Project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY   = anon public key（可公開）
- SUPABASE_SERVICE_ROLE_KEY       = service_role key（機密，僅 server 端使用）

規則：
- service_role key 只在 server 端（Server Actions / server modules）使用，
  絕不進 client bundle、絕不寫死在程式碼。
- .env.local 必須列入 .gitignore，「絕對不可」commit 進公開 repo
  （repo 公開 = 全世界看得到，洩漏 service_role 等於資料庫被攻破）。
- 一律提供 .env.example（只放變數名稱、不放真實值）。
- Gemini API key 不放環境變數：依設計由各使用者在 app 設定頁自行輸入，
  存進 Supabase profiles（RLS 保護），呼叫一律走 Server Action 在 server 端執行。

## 資料庫 Migration 套用方式
- 所有 schema 變更用 SQL migration 檔管理（版本控管）。
- 套用到朋友的 Supabase 有兩種方式，請在文件中說明清楚並擇一：
  (a) Supabase CLI：`supabase link` 到朋友的 project ref 後 `supabase db push`。
  (b) 手動：把 migration SQL 貼進 Supabase Dashboard 的 SQL Editor 執行。
- 每個 table 一定要有 RLS policy（預設 deny、auth.uid() = user_id 才 allow）。

## 首次部署檢查清單（給我自己跑）
1. 確認 .env.local 三個變數都填好（朋友的 Supabase 值）。
2. 本機 `pnpm dev` 能連上朋友的 Supabase、登入與讀寫正常。
3. 套用 migration 到朋友的 Supabase，確認所有 table + RLS 已建立。
4. repo 設為 Public，朋友已接受 collaborator 邀請。
5. 朋友的 Vercel 已 import 此 repo，並在 Vercel 填好同樣三個環境變數。
6. push main → 確認 Vercel 自動部署成功、線上可登入與讀寫。

## 安全紅線（每次都要守）
- 公開 repo：任何機密（key、密碼、token）一律不得進版控。
- 錯誤訊息不對 client 吐 stack trace / 內部細節。
- 所有 Server Action 入參用 Zod 驗證，server 端再驗一次。
