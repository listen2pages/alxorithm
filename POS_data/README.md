# October 2026 USA Japanese restaurant POS mock data

All restaurant names, products, identifiers, staff and sales are SYNTHETIC. These are research-based export-shaped fixtures for Alxorithm, not files downloaded from live POS accounts or guaranteed import templates.

Each CSV has one header and exactly 10 data rows. There are exactly 10 distinct menu items, 10 paid receipts, and 10 sold-item lines per system. A line can contain several units; the total quantity is 18. The same fictional restaurant and transactions are represented in all three folders. Upload one system's files together, not all three systems together: they describe the same sales.

Scenario: Japanese cuisine restaurant in the United States named Sakura Japanese Restaurant - USA, store Sakura USA, account currency USD, October 1–28, 2026. Timestamps are local US Eastern time (America/New_York; UTC-04:00 during this October). Prices and costs are US dollars, with US date formatting in Toast and Loyverse. An illustrative US-style added sales tax of 8% applies to every item; listed menu prices exclude sales tax. No specific city or state tax jurisdiction is assumed. This is a test setting, not a claim about legally applicable taxes. One sale has a 3.00 line discount. Four receipts have a 2.00 tip each. No refunds, voids, split checks, modifiers, variants, delivery or customer personal data. Blank optional fields are intentional.

## Files and relationships

| Folder | Files | Link fields |
| --- | --- | --- |
| Toast | ItemSelectionDetails.csv, OrderDetails.csv, PaymentDetails.csv | Order Id; items/payments also Check Id |
| Lightspeed_Restaurant_L_Series | Products.csv, Receipt_Items.csv, Receipts.csv, Payments.csv | Receipt ID; Product ID links sold lines to Products |
| Loyverse | Items.csv, Receipts_by_item.csv, Receipts.csv | Receipt number; SKU links sold lines to Items |

Toast's item file already carries all 10 product names, codes and categories. Its menu export is JSON, so no invented CSV menu catalogue is included. Lightspeed and Loyverse have separate documented product CSV exports.

## Amount meanings

- Toast: Gross Price is the sold line price before discount in this tax-exclusive scenario. Net Price = Gross Price - Discnt. Net Price is the full line amount, not the unit price. Tax is separate. Order Amount excludes added tax and tips; Order Total includes both. Payment Amount includes tax and excludes Tip; Payment Total includes Tip. Do not treat Toast's Gross Price as tax-inclusive revenue merely because its name contains "Gross".
- Lightspeed: Amount in Receipt_Items is QUANTITY, not money. Tax Exclusive Price and Tax Inclusive Price are unit amounts after this mock line discount. Total Tax Excl. Price and Total Price are full line amounts. Receipts Total includes tax and excludes Tip. Payments Amount is modelled as receipt Total with Tip separate. Products shows the undiscounted catalogue prices, with Price tax-inclusive in the mock account setting.
- Loyverse: Gross sales is before discounts and added tax. Net sales = Gross sales - Discounts. Taxes is separate. Total collected includes Net sales + Taxes + Tips. Cost of goods is quantity times the mock unit cost; Gross profit = Net sales - Cost of goods. The item export does not repeat receipt-level tips/payments: use Receipts.csv for those. Items.csv uses a store named Sakura USA and a configured tax named Mock Sales Tax 8%.

Currency is an account setting, so no invented currency column was added to native-shaped CSVs. Select USD when testing these files. The control_totals.json file records the expected aggregate results; it is not an upload file.

## Schema evidence and limits

Checked October 14, 2026:

1. [Toast official data export field reference](https://doc.toasttab.com/doc/platformguide/adminDataExportFieldReference.html): field names and order for ItemSelectionDetails, OrderDetails and PaymentDetails. Dates follow its MM/DD/YYYY HH:MM:SS definition. The document does not specify all status/tax enum values, so Tax Inclusion Option is intentionally empty. Credit status CAPTURED is a mock choice, not a documented CSV enum guarantee.
2. [Lightspeed Restaurant L-Series official Export data reference](https://resto-support.lightspeedhq.com/hc/en-us/articles/360047581514-Export-data): complete published column lists for products, receipt items, receipts and payments. Undocumented internal type/status identifiers are intentionally empty instead of invented numeric codes. Timestamps use a clear local YYYY-MM-DD HH:MM:SS representation because the reference does not prescribe date serialization. The serialized Taxes text is illustrative; the vendor documents its meaning but not an exact serialization grammar. Payment Amount/Tip treatment is the explicit mock convention above; verify against a real account export before using these fixtures to assert vendor-specific behaviour.
3. [Loyverse official item import/export guide](https://help.loyverse.com/help/importing-and-exporting): catalogue fields and configurable store/tax columns. This file selects ordinary items without inventory tracking, variants or composite components. Optional configured modifier columns are absent.
4. [Loyverse official user manual](https://help.loyverse.com/sites/default/files/loyverse-pos-manual-en.pdf), Receipts section: English receipt export headers, including Tips and Dining option. [Loyverse official export guide](https://help.loyverse.com/help/exporting-data-from-loyverse-account) documents receipt and receipt-by-item exports.
5. [Loyverse support community's actual exported spreadsheets](https://loyverse.town/topic/3435-discounts-not-appearing-in-receipts-by-item-reports/) and [support moderator's comment-column screenshot](https://loyverse.town/topic/2625-comments-report/): item-export structure and Comment (singular) header. The CSV uses these observed English headers. Export versions differ: older receipt screenshots omit Tips/Dining option; newer manual examples include them. Thus this is a documented example schema, not a promise that every current account exports identical columns.

These structures preserve vendor field names and semantics. Account settings, languages and export versions can alter columns and formats. No live merchant export was available for a byte-for-byte comparison. Optional fields being empty is not a reason to manufacture missing facts.

## Expanding with another AI to 5,000 sold-item rows

1. Keep the product catalogue at 10 rows and reuse its existing SKU/Product ID values and menu names. For Toast, reuse the 10 existing Item Id/Master Id/SKU combinations.
2. Generate 5,000 sold-item lines dated October 1–31, 2026. Generate unique receipt/order IDs, payment IDs and Toast Item Selection Id values. Use identical IDs in all related files for one system. Never generate each file independently.
3. For the simplest fixture, keep one item line per receipt: then generate 5,000 receipt rows and 5,000 payment rows too. For realistic baskets, share a receipt ID across several item lines; receipt and payment row counts will be lower. Toast Item Selection Id stays unique per line.
4. Quantities are actual sold units. Do not substitute a count of product appearances when a quantity field exists. Prices and tax amounts must follow the conventions above, including rounding to cents. If a discount spans multiple units, allocate cents consistently so unit and line totals reconcile.
5. Sum item amounts into each receipt. Sum payments to the receipt amount using the stated tip convention. Count every sale once; do not add item, receipt and payment revenue together. Include tips once per receipt/payment, never once per product line.
6. Recalculate cost and profit, receipt descriptions and all control totals. Keep dates within October and do not include revenue from November or another currency. Preserve headers, comma delimiters, decimal points and proper CSV quoting.
7. This starter set deliberately covers uncomplicated paid sales. Refunds, split tenders, voids, mixed tax rates and modifier exports need separate coherent scenarios following vendor rules; do not insert arbitrary negative amounts and assume that represents a real refund export.

No purchasing/inventory movements or recipe ingredient usage are included, so these sales fixtures cannot supply actual stock consumption or historical purchasing analyses.
