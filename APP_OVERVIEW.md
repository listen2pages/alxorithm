# Alxorithm — Complete Application Overview & Architecture Guide

## 1. What the App Is

**Alxorithm** (`alxorithm.com`) is a multilingual **B2B Restaurant Management & Hospitality Analytics SaaS Platform** built with **Next.js 15 (App Router)**, **React 19**, **Supabase** (PostgreSQL + Auth + Storage + Realtime), **Google Gemini 2.5 Flash AI**, and **Stripe**.

It is the internationalized, global-ready counterpart to the Polish platform `jedzeniewarszawa.pl` (`warszawski-przewodnik-kulinarny`), sharing the same underlying Supabase backend, user accounts, database tables, storage buckets, and subscription records while supporting **English (`/`)**, **Polish (`/pl`)**, and **Russian (`/ru`)** interfaces alongside configurable regional settings (currency, country, and time zone).

The platform provides restaurant owners and managers with **four integrated operational modules** under a single subscription (`400 PLN / month` with a 7-day free trial via Stripe Payment Links), plus a full **interactive public demo** of all four modules that requires no sign-in.

---

## 2. Core Functional Modules

### Module 01: Monthly POS Analytics (`Panel` — `/home/panel` & `/demo/panel_demo`)
Transforms raw Point-of-Sale (POS) CSV exports from any restaurant POS vendor into deterministic, audited monthly financial and operational dashboards.

- **Flexible Multi-File CSV Import (v1 & v2 Plans)**:
  - Accepts **1 to 8 CSV files** per month (`2025-01` through `2027-12`), up to **20 MB per file** and **60 MB per batch**, or links existing files from the user's private upload vault.
  - SHA-256 content hashing prevents duplicate file attachments in the same month and verifies file integrity before calculation.
- **AI-Assisted Schema Detection (`Gemini 2.5 Flash`)**:
  - Profiles up to 2,000 rows per file and sends the first 5 sample rows + column cardinality profiles to Gemini (`utils/panel/gemini.ts`).
  - Classifies each file role (`items`, `receipts`, `catalogue`, `payments`, `other`), detects column mappings across 15 canonical fields (`receipt_id`, `date`, `time`, `employee`, `product_name`, `category`, `plu`, `net_price`, `vat`, `gross`, `payment`, `tip`, `source`, `quantity`, `tax_amount`), and configures join keys, number formats (`auto`, `decimal-comma`, `decimal-point`), tax modes (`percent`, `fraction`), date formats (`iso`, `dmy`, `mdy`), void/open row filters (`rowFilter`), and category groupings (`main`, `starter`, `food`, `drink`, `alcohol`, `other`).
  - Supports combining multiple non-overlapping same-schema sales files (`additionalSalesFiles`) and separate split-tender payment exports (`payments`).
- **Deterministic Calculation Engine (`utils/panel/calculate.ts` & `utils/panel/flexible.ts`)**:
  - **Zero AI math**: All financial totals and metrics are calculated deterministically in application code using minor currency units (`minorUnits`) to avoid floating-point drift.
  - Produces product sales rankings (`posData`), tax rate breakdowns (`taxBreakdown`), daily revenue & order trends (`dailyTrend`), hourly traffic (`hourlyTrend`), day-of-week performance (`dayOfWeekTrend`), order source & Average Order Value (`sourceStats`), employee revenue & tip attribution (`employeeStats`), payment method splits (`paymentStats`), and basket composition metrics (`avgItemsPerReceipt`, `soloPercentage`, `groupPercentage`, `attachmentRate`, `sushiAlcoholRate`).
  - Includes an **Audit Trail** (`audit`) reporting total rows, included rows, outside-month rows, unmatched lookup rows, and data coverage warnings.
  - Supports **Legacy Price-Matched Product Estimation** (`utils/panel/estimate-products.ts`) when only receipt-level totals and a product catalogue are provided.

---

### Module 02: Kitchen, Menu & Recipe Costing (`Kuchnia` — `/home/kuchnia` & `/demo/kuchnia_demo`)
Manages the restaurant's dishes, recipes, food cost percentages, profit margins, allergens, and AI-powered menu/recipe extraction.

- **Dish & Recipe Editor (`app/api/kitchen/route.ts`, `utils/kitchen/math.ts`)**:
  - Links each dish (`kitchen_items`) to normalized inventory ingredients (`inventory_items`) via recipe lines (`kitchen_recipe_lines`).
  - Automatically converts recipe units (`mg`, `g`, `kg`, `ml`, `cl`, `dl`, `l`, `szt`, `cm`, `m`) to the ingredient's base unit (`kg`, `l`, `szt`, `m`) and enforces unit compatibility in both TypeScript and PostgreSQL triggers (`kitchen_check_units`).
  - Real-time calculation of **portion cost**, **gross profit per portion**, **percentage margin**, **food cost %**, and kitchen-wide averages (`kitchenSummary`).
- **AI Menu & Recipe Importer (`app/api/kitchen/import/route.ts`, `utils/kitchen/ai.ts`)**:
  - Accepts **1 to 3 documents** (CSV, XLSX, XLS, PDF, TXT, PNG, JPG up to 12 MB total).
  - **Step 1 — Extraction (`extractKitchen`)**: Uses `gemini-2.5-flash` with structured JSON schema (`kitchenSchema`) to extract up to 60 dishes, recipes, quantities, VAT rates, portions, prep times, and explicitly declared allergens/diets. When only dish names exist, proposes typical recipes and marks estimated fields (`estimated_fields`) for human review.
  - **Step 2 — Grounded Local Market Price Estimation (`estimatePrices`)**: Uses `gemini-2.5-flash` with **Google Search Grounding** (`google_search`) restricted to the user's configured country and currency to find current retail/wholesale ingredient prices and comparable local restaurant menu prices, recording citation URLs (`sources`) and timestamps (`checked_at`).
  - **Step 3 — Atomic Approval (`kitchen_accept_import` RPC)**: Saves approved draft dishes, upserts missing ingredients into `inventory_items`, and creates `kitchen_recipe_lines` in a single database transaction.

---

### Module 03: Inventory & Stock Movements (`Magazyn` — `/home/magazyn` & `/demo/magazyn_demo`)
Serves as the single shared ingredient & supply catalogue for both stock control and kitchen recipe costing.

- **Normalized Packaging & Unit Pricing (`utils/inventory/math.ts`, `inventory_normalize` trigger)**:
  - Categorizes items into `food`, `drink`, `cleaning`, and `other`.
  - Supports direct units (`mg`, `g`, `kg`, `ml`, `cl`, `dl`, `l`, `szt`, `cm`, `m`) as well as multi-pack purchases (`opak`: `purchase_quantity × units_per_pack × content_quantity`).
  - Automatically normalizes every item to its canonical base unit (`kg`, `l`, `szt`, or `m`) and computes the unit base price (`price = purchase_price / purchase_base_quantity`), immediately updating linked recipe costs in the Kitchen module.
- **Stock Ledger & Movement History (`inventory_movements`, `inventory_record_movement` RPC)**:
  - Records dated movements (`order`, `use`, `waste`, `adjustment`) with idempotency keys (`request_id`) to prevent duplicate submissions.
  - Calculates live stock levels, order counts, purchased quantities, total spend, and waste costs over any selected period (`inventoryStats`).
  - Supports supplier contact details and private WebP product photos stored in Supabase Storage (`workspace-images`).

---

### Module 04: Staff, Scheduling & Payroll (`Personel` — `/home/personel` & `/demo/personel_demo`)
Manages employee profiles, historical/effective pay rates, shift schedules, and payroll calculations.

- **Employee Profiles & Effective-Dated Pay Rates (`staff_members`, `staff_pay_rates`)**:
  - Stores employee name, position, category, employment start date (`employed_on`), notes, and profile photo.
  - Tracks `hourly` and `monthly` pay rates with effective dates (`effective_on`), ensuring rate changes apply accurately from their effective date forward (`rateOn`).
- **Shift Scheduling (`staff_shifts`, `staff_save_shifts` RPC)**:
  - Schedules 1 to 93 days at a time (up to a 3-month window).
  - Supports overnight shifts (where `end_time < start_time` adds 1440 minutes) and paid/unpaid break deductions (`break_minutes`).
  - PostgreSQL `tsrange` overlap checks prevent double-booking an employee on overlapping shifts and forbid scheduling shifts before `employed_on`.
- **Payroll Calculation (`utils/staff/math.ts`)**:
  - Computes total hours worked, shift days, and total compensation over a selected period (`payroll`), prorating `monthly` salaries by the exact number of UTC days in each calendar month and multiplying `hourly` rates by net shift hours (`(duration - break_minutes) / 60`).

---

## 3. Private File Vault & Image Processing

- **Private User Uploads (`/api/uploads`, `user-uploads` bucket)**:
  - Stores up to **100 files** (CSV, XLSX, XLS, PDF, up to **50 MB** per file) scoped to `userId/<uuid>--<filename>`.
  - Protects referential integrity: blocks deletion of any file currently referenced by a monthly POS analysis (`panel_months`) or a kitchen AI import (`kitchen_imports`).
- **Workspace Image Pipeline (`/api/workspace-images`, `workspace-images` bucket)**:
  - Accepts PNG, JPEG, and WebP images up to 5 MB.
  - Uses `sharp` to auto-orient, resize within `1200×1200` without enlargement, and compress to `WebP (quality 82)` before uploading to private user-scoped storage and issuing 1-hour signed URLs.

---

## 4. Localization, Routing & Regional Architecture

- **Compile-Time Tri-Lingual Generation (`scripts/localize.cjs`)**:
  - `template/app` and `template/components` hold the single source of truth (authored in Polish).
  - Running `npm run localize` (triggered automatically via `predev` and `prebuild`) parses the TypeScript/TSX AST and compiles localized route trees into `app/en`, `app/pl`, `app/ru` and `localized/{en,pl,ru}/`.
  - Translation dictionaries (`i18n/en.json`, `i18n/pl.json`, `i18n/ru.json`) are built from `i18n/translations.tsv`, `i18n/extra.tsv`, and `i18n/fragments.json`.
- **Middleware Routing & Access Control (`middleware.ts`)**:
  - Canonical English routes live at unprefixed paths (`/`, `/demo`, `/home`, `/cennik`, `/login`), which rewrite internally to `/en/...`, while `/en/...` 308-redirects to `/...`. Polish and Russian live at `/pl/...` and `/ru/...`.
  - Injects `Content-Language` and `Link` (`hreflang="en"`, `hreflang="pl"`, `hreflang="ru"`, `hreflang="x-default"`) headers.
  - Enforces authentication and active/trialing subscription status (`isSubscriber`) on `/home/*` routes, redirecting unauthenticated users to `/login`, authenticated non-subscribers to `/cennik`, and authenticated subscribers visiting `/`, `/login`, or `/demo` straight to `/home`.
- **Regional Settings (`utils/global-settings.ts`, `components/RegionalSettings.tsx`)**:
  - Users can select their **business currency** (any ISO 4217 currency), **country** (ISO 3166-1 alpha-2), and **time zone** independently of UI language.
  - Stored in `localStorage` (`alxorithm-region`) and forwarded to API routes via the `x-alxorithm-region` header (`i18n/fetch.ts`).

---

## 5. Database Schema & Security Model (Supabase)

All workspace tables enforce **Row-Level Security (RLS)** requiring both ownership (`auth.uid() = user_id`) and an active or trialing subscription (`exists(select 1 from public.subscriptions s where s.user_id = auth.uid() and s.status in ('active', 'trialing'))`), plus optimistic concurrency control via `revision` UUIDs and expiring locks (`lease_until`).

| Table / Bucket | Purpose | Key Integrity Mechanisms |
| :--- | :--- | :--- |
| `subscriptions` | Stripe subscription status (`active`, `trialing`) per `user_id` | Checked by `middleware.ts`, API routes, and RLS policies |
| `panel_months` | Monthly POS files, Gemini mapping JSON, and deterministic report snapshot | Composite PK `(user_id, period)`, `revision` UUID, 3-minute `lease_until` |
| `kitchen_items` | Restaurant menu dishes, prices, VAT, portions, allergens, status | `revision` UUID, `kitchen_save_dish` RPC |
| `kitchen_recipe_lines` | Dish-to-ingredient quantities and units | Trigger `kitchen_check_units` validates unit compatibility |
| `kitchen_imports` | AI menu import jobs, file hashes, draft JSON, grounded price sources | Unique `(user_id, file_hash)`, `lease_until`, `kitchen_accept_import` RPC |
| `inventory_items` | Shared catalogue of ingredients & supplies with normalized base prices | Trigger `inventory_normalize` computes base unit & unit cost |
| `inventory_movements` | Stock ledger (`order`, `use`, `waste`, `adjustment`) | Unique `(user_id, request_id)` idempotency, `inventory_record_movement` RPC |
| `staff_members` | Employee profiles, positions, employment dates, photos | `revision` UUID, `staff_save_member` RPC |
| `staff_pay_rates` | Effective-dated `hourly` or `monthly` pay rates per employee | Unique `(member_id, effective_on)`, cannot precede `employed_on` |
| `staff_shifts` | Daily shifts with start/end times and break minutes | `tsrange` overlap check in `staff_save_shifts` RPC |
| `user-uploads` (Bucket) | Private storage for POS CSVs and kitchen import documents | Path prefix `userId/` ownership check (`ownsUpload`) |
| `workspace-images` (Bucket) | Private WebP images for inventory items and staff members | Path prefix `userId/` RLS policy + 1-hour signed URLs |

---

## 6. Real-Time Synchronization

Client workspace modules use the custom `useData` hook (`utils/workspace/use-data.ts`), which combines:
1. Initial and on-demand REST fetches to `/api/kitchen`, `/api/inventory`, and `/api/staff`.
2. **Supabase Realtime** (`postgres_changes` WebSocket channel filtered by `user_id`) on `inventory_items`, `inventory_movements`, `staff_members`, `staff_shifts`, and `staff_pay_rates`.
3. Automatic 30-second polling fallback and window `focus` refresh listeners.
