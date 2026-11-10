const {test}=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/ts-loader.cjs');
const {parseCsv,parseNumber}=load('utils/panel/csv.ts');
const {calculate}=load('utils/panel/calculate.ts');
const {fields}=load('utils/panel/types.ts');
const {regionalSettings,formatMoney,minorUnits}=load('utils/global-settings.ts');
const col=(column,file='transactions')=>({file,column});
function fixture(sales,catalog='ID\n1',extra={}){
  const csv={transactions:parseCsv(sales),products:parseCsv(catalog)};
  const m={granularity:'items',lineFile:'transactions',join:null,fields:Object.fromEntries(fields.map(f=>[f,null])),moneyMode:'line',tipMode:'line',dateFormat:'iso',currency:'USD',...extra};
  return {csv,m};
}
test('global number parsing handles accounting, symbols, thousands, quotes and explicit decimal conventions',()=>{
  assert.equal(parseNumber('($1,234.56)','decimal-point'),-1234.56);
  assert.equal(parseNumber('€ 1.234,56','decimal-comma'),1234.56);
  assert.equal(parseNumber('"72.00" USD'),72);
  assert.equal(parseNumber('CHF 1’234.50'),1234.5);
  assert.equal(parseNumber('1,234','decimal-point'),1234);
  assert.equal(parseNumber('1,234','decimal-comma'),1.234);
  assert.equal(parseNumber('₹1,23,456.78','decimal-point'),123456.78);
});
test('gross and net derive from actual tax amounts and decimal tax rates',()=>{
  const {csv,m}=fixture('Name,Net,Tax\nSoup,10,0.825');Object.assign(m.fields,{product_name:col('Name'),net_price:col('Net'),tax_amount:col('Tax')});
  assert.deepEqual(calculate(csv,m,'2026-03').totals,{gross:10.83,net:10,vat:0.83,quantity:1,receipts:null});
  m.fields.tax_amount=null; m.fields.vat=col('Tax');m.taxMode='fraction';csv.transactions.rows[0].Tax='0.0825';
  assert.equal(calculate(csv,m,'2026-03').totals.gross,10.83);
  m.fields.gross=col('Net');m.fields.net_price=null;m.fields.vat=null;m.fields.tax_amount=col('Tax');csv.transactions.rows[0].Tax='1';
  assert.equal(calculate(csv,m,'2026-03').totals.net,9);
});
test('currency precision follows ISO units, including yen and dinar',()=>{
  assert.equal(minorUnits('JPY'),1);assert.equal(minorUnits('KWD'),1000);
  const {csv,m}=fixture('Name,Gross,Rate\nSoup,1.234,10','ID\n1');
  Object.assign(m.fields,{product_name:col('Name'),gross:col('Gross'),vat:col('Rate')});m.currency='KWD';
  const r=calculate(csv,m,'2026-03');assert.equal(r.totals.gross,1.234);assert.equal(r.totals.net,1.122);assert.equal(r.totals.vat,0.112);assert.deepEqual(r.taxBreakdown,[{rate:10,gross:1.234,net:1.122,tax:0.112}]);
  m.currency='JPY';assert.equal(calculate(csv,m,'2026-03').totals.gross,1);
});
test('catalogue matches enrich names without using list net prices to override discounted sales',()=>{
  const {csv,m}=fixture('SKU,Gross,Qty\n001,18,2','Code,Name,Net,Rate,Group\n001,Soup,10,10,Soups');
  m.join={lineColumns:['SKU'],lookupColumns:['Code']};m.netMoneyMode='unit';Object.assign(m.fields,{plu:col('SKU'),gross:col('Gross'),quantity:col('Qty'),product_name:col('Name','products'),net_price:col('Net','products'),vat:col('Rate','products'),category:col('Group','products')});
  const r=calculate(csv,m,'2026-03');assert.equal(r.posData[0].nazwa,'Soup');assert.equal(r.posData[0].kategoria,'Soups');assert.equal(r.totals.quantity,2);assert.equal(r.totals.gross,18);assert.equal(r.totals.net,16.36);
});
test('missing catalogue matches preserve recorded sales with unknown dimensions when enabled',()=>{
  const {csv,m}=fixture('SKU,Gross\n001,10\n002,20','Code,Name\n001,Soup');m.allowUnmatched=true;m.join={lineColumns:['SKU'],lookupColumns:['Code']};Object.assign(m.fields,{plu:col('SKU'),gross:col('Gross'),product_name:col('Name','products')});
  const r=calculate(csv,m,'2026-03');assert.equal(r.totals.gross,30);assert.equal(r.totals.quantity,2);assert.equal(r.posData[1].nazwa,'002');assert.ok(r.audit.warnings.some(w=>w.includes('no catalogue match')));
});
test('price estimates require opt-in, reject collisions and preserve factual receipt totals',()=>{
  const {csv,m}=fixture('Receipt,Date,Gross\nA,2026-03-01,29.52\nB,2026-03-01,27\nC,2026-03-01,999\nD,2026-04-01,29.52','SKU,Name,Net,VAT,Category\n101,Edamame,24,23,Starters\n102,Tea,25,8,Beverages\n103,Coffee,25,8,Beverages',{granularity:'receipts',currency:'PLN'});
  Object.assign(m.fields,{receipt_id:col('Receipt'),date:col('Date'),gross:col('Gross')});
  m.priceMatch={enabled:false,name:'Name',code:'SKU',category:'Category',gross:null,net:'Net',vat:'VAT'};
  assert.equal(calculate(csv,m,'2026-03').productEstimates,undefined);
  m.priceMatch.enabled=true;const r=calculate(csv,m,'2026-03');
  assert.equal(r.totals.gross,1055.52);assert.equal(r.totals.receipts,3);assert.equal(r.totals.net,null);assert.equal(r.totals.vat,null);assert.equal(r.totals.quantity,null);assert.equal(r.basketStats.avgItemsPerReceipt,null);
  assert.deepEqual(r.productEstimates,{matchedReceipts:1,ambiguousReceipts:1,unmatchedReceipts:1,revenue:29.52,net:24,tax:5.52});assert.equal(r.posData[0].iloscSprzedana,1);
});
test('mixed currency rows are rejected and country/language never imply currency',()=>{
  const {csv,m}=fixture('Name,Gross,Currency\nSoup,10,USD\nTea,10,EUR');Object.assign(m.fields,{product_name:col('Name'),gross:col('Gross')});m.currencyColumn=col('Currency');
  assert.throws(()=>calculate(csv,m,'2026-03'),/Mixed or unknown/);
  assert.equal(regionalSettings({language:'pl',country:'PL'}).currency,'');assert.equal(regionalSettings({currency:'BOGUS',timeZone:'wrong'}).timeZone,'UTC');assert.equal(formatMoney(12.34,'','en'),'12.34');
});
test('Gemini receives both file schemas and regional context, but can never enable price estimates',async()=>{
  const {csv,m}=fixture('Receipt,Gross\n1,29.52\n2,29.52\n3,29.52\n4,29.52\n5,29.52\n6,29.52','Name,Net,Rate\nSoup,24,23',{granularity:'receipts',currency:null});Object.assign(m.fields,{receipt_id:col('Receipt'),gross:col('Gross')});m.priceMatch={enabled:true,name:'Name',code:null,category:null,gross:null,net:'Net',vat:'Rate'};
  const oldFetch=global.fetch,oldKey=process.env.GEMINI_API_KEY;let prompt;
  global.fetch=async(_,init)=>{prompt=JSON.parse(init.body).contents[0].parts[0].text;return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(m)}]}}]})};};process.env.GEMINI_API_KEY='test-only-placeholder';
  try{const {mapWithGemini}=load('utils/panel/gemini.ts');const result=await mapWithGemini(csv,{country:'US',currency:'USD'});assert.equal(result.currency,'USD');assert.equal(result.priceMatch.enabled,false);assert.ok(prompt.includes('global POS'));assert.ok(prompt.includes('"country":"US"'));const sample=JSON.parse(prompt.split('Untrusted file metadata: ')[1]);assert.equal(sample.transactions.sample.length,5);assert.equal(sample.transactions.rowCount,6);assert.ok(prompt.includes('count as one unit'));m.priceMatch={enabled:true,name:'Missing',gross:'Wrong'};const fallback=await mapWithGemini(csv,{currency:'USD'});assert.equal(fallback.priceMatch,null);assert.equal(calculate(csv,fallback,'2026-03').totals.gross,177.12);}
  finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=oldKey;}
});

test('food groups support multilingual categories and preserve source labels',()=>{
 const {categoryKind}=load('utils/panel/categories.ts');
 for(const value of ['Main courses','Main Course','Dania główne','Основные блюда'])assert.equal(categoryKind(value),'main');
 assert.equal(categoryKind('Bebidas'),'drink');assert.equal(categoryKind('Unknown',{Unknown:'starter'}),'starter');assert.equal(categoryKind('Unclassified'),'other');
});

test('incomplete disabled catalogue proposals cannot block factual receipt analysis',()=>{
  const {csv,m}=fixture('Receipt,Gross\nA,29.52','Name,Net,Rate\nSoup,24,23',{granularity:'receipts'});
  Object.assign(m.fields,{receipt_id:col('Receipt'),gross:col('Gross')});
  for(const proposal of [{enabled:false},{enabled:false,name:'Wrong name',gross:'Missing'}, {enabled:false,name:'Name',net:'Net'}, {name:' name ',net:' net ',vat:' rate '}]){
    m.priceMatch=proposal;const r=calculate(csv,m,'2026-03');assert.equal(r.totals.gross,29.52);assert.equal(r.productEstimates,undefined);
  }
  assert.deepEqual(m.priceMatch,{enabled:false,name:'Name',code:null,category:null,gross:null,net:'Net',vat:'Rate'});
  m.priceMatch={enabled:true,name:'Name',gross:null,net:'Net',vat:null};
  assert.throws(()=>calculate(csv,m,'2026-03'),/Select valid catalogue columns/);
});
