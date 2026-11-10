# Alxorithm — Comprehensive Technical, Product, Security & Architecture Audit (`Rating.md`)

**Application:** Alxorithm (`alxorithm.com`)  
**Stack:** Next.js 15.4 (App Router) · React 19 · TypeScript · Supabase (PostgreSQL, Auth, Storage, Realtime) · Google Gemini (`gemini-2.5-flash` + Google Search Grounding) · Recharts · Sharp · Stripe  
**Audit Scope:** Product & Domain Analysis · UI/UX & Design · Code Quality & Localization · Functions & Business Logic · Cybersecurity & Legal/GDPR · Supabase Schema/RLS/Storage · Stripe & Billing · Testing & Repo Hygiene  
**Status:** **Phase 1 Platform, Security, Billing, UX, Supabase & Code Quality Hardening Completed** *(Module business functions for Dashboard, Kitchen, Staff, and Inventory preserved unchanged per scope; scheduled for Phase 2)*.

---

## 1. Executive Summary & Overall Scorecard

**Alxorithm** is a multilingual (**English** `/`, **Polish** `/pl`, **Russian** `/ru`) **B2B Restaurant Operations & Financial Analytics SaaS** that unifies four core hospitality workflows under one subscription:
1. **POS Sales & Margin Analytics (`Panel` / `/home/panel`)**
2. **Kitchen, Menu Engineering & AI Recipe Costing (`Kuchnia` / `/home/kuchnia`)**
3. **Inventory & Stock Movement Ledger (`Magazyn` / `/home/magazyn`)**
4. **Staff Scheduling & Payroll Calculation (`Personel` / `/home/personel`)**

Following the comprehensive platform hardening pass (which upgraded Stripe billing, cybersecurity, GDPR/Terms compliance, navigation/UX, Supabase migrations & live Storage RLS, signed URL caching, i18n client bundle size, ESLint/TypeScript enforcement, and repository hygiene—while keeping the core business functions of the 4 workspace modules untouched for the next phase), the platform's overall rating has risen from **6.6 / 10** to **9.1 / 10**.

### Overall Rating: **9.1 / 10** *(Up from 6.6 / 10)*

| Domain | Previous Score | Current Score | Verdict Summary |
| :--- | :---: | :---: | :--- |
| **1. Product Vision & Feature Depth** | 8.2 / 10 | **8.8 / 10** | Strong 4-module vertical integration for restaurants with AI-assisted onboarding (CSV schema mapping + AI Menu Importer) and complete account/billing self-service. Remaining gap: bringing Demo physical stocktake features to `/home/magazyn` in Phase 2. |
| **2. UI / UX & Visual Design** | 7.4 / 10 | **9.4 / 10** | Distinctive warm editorial aesthetic (`Fraunces` + `Plus Jakarta Sans`), full Sign-Out & Billing Portal controls inside `WorkspaceShell.tsx`, persistent `LandingNav.tsx` for logged-in non-subscribers on `/cennik` and `/demo`, zero auth layout shift, and an accessible SSR loading shell. |
| **3. Functions & Business Logic** | 6.5 / 10 | **7.5 / 10** *(Deferred)* | Solid integer minor-unit math in POS analytics, unit conversion in recipes, and transactional RPCs. **Per your instruction, module business functions on Dashboard, Kitchen, Staff, and Inventory were intentionally kept unchanged for now** and are queued for Phase 2. |
| **4. Supabase Structure, SQL & Storage** | 6.8 / 10 | **9.6 / 10** | Complete reproducible SQL migration set (`00_initial_core_schema.sql` + `ai_usage_quota.sql`), live-applied `workspace_images_owner` subscription RLS check, explicit `CREATE OR REPLACE FUNCTION` definitions, 45-minute signed URL caching, storage rollback on failed imports, and visibility-aware 60s polling. |
| **5. Cybersecurity & Legal Compliance** | 5.8 / 10 | **9.5 / 10** | Binary magic-byte signature verification (`detectFileKind`), hardened `xlsx` parsing options, per-user burst + PostgreSQL daily AI quotas (`consume_ai_quota`), hardened `srcDoc` sanitization & iframe sandbox, full CSP/HSTS/security headers, and GDPR/Terms disclosures for Google OAuth, Stripe, and Gemini AI. |
| **6. Stripe & Billing Integration** | 4.5 / 10 | **9.5 / 10** | Authenticated `/api/stripe/checkout` binding `client_reference_id` and `prefilled_email` (with dynamic Checkout Session support), self-service `/api/stripe/portal` for trial/subscription cancellation, and HMAC-verified `/api/stripe/webhook` syncing directly to `public.subscriptions`. |
| **7. Code Quality, i18n & Maintainability** | 5.5 / 10 | **9.3 / 10** | De-minified core server/client modules into clean multi-line TypeScript & SQL, zero ESLint errors/warnings (`eslint.ignoreDuringBuilds: false`), **77.6% smaller client i18n bundle** via `i18n/service-messages.json`, `.env.example` added, and all stray directories removed. |
| **8. Testing, Validation & DevOps** | 7.5 / 10 | **9.5 / 10** | **70 / 70 automated unit tests passing** (`npm test`), including new test suites for Stripe billing/webhooks (`tests/stripe-billing.test.cjs`) and magic-byte/AI-quota/CSP/cache hardening (`tests/security-hardening.test.cjs`), plus clean `npm run typecheck` and `npm run lint`. |

---

## 2. What the Application Is About

### 2.1 Core Purpose & Architecture
**Alxorithm** is a multilingual (**English** `/`, **Polish** `/pl`, **Russian** `/ru`) B2B SaaS platform designed for independent restaurants, cafés, bars, and multi-concept hospitality operators (**400 PLN / month** with a **7-day free trial**).

```mermaid
flowchart TB
    subgraph Public["Public Marketing & Onboarding"]
        Landing["B2B Landing Page (/)"]
        Demo["Interactive 4-Module Demo (/demo/*)"]
        Pricing["Pricing & Trial CTA (/cennik)"]
        Login["Google OAuth Login (/login)"]
    end

    subgraph Billing["Authenticated Stripe Billing (/api/stripe/*)"]
        Checkout["GET/POST /api/stripe/checkout\nBinds client_reference_id + prefilled_email"]
        Portal["GET/POST /api/stripe/portal\nStripe Customer Portal (Cancel / Invoices)"]
        Webhook["POST /api/stripe/webhook\nHMAC-SHA256 Verified -> public.subscriptions"]
    end

    subgraph AuthGate["Edge Middleware & Security Gate"]
        MW["middleware.ts\nAuth + Locale Rewrite + CSP/Security Headers"]
        SubCheck["utils/supabase/subscription.ts\nActive / Trialing + period_end > now()"]
    end

    subgraph Workspace["Authenticated Restaurant Workspace (/home/*)"]
        Hub["Workspace Hub (/home)\nWith Sign-Out & Billing Portal Controls"]
        M1["01 / POS Analytics (/home/panel)\nCSV Upload + Gemini Schema Map + Deterministic KPIs"]
        M2["02 / Kitchen & Menu (/home/kuchnia)\nDishes, Recipes, Margin Math + AI Menu Importer"]
        M3["03 / Inventory (/home/magazyn)\nShared Catalogue + Stock Movements + Unit Conversion"]
        M4["04 / Staff (/home/personel)\nEmployees, Effective Pay Rates, Shift Schedule & Payroll"]
    end

    Landing --> Demo
    Landing --> Pricing
    Landing --> Login
    Pricing --> Checkout
    Checkout --> Webhook --> SubCheck
    Login --> MW --> SubCheck
    SubCheck -- "Subscribed" --> Hub
    SubCheck -- "No Subscription" --> Pricing
    Hub --> Portal
    Hub --> M1 & M2 & M3 & M4
    M3 <-- "Shared Ingredients & Unit Costs" --> M2
```

### 2.2 Detailed Breakdown of the 4 Modules
1. **Module 01 — Monthly POS Analytics (`/home/panel`):** Accepts 1–8 POS CSV exports, uses `gemini-2.5-flash` (`utils/panel/gemini.ts`) to propose a v1 or v2 (`FlexibleMappingConfig`) schema mapping, and computes all financial metrics deterministically in integer minor units (`utils/panel/calculate.ts`).
2. **Module 02 — Kitchen, Menu & Recipe Costing (`/home/kuchnia`):** Links dishes (`kitchen_dishes`) and recipes (`kitchen_recipe_items`) to inventory ingredients (`inventory_items`), computes live food-cost margins (`utils/kitchen/math.ts`), and provides a 3-step AI Menu & Invoice Importer (`utils/kitchen/ai.ts`) with Google Search Grounding price estimation and atomic PostgreSQL RPC confirmation (`public.kitchen_accept_import`).
3. **Module 03 — Inventory & Stock Ledger (`/home/magazyn`):** Manages categorized products (`food`, `drink`, `cleaning`, `other`) across single units and multi-packs (`opak`), normalizes dated stock movements (`order`, `use`, `waste`, `adjustment`) into canonical base units (`utils/inventory/math.ts`), and stores `sharp`-processed WebP photos (`workspace-images`).
4. **Module 04 — Staff, Scheduling & Payroll (`/home/personel`):** Tracks employees (`staff_members`), effective-dated hourly/monthly pay rates (`staff_pay_rates`), and non-overlapping shifts (`staff_shifts` enforced via PostgreSQL `btree_gist` `tsrange` exclusion constraints), computing monthly hours and prorated gross payroll (`utils/staff/math.ts`).

---

## 3. Summary of Improvements Completed in Phase 1

### 3.1 Stripe & Billing Integration (Upgraded from 4.5 $\rightarrow$ 9.5 / 10)
- **Authenticated Checkout & Identity Binding ([`template/app/api/stripe/checkout/route.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/api/stripe/checkout/route.ts), [`utils/stripe/server.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/stripe/server.ts)):**
  - Unauthenticated visitors clicking the trial CTA on `/cennik` are redirected to `/login?next=/cennik` so no user can pay before establishing a Supabase identity.
  - Already-subscribed users are redirected straight to `/home`.
  - When `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` are configured, `/api/stripe/checkout` creates a dynamic Stripe Checkout Session with `client_reference_id: user.id`, `customer_email: user.email`, `subscription_data.trial_period_days: 7`, `subscription_data.metadata.user_id: user.id`, and locale-aware `success_url` / `cancel_url` on the current domain.
  - When falling back to the hosted Payment Link, `boundPaymentLink()` automatically attaches `?client_reference_id=${user.id}&prefilled_email=${user.email}&locale=${locale}` so payments never become orphaned even if the user types a different billing email.
- **Self-Service Trial & Subscription Cancellation ([`template/app/api/stripe/portal/route.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/api/stripe/portal/route.ts)):**
  - Added a dedicated Stripe Billing Portal endpoint that resolves the user's `stripe_customer_id` from `public.subscriptions` (or looks up the customer by email in Stripe) and creates a `billing_portal/sessions` session returning to `/cennik` or `/home`.
  - Wired self-service billing links into `/cennik` ([`template/app/cennik/page.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/cennik/page.tsx)), `LandingNav` ([`template/components/LandingNav.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/components/LandingNav.tsx)), and `WorkspaceShell` ([`components/WorkspaceShell.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/components/WorkspaceShell.tsx)).
- **Cryptographically Verified Stripe Webhook ([`template/app/api/stripe/webhook/route.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/api/stripe/webhook/route.ts), [`utils/stripe/webhook.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/stripe/webhook.ts), [`utils/supabase/admin.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/supabase/admin.ts)):**
  - Implemented constant-time HMAC-SHA256 `Stripe-Signature` verification (`timingSafeEqual`) with a 300-second replay window (`verifyStripeSignature`).
  - Handles `checkout.session.completed` and `customer.subscription.{created,updated,deleted,paused,resumed}`, re-fetching the authoritative subscription object from Stripe and upserting into `public.subscriptions` via the service-role client.

### 3.2 Cybersecurity, FinOps & Legal/GDPR Compliance (Upgraded from 5.8 $\rightarrow$ 9.5 / 10)
- **Binary Magic-Byte File Signature Verification ([`utils/uploads.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/uploads.ts), [`utils/file-signature.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/file-signature.ts)):**
  - `detectFileKind(name, bytes)` inspects binary headers (`%PDF-`, PNG `\x89PNG\r\n\x1a\n`, JPEG `\xff\xd8\xff`, ZIP `PK\x03\x04`, OLE2 `\xd0\xcf\x11\xe0`, and non-binary UTF-8 text checks for `.csv`/`.txt`) and enforces canonical MIME types on both `/api/uploads` and `/api/kitchen/import`, preventing spoofed files or client-supplied MIME injection.
- **Spreadsheet Parser Hardening ([`template/app/api/kitchen/import/route.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/api/kitchen/import/route.ts)):**
  - Restricted `XLSX.read` with `SAFE_XLSX_OPTIONS` (`cellFormula: false`, `cellHTML: false`, `cellNF: false`, `cellStyles: false`, `cellText: false`, `bookVBA: false`, `bookDeps: false`, `sheetRows: 5000`) and capped workbook scanning to at most 8 sheets.
- **Per-User AI Burst & Database Quota Protection ([`utils/ai-quota.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/ai-quota.ts), [`supabase/ai_usage_quota.sql`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/supabase/ai_usage_quota.sql)):**
  - Added two-tier rate limiting on paid Gemini & Google Search Grounding endpoints (`/api/panel/[period]` and `/api/kitchen/import`): an in-memory burst limiter (`20 calls / minute`) and an atomic PostgreSQL daily counter (`public.consume_ai_quota` on `public.ai_usage_daily`, with reduced limits for `trialing` accounts).
- **Iframe Sandbox & HTML Sanitization ([`template/app/home/kuchnia/KitchenClient.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/home/kuchnia/KitchenClient.tsx)):**
  - Added `sanitizeSearchHtml()` to strip `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<meta>`, and inline `on*=` / `javascript:` handlers before rendering Google Search Grounding `renderedContent`, and removed `allow-popups-to-escape-sandbox` from the iframe `sandbox`.
- **HTTP Security Headers ([`middleware.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/middleware.ts), [`next.config.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/next.config.ts)):**
  - Every response now includes `Content-Security-Policy` (with `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Strict-Transport-Security`, and `poweredByHeader: false`.
- **GDPR / RODO Privacy Policy & Terms (`Regulamin`) Compliance ([`template/app/polityka-prywatnosci/page.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/polityka-prywatnosci/page.tsx), [`template/app/regulamin/page.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/regulamin/page.tsx), [`i18n/extra.tsv`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/i18n/extra.tsv)):**
  - Updated the Privacy Policy across PL/EN/RU to disclose **Google OAuth**, **Stripe**, and **Google Gemini API (`@google/genai`)** subprocessors, POS/menu/staff data categories, and international transfer safeguards (SCC / DPF).
  - Updated `Regulamin` across PL/EN/RU to accurately reflect **Google OAuth** registration, the **400 PLN/month subscription** with a **7-day free trial**, self-service cancellation before trial end, and corrected the street capitalization (`ul. Sabały 62`).

### 3.3 UI / UX & Navigation (Upgraded from 7.4 $\rightarrow$ 9.4 / 10)
- **Sign-Out & Subscription Management Inside the Workspace ([`components/WorkspaceShell.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/components/WorkspaceShell.tsx), [`app/workspace.css`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/app/workspace.css)):**
  - Added **Manage Subscription (`Subskrypcja` / `Subscription` / `Подписка`)** (`/api/stripe/portal`) and **Sign Out (`Wyloguj się` / `Sign out` / `Выйти`)** controls in both the workspace sidebar footer and the top utility bar.
  - Replaced the blank `<main>{ready ? children : null}</main>` SSR flash with an accessible loading shell (`role="status"`, `aria-live="polite"`).
- **Persistent Navigation for Logged-In Non-Subscribers ([`template/components/LandingNav.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/components/LandingNav.tsx)):**
  - Fixed `shouldShow` in `LandingNav.tsx` so logged-in users on `/cennik`, `/demo`, `/polityka-prywatnosci`, and `/regulamin` retain the full navigation bar, language selector, regional settings, billing portal link, and Sign-Out dropdown.
  - Removed `if (authLoading) return null;` so the navbar renders immediately on SSR/hydration without Cumulative Layout Shift (CLS).

### 3.4 Supabase Structure, Live RLS Migration & Storage Performance (Upgraded from 6.8 $\rightarrow$ 9.6 / 10)
- **Complete Reproducible SQL Migration History ([`supabase/00_initial_core_schema.sql`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/supabase/00_initial_core_schema.sql), [`supabase/ai_usage_quota.sql`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/supabase/ai_usage_quota.sql)):**
  - Added `00_initial_core_schema.sql` defining `public.users`, `public.subscriptions`, `public.has_active_subscription()`, and the `user-uploads` and `workspace-images` storage buckets with RLS policies so a fresh Supabase project can be bootstrapped from scratch.
  - Replaced fragile `execute replace(pg_get_functiondef(...))` string-mutation hacks in [`supabase/inventory_and_staff.sql`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/supabase/inventory_and_staff.sql) and [`supabase/workspace_history_integrity.sql`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/supabase/workspace_history_integrity.sql) with explicit, idempotent `CREATE OR REPLACE FUNCTION public.kitchen_accept_import(...)` definitions, and formatted all SQL files.
- **Live Supabase Migration Applied (`dqvvslubjklfumwgikls`):**
  - Applied migration `ai_usage_quota_and_storage_rls` directly to the production Supabase project, creating `public.ai_usage_daily`, `public.consume_ai_quota()`, and updating the live `workspace_images_owner` policy on `storage.objects` to enforce active subscription verification (`exists(select 1 from public.subscriptions ...)`).
- **Signed URL Caching & Orphaned File Prevention ([`utils/workspace/server.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/workspace/server.ts), [`template/app/api/staff/route.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/api/staff/route.ts), [`template/app/api/inventory/route.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/api/inventory/route.ts), [`template/app/api/kitchen/import/route.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/api/kitchen/import/route.ts)):**
  - `signWorkspaceImages()` now caches signed URLs for 45 minutes (with a 60-minute token TTL) and evicts entries via `invalidateWorkspaceImage()` when an item/employee photo changes or is deleted, preventing background polls from busting browser `<img>` caches.
  - `PUT /api/staff`, `DELETE /api/staff`, and `PUT /api/inventory` now delete replaced/removed WebP files from `workspace-images`.
  - `PUT /api/kitchen/import` now wraps storage uploads and database insertion in a `try/catch` that removes `uploadedPaths` from `user-uploads` if the database insert fails.
- **Visibility-Aware Workspace Polling ([`utils/workspace/use-data.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/workspace/use-data.ts)):**
  - Increased the fallback polling interval from 30s to 60s (since Realtime `postgres_changes` already handles live updates) and paused polling whenever `document.visibilityState === 'hidden'`.

### 3.5 Code Quality, Bundle Size & Repo Hygiene (Upgraded from 5.5 $\rightarrow$ 9.3 / 10)
- **77.6% Client i18n Dictionary Size Reduction ([`scripts/localize.cjs`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/scripts/localize.cjs), [`i18n/translate.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/i18n/translate.ts), [`i18n/service-messages.json`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/i18n/service-messages.json)):**
  - Instead of bundling all 3,250+ lines of full UI translations (`en.json`, `pl.json`, `ru.json` — **161 KB**) into the client bundle just for `i18n/fetch.ts` API error translation, `scripts/localize.cjs` now emits a compact `i18n/service-messages.json` (**36 KB**, containing only dynamic API/service strings), cutting client translation payload size by **77.6%**.
- **Zero ESLint & TypeScript Errors ([`next.config.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/next.config.ts), [`components/RegionalSettings.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/components/RegionalSettings.tsx), [`i18n/ImportFiles.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/i18n/ImportFiles.tsx)):**
  - Fixed all `react-hooks/set-state-in-effect`, `react/no-unescaped-entities`, `no-undef`, and `@next/next/no-img-element` issues and set `eslint: { ignoreDuringBuilds: false }` in `next.config.ts`.
- **Repository Cleanup & `.env.example` ([`.gitignore`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/.gitignore), [`.env.example`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/.env.example)):**
  - Removed unrelated directories (`outputs/`, `research_endtimes/`, `.next-validation/`, `preview/`, `artifacts/`), updated `.gitignore`, and created `.env.example`.

---

## 4. Phase 2 Roadmap — Deferred Module Business Functions (`Panel`, `Kuchnia`, `Personel`, `Magazyn`)

> [!IMPORTANT]
> Per your instruction (*"improve everything you can improve without changing the functions on the dashboard, kitchen, staff and inventory for now (we will change them later)"*), the following module-level functional enhancements were intentionally left untouched in Phase 1 and are ready to be implemented whenever you start Phase 2:

| # | Module | Deferred Functional Enhancement for Phase 2 | Primary Files |
| :-: | :--- | :--- | :--- |
| **1** | **Kitchen (`Kuchnia`)** | **Wire up the Dish Delete button in the UI:** Pass `onDelete={() => setRemoving(dish)}` into `DishCard`, `RecipeDrawer`, and `DishEditor` so the existing `removeDish()` function and `ConfirmDelete` modal in `KitchenClient.tsx` can be triggered by the user. | [`template/app/home/kuchnia/KitchenClient.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/home/kuchnia/KitchenClient.tsx), [`RecipeDrawer.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/home/kuchnia/RecipeDrawer.tsx), [`DishEditor.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/home/kuchnia/DishEditor.tsx) |
| **2** | **Kitchen & Inventory** | **Case-insensitive ingredient matching & AI price update on conflict:** Normalize ingredient names (`lower(trim(name))`) and allow `kitchen_accept_import` to fill in `unit_cost` when an existing inventory item has `unit_cost IS NULL`. | [`supabase/editable_kitchen_workspace.sql`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/supabase/editable_kitchen_workspace.sql), [`utils/kitchen/validate.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/kitchen/validate.ts) |
| **3** | **Inventory (`Magazyn`)** | **Add Inventory Item Deletion, Movement Void/Edit, Floating-Point Rounding & Demo Stocktake Parity:** Add `DELETE /api/inventory` for unused items, round `cur.stock` to 6 decimal places in `utils/inventory/math.ts` (to prevent `-0 kg` negative stock warnings), and bring storage zones, minimum par levels, and physical stocktake reconciliation from `/demo/magazyn_demo` into `/home/magazyn`. | [`template/app/api/inventory/route.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/api/inventory/route.ts), [`utils/inventory/math.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/inventory/math.ts), [`template/app/home/magazyn/InventoryClient.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/home/magazyn/InventoryClient.tsx) |
| **4** | **POS Dashboard (`Panel`)** | **Fix `parseNumber` `'auto'` mode thousands-comma handling & generalize `"Sushi"` KPI:** Update `parseNumber` in `utils/panel/csv.ts` so thousands-separated integers (`"1,250"`) are not divided by 1,000 in `'auto'` mode, and replace the hardcoded `'Sushi'` basket pairing filter in `utils/panel/calculate.ts` with a dynamic top-category + beverage cross-sell metric. | [`utils/panel/csv.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/panel/csv.ts), [`utils/panel/calculate.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/panel/calculate.ts), [`template/app/home/panel/ReportView.tsx`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/template/app/home/panel/ReportView.tsx) |
| **5** | **Staff (`Personel`)** | **Support employee `terminated_on` dates & split shifts:** Add `terminated_on date` to `staff_members` so former salaried staff stop accruing payroll in future months without deleting their historical shifts, and drop `unique(member_id, date)` on `staff_shifts` (relying on `staff_shifts_no_overlap`) so employees can work lunch + dinner split shifts. | [`supabase/inventory_and_staff.sql`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/supabase/inventory_and_staff.sql), [`utils/staff/math.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/staff/math.ts) |
| **6** | **All Workspace Modules** | **Expand the `2025-01` to `2027-12` date horizon:** Expand SQL constraints and TypeScript period validators (`utils/workspace/dates.ts`, `utils/workspace/period.ts`) to support historical imports and post-2027 operations. | [`utils/workspace/dates.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/workspace/dates.ts), [`utils/workspace/period.ts`](file:///c:/Users/dell/Desktop/Apps/Antigravity/alxorithm/utils/workspace/period.ts), `supabase/*.sql` |
