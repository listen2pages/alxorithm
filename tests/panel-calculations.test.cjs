const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
function load(file){
  const exports={};
  new Function('exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(exports,name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name+'.ts')):require(name));
  return exports;
}
const {parseCsv,parseNumber,parseDate}=load('utils/panel/csv.ts');
const {calculate,validateMapping}=load('utils/panel/calculate.ts');
const {fields,validPeriod}=load('utils/panel/types.ts');
const col=(column,file='transactions')=>({column,file});
function fixture(){
  const csv={transactions:parseCsv('Receipt,Date,Time,Staff,PLU,Quantity,Gross,Net,VAT,Payment,Tip,Source\n1,2026-03-01,12:30,Anna,001,2,20,18.52,8,Card,5,POS\n1,2026-03-01,12:35,Anna,002,1,10,8.13,23,Card,5,POS\n2,2026-03-02,13:00,Anna,001,1,10,9.26,8,Cash,0,POS\n3,2026-04-01,15:00,Anna,001,1,100,92.59,8,Cash,0,POS'),products:parseCsv('Code,Name,Category\n001,Soup,Starter\n002,Tea,Beverage\n999,Unused,Other')};
  const mapping={lineFile:'transactions',join:{lineColumns:['PLU'],lookupColumns:['Code']},fields:Object.fromEntries(fields.map(f=>[f,null])),moneyMode:'line',tipMode:'receipt',dateFormat:'iso'};
  Object.assign(mapping.fields,{receipt_id:col('Receipt'),date:col('Date'),time:col('Time'),employee:col('Staff'),plu:col('PLU'),quantity:col('Quantity'),gross:col('Gross'),net_price:col('Net'),vat:col('VAT'),payment:col('Payment'),tip:col('Tip'),source:col('Source'),product_name:col('Name','products'),category:col('Category','products')});
  return {csv,mapping};
}
test('CSV handles BOM, semicolon, quoted delimiters, escaped quotes, CRLF and multiline values',()=>{
  const csv=parseCsv('\uFEFFname;amount\r\n"Soup; \"\"special\"\"\nlarge";"1 234,50"\r\n');
  assert.equal(csv.rows.length,1);assert.equal(csv.rows[0].name,'Soup; "special"\nlarge');assert.equal(parseNumber(csv.rows[0].amount),1234.5);
  assert.equal(parseNumber('1.234,50'),1234.5);assert.equal(parseNumber('1,234.50'),1234.5);
  assert.deepEqual(parseCsv('"Long,quoted,header";price\nSoup;12').headers,['Long,quoted,header','price']);
  assert.throws(()=>parseCsv('a,a\n1,2'));assert.throws(()=>parseCsv('a,b\n1'));assert.throws(()=>parseCsv('a\n"bad'));assert.throws(()=>parseNumber('oops'));
});
test('line totals use quantities without multiplying revenue and deduplicate receipt tips',()=>{
  const {csv,mapping}=fixture();const r=calculate(csv,mapping,'2026-03');
  assert.deepEqual(r.totals,{gross:40,net:35.91,vat:4.09,quantity:4,receipts:2});
  assert.equal(r.employeeStats[0].tips,5);assert.equal(r.employeeStats[0].tipRate,12.5);
  assert.equal(r.sourceStats[0].aov,20);assert.equal(r.posData[0].iloscSprzedana,3);
  assert.equal(r.audit.outsideMonthRows,1);assert.equal(r.audit.unusedLookupRows,1);
  assert.equal(r.basketStats.soloPercentage,50);assert.equal(r.basketStats.groupPercentage,50);
  assert.equal(r.dailyTrend[0].revenue,30);assert.equal(r.hourlyTrend[0].revenue,30);
  assert.equal(r.paymentStats.reduce((s,p)=>s+p.revenue,0),40);
  assert.equal(r.dayOfWeekTrend[1].day,'Niedziela');
});

test('quoted decimal amounts and whitespace-padded CSV quotes retain exact sales totals',()=>{
  for(const value of ['72.00','72,00','"72.00"','"72,00"',' "72,00 PLN" ','"72.00" PLN'])assert.equal(parseNumber(value),72);
  assert.equal(parseNumber('"-72,00"'),-72);
  assert.equal(parseNumber('"1 234,50 zł"'),1234.5);
  assert.equal(parseNumber('""'),null);
  for(const value of ['"72,00','72.00"','7"2,00','"72"00"','"oops"'])assert.throws(()=>parseNumber(value),/Nieprawidłowa liczba/);
  // First amount has normal CSV quotes with padding, second has literal quotes
  // escaped inside CSV quotes. Both must calculate as 72, not be silently skipped.
  const csv={transactions:parseCsv('Name,Gross\nSoup,  "72,00"  \nTea,"""72.00"""'),products:parseCsv('Code\n1')};
  assert.equal(csv.transactions.rows[0].Gross,'72,00');
  assert.equal(csv.transactions.rows[1].Gross,'"72.00"');
  const mapping={lineFile:'transactions',join:null,fields:Object.fromEntries(fields.map(f=>[f,null])),moneyMode:'line',tipMode:'line',dateFormat:'iso'};
  Object.assign(mapping.fields,{product_name:col('Name'),gross:col('Gross')});
  const report=calculate(csv,mapping,'2026-10');
  assert.equal(report.totals.gross,144);assert.equal(report.audit.includedRows,2);
});
test('unit prices multiply by quantity; missing net derives only from supplied VAT',()=>{
  const {csv,mapping}=fixture();mapping.moneyMode='unit';mapping.fields.net_price=null;
  const r=calculate(csv,mapping,'2026-03');assert.equal(r.totals.gross,60);assert.equal(r.totals.net,54.43);
});
test('all rows are counted beyond AI samples and identical lines are not dropped',()=>{
  const {csv,mapping}=fixture();csv.transactions.rows=Array.from({length:20000},()=>({...csv.transactions.rows[0]}));
  const r=calculate(csv,mapping,'2026-03');assert.equal(r.audit.includedRows,20000);assert.equal(r.totals.gross,400000);assert.equal(r.totals.quantity,40000);assert.equal(r.employeeStats[0].tips,5);
});
test('duplicate and unmatched lookup keys fail instead of multiplying or losing revenue',()=>{
  const {csv,mapping}=fixture();csv.products.rows.push({...csv.products.rows[0]});assert.throws(()=>calculate(csv,mapping,'2026-03'),/unikalny/);
  csv.products.rows.pop();csv.transactions.rows[0].PLU='missing';assert.throws(()=>calculate(csv,mapping,'2026-03'),/brak odpowiadającego/);
});
test('missing optional fields remain unavailable rather than fictional zeroes',()=>{
  const {csv,mapping}=fixture();for(const f of ['net_price','vat','receipt_id','employee','source','payment','tip','time'])mapping.fields[f]=null;
  const r=calculate(csv,mapping,'2026-03');assert.equal(r.totals.gross,40);assert.equal(r.totals.net,null);assert.equal(r.totals.vat,null);assert.equal(r.totals.receipts,null);assert.equal(r.basketStats.soloPercentage,null);assert.deepEqual(r.employeeStats,[]);assert.deepEqual(r.hourlyTrend,[]);
});
test('receipt header lookup supplies dimensions and receipt tips without copying receipt total',()=>{
  const csv={transactions:parseCsv('ID,Date,Employee,Tip,Total\nA,2025-01-02,Anna,6,30'),products:parseCsv('Receipt,Name,Gross\nA,Soup,10\nA,Tea,20')};
  const mapping={lineFile:'products',join:{lineColumns:['Receipt'],lookupColumns:['ID']},fields:Object.fromEntries(fields.map(f=>[f,null])),moneyMode:'line',tipMode:'receipt',dateFormat:'iso'};
  Object.assign(mapping.fields,{receipt_id:col('ID'),date:col('Date'),employee:col('Employee'),tip:col('Tip'),product_name:col('Name','products'),gross:col('Gross','products')});
  const r=calculate(csv,mapping,'2025-01');assert.equal(r.totals.gross,30);assert.equal(r.employeeStats[0].tips,6);assert.equal(r.totals.receipts,1);
  mapping.fields.gross=col('Total');assert.throws(()=>validateMapping(mapping,csv),/Kwoty paragonów/);
});
test('strict dates and the permitted calendar range',()=>{
  assert.equal(parseDate('02.01.2025','dmy'),'2025-01-02');assert.throws(()=>parseDate('2026-02-30','iso'));
  assert.equal(validPeriod('2027-12'),true);assert.equal(validPeriod('2028-01'),false);assert.equal(validPeriod('2026-13'),false);
  const {csv,mapping}=fixture();assert.throws(()=>calculate(csv,mapping,'2027-01'),error=>{
    assert.equal(error.code,'NO_SALES_IN_PERIOD');assert.equal(error.period,'2027-01');
    assert.deepEqual(error.availablePeriods,[{period:'2026-03',rows:3},{period:'2026-04',rows:1}]);
    assert.equal(error.firstDate,'2026-03-01');assert.equal(error.lastDate,'2026-04-01');
    assert.equal(error.dateColumn,'Date');assert.match(error.message,/Miesiąc przesłania pliku nie zmienia dat sprzedaży/);return true;
  });
});

test('ambiguous dates obey the selected mapping instead of forcing the requested month',()=>{
  const csv={transactions:parseCsv('Date,Name,Gross\n08/10/2026,Soup,10'),products:parseCsv('Code\n1')};
  const mapping={lineFile:'transactions',join:null,fields:Object.fromEntries(fields.map(f=>[f,null])),moneyMode:'line',tipMode:'line',dateFormat:'mdy'};
  Object.assign(mapping.fields,{date:col('Date'),product_name:col('Name'),gross:col('Gross')});
  assert.throws(()=>calculate(csv,mapping,'2026-10'),e=>e.code==='NO_SALES_IN_PERIOD'&&e.firstDate==='2026-08-10');
  mapping.dateFormat='dmy';assert.equal(calculate(csv,mapping,'2026-10').totals.gross,10);
});

test('receipt totals plus a product catalog yield only supported receipt analytics',()=>{
  const csv={transactions:parseCsv('Receipt ID,Date Created,Time,Employee,Gross Amount,Payment Method,Tip,Device Name,Order Source,Status\nA,2026-08-01,12:30,Anna,54,Card,4,POS1,Restaurant,Completed\nB,2026-08-02,13:30,Anna,108,Cash,0,POS1,Delivery,Completed\nC,2026-09-01,12:30,Anna,100,Card,0,POS1,Restaurant,Completed'),products:parseCsv('ID,PLU,Name,Category,Unit,Net Price,VAT Rate,Barcode,Type,Warehouse Support,Active\n1,001,Soup,Starter,szt,50,8,123,Food,true,true')};
  const mapping={granularity:'receipts',lineFile:'transactions',join:null,fields:Object.fromEntries(fields.map(f=>[f,null])),moneyMode:'line',tipMode:'receipt',dateFormat:'iso'};
  for(const [f,column] of Object.entries({receipt_id:'Receipt ID',date:'Date Created',time:'Time',employee:'Employee',gross:'Gross Amount',payment:'Payment Method',tip:'Tip',source:'Order Source'}))mapping.fields[f]=col(column);
  const r=calculate(csv,mapping,'2026-08');assert.equal(r.granularity,'receipts');assert.equal(r.totals.gross,162);assert.equal(r.totals.receipts,2);assert.equal(r.totals.quantity,null);assert.equal(r.totals.net,null);assert.equal(r.totals.vat,null);
  assert.equal(r.employeeStats[0].tips,4);assert.equal(r.basketStats.avgItemsPerReceipt,null);assert.deepEqual(r.posData,[]);assert.equal(r.sourceStats[0].aov,54);assert.equal(r.audit.outsideMonthRows,1);
  // Even a unique catalogue price matching a receipt after VAT proves no sale of that product.
  const bad=structuredClone(mapping);bad.join={lineColumns:['Gross Amount'],lookupColumns:['Net Price']};assert.throws(()=>validateMapping(bad,csv),/Cena lub kwota/);
  csv.transactions.rows.push({...csv.transactions.rows[0]});assert.throws(()=>calculate(csv,mapping,'2026-08'),/Powtarzający/);
});
