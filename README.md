# alxorithm

Multilingual copy of the local `warszawski-przewodnik-kulinarny` app, with its styles, assets, account data model, API handlers, calculations and existing Stripe Payment Links preserved.

## Run locally

1. Fill `.env.local` with the **same** values as the Polish application. All five credential fields are intentionally empty. Never put the Stripe secret key or webhook secret in a `NEXT_PUBLIC_` variable.
2. Run `npm ci`.
3. Run `npm run dev` and open `http://localhost:3000`.

Public pages and demos work without keys. Login, private workspaces, uploads and AI imports need the original credentials and configured backend.

## Languages and editing

- English is the default at `/`, `/demo`, `/home`, etc.
- Polish uses `/pl`, `/pl/demo`, `/pl/home`, etc.
- Russian uses `/ru`, `/ru/demo`, `/ru/home`, etc.
- The language selector preserves the current page, query parameters and hash. Preferences survive reloads. Explicit language URLs always determine the displayed language, including English at `/`.
- `/en/...` redirects to the canonical unprefixed English address.

`template/app` and `template/components` are the single source of the original UI. `scripts/localize.cjs` compiles this source into the three `app/en`, `app/pl`, `app/ru` route trees and `localized/` component trees. It runs before development and production builds. English URLs are internally rewritten to the English route tree.

Full dictionaries are `i18n/en.json`, `i18n/pl.json`, and `i18n/ru.json`. They are generated from `i18n/translations.tsv` (stable extracted message IDs), `i18n/extra.tsv` (additional source text and translations) and `i18n/fragments.json` (metadata fragments). Edit those translation sources, then run `npm run localize`; direct edits to generated JSON or route trees will be overwritten. To extract newly added Polish messages, run `node scripts/extract.cjs` and add the new IDs to `translations.tsv`.

The generator translates presentation text, accessibility labels and metadata. API paths, database identifiers, stored unit enums and user ownership remain unchanged. Business currency, regional dates and tax inputs are configurable independently of interface language. User-created names, descriptions, recipes and notes stay exactly as stored; switching language does not rewrite data. Management route slugs remain stable in every language.

## Shared Supabase project

No new project, tables, migrations or users are required. The same Supabase URL and public anon key give users access to their existing accounts, subscriptions, dishes, inventory, employees, reports and storage objects. Users must sign in again on the new domain because browser session cookies are domain-specific.

In the **existing project's Authentication → URL Configuration**, add these additional Redirect URLs while keeping the Polish site's existing entries:

- `https://alxorithm.com/auth/callback`
- `https://alxorithm.com/auth/callback?locale=en`
- `https://alxorithm.com/auth/callback?locale=pl`
- `https://alxorithm.com/auth/callback?locale=ru`
- Equivalent `http://localhost:3000/auth/callback` entries for local testing, including the three locale query variants.

If hosting on `www.alxorithm.com`, redirect it permanently to `https://alxorithm.com`. Keep the original Google OAuth provider and Supabase callback configuration. Do not change the project's primary Site URL merely to add this second website; retain the original site's settings and add the new allowed redirects. Deployment provider environment variables must contain the same credentials, followed by a rebuild.

The SQL files in `supabase/` are copied reference files. **Do not rerun them on the shared production database** just to launch this copy. The API uses the original `subscriptions`, `users`, workspace tables, RPCs and private storage buckets unchanged.

## Shared Stripe setup

The original implementation uses hosted Stripe Payment Links, rather than a locally implemented checkout or webhook endpoint:

- Management subscription: `https://buy.stripe.com/28E9ASacmewvaWQ0843Je04`

The management link, plan prices (PLN), trial copy and subscription checks are preserved. The original shared integration must continue updating Supabase `subscriptions` for the same authenticated `user_id`; this app reads those records exactly as the Polish app does. Stripe secret fields are included empty for parity with the original environment, but the copied frontend/API routes do not consume them or create a new webhook.

Review the management link's existing post-payment redirect in Stripe. If it points to jedzeniewarszawa.pl, a purchase originating on alxorithm will still return there. Shared Payment Link redirect configuration applies to both sites; do not replace the Polish site's redirect without deciding the shared return behavior. Existing subscribers can sign in to alxorithm without purchasing again. Stripe Dashboard settings and live purchase/login verification were not changed or tested with live credentials.

## Search indexing and deployment

The new site uses `https://alxorithm.com` for metadata and structured data. Pages have localized titles/descriptions, canonical URLs, `hreflang` for en/pl/ru and x-default, correct HTML language and Open Graph locale. `/sitemap.xml` includes the marketing, pricing, legal and demo routes in every language. `/robots.txt` excludes private workspace, login, auth and API paths. The web app manifest and social sharing image use alxorithm branding.

1. Deploy this folder as a separate Next.js application, fill its environment variables and point alxorithm.com DNS to the deployment.
2. Add the Supabase allowed redirects above.
3. Verify an existing Polish subscriber can log in, see the same data and switch languages on each workspace module.
4. Verify the management Stripe Payment Link and the shared subscription updater in your normal test procedure.
5. Add the **alxorithm.com domain property** in Google Search Console, verify DNS ownership, and submit `https://alxorithm.com/sitemap.xml`. Do not redirect jedzeniewarszawa.pl or submit a Change of Address: it remains a separate website.

Legal pages preserve the original operator details. Indexing, DNS, provider configuration and live account/payment verification require deployment and the actual account settings.

## Checks

`npm run typecheck`, `npm test`, and `npm run build` verify the app. Existing backend tests cover ownership, subscriptions, recipe calculation, inventory history, payroll, monthly analysis, uploads and kitchen import recovery. Localization tests cover canonical paths, alternates and dictionary coverage.

Live Supabase login, existing-account reads and Stripe payment completion remain unverified until credentials and provider settings are supplied. `node scripts/smoke.cjs` checks the retained public pages, removed-route 404 responses, sitemap, robots, legacy management redirects and private-page guards.

After removing the public directory features, the production build and all 41 tests passed. The page checks passed for 30 retained language pages and confirmed 21 retired URLs return 404 across English, Polish and Russian.

When development is running, keep production verification separate in PowerShell: `$env:NEXT_BUILD_DIR='.next-validation'; npm run build`. Start that build with the same variable and `npm run start -- --port 3001`, then run `node scripts/smoke.cjs`. The normal development server uses `.next` and can stay running independently.

## Global POS analysis and regional settings

Use the gear beside the language selector to choose business currency, country and time zone. Preferences are stored in this browser; they do not convert amounts. New POS mappings detect explicit currency or use the selected business currency; unknown currency stays unlabelled. Existing reports without a currency field retain the original PLN interpretation. The shared Stripe plan still charges its actual configured PLN price; business currency does not change billing. Existing kitchen, inventory and payroll numbers have no currency field in the shared database: choose the currency those source amounts already use.

The global Gemini schema prompt considers all uploaded files together, recognizes multilingual aliases, distinguishes receipts, sold items and catalogues, and suggests identifier/name joins. It receives the first five records of each file and bounded column profiles (up to 2,000 rows); calculations process every sales row. No report totals are calculated by AI. Number formats, unit vs line amounts, independent net-price basis, explicit tax amounts, decimal tax rates and ISO currency precision are validated in code. Missing quantity on actual item lines counts one unit per row after mapping approval. Catalogue entries and receipt headers never count as sold products. Category groups preserve original labels; tax rates never determine food vs drinks.

For previously analysed months, open **Files and new analysis**, click **Detect columns again**, review the mapping and calculate. A fresh analysis uses existing saved files. Legacy two-file mappings retain the optional **Estimate products by price** checkbox, which confirms one unit per receipt at the catalogue price, without discounts. The backend converts catalogue net prices using their supplied tax rate and only attributes unique rounded gross-price matches. Collisions and unmatched/refund receipts are left unclassified. Estimated product charts and estimated net/tax summaries are labelled and do not replace factual receipt revenue, net/tax totals or basket metrics.

The kitchen extraction prompt accepts international files. Grounded price searches require explicit business country and currency and restrict results to that market/currency. Report tax charts also support receipt-level taxes, including supplied tax amounts with an unspecified rate. Mixed ISO currency rows are rejected rather than combined. These optional mapping/report fields fit the existing Supabase JSON storage; no database schema or subscription records were changed.

Global update verification: all 50 tests passed; production build/type validation passed; all 30 localized public pages and indexing/access smoke checks passed. A live Gemini request using synthetic Japanese-yen POS data mapped SKU/catalogue records and calculated gross 1,430 JPY, three units and two products. Browser verification confirmed USD formatting persisted across English/Russian switching; temporary test currency/country preferences were restored. Real uploaded reports were not overwritten.

## Flexible restaurant POS imports

The monthly panel accepts 1–8 CSV files in any order (20 MB/file, 60 MB/upload batch). Files can be added in a batch, selected from private saved uploads, replaced individually, or detached from a month. Detaching never deletes the original upload. File edits invalidate the prior mapping/report and enforce ownership, revision checks and the analysis lease. Identical file hashes are rejected to prevent accidental duplicate imports; failed batches roll back new storage objects.

The AI produces a version-2 plan identifying sold items, receipts, catalogue, payments or other files. One detailed sales file is sufficient. A sold-item source can use several unique identifier lookups for receipt metadata and catalogue names/categories. Actual money/quantity fields must come from sales rows; receipt totals cannot be copied onto items. Payment exports are aggregated separately, including split tenders, and matched only to selected sales receipts. Optional payment tips require complete source tips and reliable staff attribution. Multiple same-schema sales exports can be combined when receipt/date identifiers do not overlap. Voided/open status exclusions are reviewed in the plan and applied before calculations.

The report's **What your files can show** panel requests only data missing for specific analyses. Users can add the relevant file and rerun detection/calculation. The new flexible plan uses factual data; speculative price matches are not automatically applied. Existing stored two-file mappings and reports continue to work. All new file/plan/report metadata fits the existing Supabase JSON columns; no database migration is required. The original Polish app should not edit the same month's version-2 plan because its older importer does not understand arbitrary file IDs. Source uploads remain compatible and private.

Current limitations: supplementary lookup exports must have unique identifiers; split-payment exports are handled separately. Combining different vendor sales schemas in one plan is unsupported—use one consolidated export or same-schema non-overlapping exports. Shopify continuation-row filling, multiple item tax columns and refund allocation need dedicated vendor handling; do not assume every vendor export maps completely. Catalogue-only uploads request actual sales instead of generating sales from catalogue rows.

Flexible-import verification: all 61 tests passed, including one-file imports, four-file joins, split payments/tips, overlapping-export rejection, partial receipt reports, upload rollback, stale revisions, ownership, detach semantics and rendered upload/missing-data guidance. Production build/type checks passed. Live Gemini checks using synthetic one-file and four-file examples both produced the expected gross 30 USD, three units and two products; the four-file case recognized two payment methods. User source files and stored reports were not reprocessed during verification.
