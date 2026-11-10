const {test}=require('node:test'),assert=require('node:assert/strict');
const {load,database}=require('./helpers/ts-loader.cjs');
const {parseCsv}=load('utils/panel/csv.ts'),{calculate,validateMapping}=load('utils/panel/calculate.ts'),{fields}=load('utils/panel/types.ts');
const {NextRequest}=require('next/server');
const col=(file,column)=>({file,column});
function plan(lineFile,granularity='items'){return {version:2,lineFile,granularity,joins:[],fileKinds:{[lineFile]:granularity},fields:Object.fromEntries(fields.map(f=>[f,null])),moneyMode:'line',netMoneyMode:'line',tipMode:'line',dateFormat:'iso',currency:'USD'};}
test('one detailed CSV is sufficient without a catalogue or receipt export',()=>{
 const csv={file_a:parseCsv('Receipt,Date,Name,Qty,Gross,Tax,Category\n1,2026-10-01,Soup,2,20,2,Soups\n2,2026-10-02,Tea,1,10,1,Drinks')},m=plan('file_a');
 Object.assign(m.fields,{receipt_id:col('file_a','Receipt'),date:col('file_a','Date'),product_name:col('file_a','Name'),quantity:col('file_a','Qty'),gross:col('file_a','Gross'),tax_amount:col('file_a','Tax'),category:col('file_a','Category')});
 const r=calculate(csv,m,'2026-10');assert.deepEqual(r.totals,{gross:30,net:27,vat:3,quantity:3,receipts:2});assert.equal(r.importedFiles.length,1);assert.equal(r.posData.length,2);
});
test('single receipt CSV yields partial supported analysis and catalogue-only plans fail',()=>{
 const csv={one:parseCsv('Receipt,Gross,Date\nA,72,2026-10-01')},m=plan('one','receipts');Object.assign(m.fields,{receipt_id:col('one','Receipt'),gross:col('one','Gross'),date:col('one','Date')});
 const r=calculate(csv,m,'2026-10');assert.equal(r.totals.gross,72);assert.equal(r.totals.quantity,null);assert.equal(r.posData.length,0);assert.equal(r.dailyTrend.length,1);
 m.fileKinds.one='catalogue';assert.throws(()=>calculate(csv,m,'2026-10'),/actual sold items or receipts/);
});
function multi(){
 const csv={items:parseCsv('Receipt,SKU,Qty,Gross\n1,A,2,20\n1,B,1,10\n2,B,1,10'),catalogue:parseCsv('Code,Name,Category\nA,Soup,Soups\nB,Tea,Beverages'),orders:parseCsv('Check,Date,Time,Employee,Tip,Total\n1,2026-10-01,12:00,Alex,3,30\n2,2026-10-02,13:00,Alex,0,10'),tenders:parseCsv('Check,Method,Paid\n1,Card,20\n1,Cash,10\n2,Card,10')};
 const m=plan('items');m.fileKinds={items:'items',catalogue:'catalogue',orders:'receipts',tenders:'payments'};m.joins=[{file:'catalogue',lineColumns:['SKU'],lookupColumns:['Code']},{file:'orders',lineColumns:['Receipt'],lookupColumns:['Check']}];m.tipMode='receipt';
 Object.assign(m.fields,{receipt_id:col('items','Receipt'),plu:col('items','SKU'),quantity:col('items','Qty'),gross:col('items','Gross'),product_name:col('catalogue','Name'),category:col('catalogue','Category'),date:col('orders','Date'),time:col('orders','Time'),employee:col('orders','Employee'),tip:col('orders','Tip')});
 m.payments={file:'tenders',receipt_id:'Check',amount:'Paid',method:'Method'};return {csv,m};
}
test('four exports enrich sales using two unique joins and independent split payments',()=>{
 const {csv,m}=multi(),r=calculate(csv,m,'2026-10');assert.equal(r.totals.gross,40);assert.equal(r.totals.quantity,4);assert.equal(r.totals.receipts,2);assert.equal(r.employeeStats[0].tips,3);assert.equal(r.posData[0].nazwa,'Soup');assert.equal(r.importedFiles.length,4);
 assert.deepEqual(r.paymentStats,[{payment:'Card',revenue:30,orders:2},{payment:'Cash',revenue:10,orders:1}]);assert.equal(r.basketStats.avgItemsPerReceipt,2);
});
test('unsafe lookup prices, repeated receipt totals and duplicate keys are rejected',()=>{
 const {csv,m}=multi();m.fields.gross=col('orders','Total');assert.throws(()=>calculate(csv,m,'2026-10'),/actual sales rows/);m.fields.gross=col('items','Gross');
 csv.catalogue.rows.push({...csv.catalogue.rows[0]});assert.throws(()=>calculate(csv,m,'2026-10'),/not unique/);csv.catalogue.rows.pop();
 m.joins[0]={file:'catalogue',lineColumns:['Gross'],lookupColumns:['Code']};assert.throws(()=>calculate(csv,m,'2026-10'),/never by prices/);
});
test('unmatched catalogue records preserve actual sales and sales status filters exclude voids',()=>{
 const {csv,m}=multi();csv.items.rows[0].SKU='unknown';const r=calculate(csv,m,'2026-10');assert.equal(r.totals.gross,40);assert.ok(r.audit.warnings.some(w=>w.startsWith('Unmatched lookup')));
 csv.items.headers.push('Status');csv.items.rows.forEach((row,i)=>row.Status=i===0?'VOID':'CLOSED');m.rowFilter={column:'Status',excludeValues:['VOID']};assert.equal(calculate(csv,m,'2026-10').totals.gross,20);
});
test('monthly upload supports batches, single-file analysis, detach, ownership and rollback',async()=>{
 const tables={panel_months:[]},db=database(tables),stored=new Map(),removed=[];let user={id:'owner'};
 db.auth={getUser:async()=>({data:{user}})};db.storage={from:()=>({upload:async(path,data)=>{stored.set(path,data);return {error:null};},download:async(path)=>({data:stored.has(path)?new Blob([stored.get(path)]):null,error:null}),remove:async paths=>{paths.forEach(p=>{stored.delete(p);removed.push(p);});return {error:null};}})};
 const api=load('app/api/panel/[period]/route.ts',{'@/utils/supabase/server':{createClient:async()=>db},'@/utils/supabase/subscription':{isSubscriber:async()=>true},'@/utils/panel/gemini':{mapWithGemini:async csv=>{const id=Object.keys(csv)[0],m=plan(id);Object.assign(m.fields,{product_name:col(id,'Name'),gross:col(id,'Gross')});return m;}}});
 const ctx={params:Promise.resolve({period:'2026-10'})};
 const upload=async(files,revision='')=>{const f=new FormData();f.append('revision',revision);files.forEach(([name,text])=>f.append('files',new File([text],name)));return api.PUT(new NextRequest('http://localhost/api/panel/2026-10',{method:'PUT',body:f}),ctx);};
 assert.equal((await upload([['sales.csv','Name,Gross\nSoup,20']])).status,200);const month=tables.panel_months[0];assert.equal(Object.keys(month.files).length,1);
 const post=body=>api.POST(new NextRequest('http://localhost/api/panel/2026-10',{method:'POST',body:JSON.stringify({...body,revision:month.revision})}),ctx);
 assert.equal((await post({action:'map'})).status,200);assert.equal((await post({action:'calculate',mapping:month.mapping})).status,200);assert.equal(month.report.totals.gross,20);
 const original=Object.values(month.files)[0].path,revision=month.revision;
 assert.equal((await upload([['catalogue.csv','SKU,Name\nA,Soup'],['bad.csv','Name,Gross\nSoup,20']],revision)).status,400);assert.equal(Object.keys(month.files).length,1);assert.equal(stored.size,1);assert.ok(removed.length);assert.ok(stored.has(original));
 assert.equal((await upload([['catalogue.csv','SKU,Name\nA,Soup'],['payments.csv','Receipt,Method,Amount\n1,Card,20']],revision)).status,200);assert.equal(Object.keys(month.files).length,3);assert.equal(month.mapping,null);assert.equal(month.report_revision,null);
 const id=Object.keys(month.files)[1];const remove=(rev)=>api.DELETE(new NextRequest('http://localhost/api/panel/2026-10',{method:'DELETE',body:JSON.stringify({fileId:id,revision:rev})}),ctx);
 assert.equal((await remove('stale')).status,409);assert.equal((await remove(month.revision)).status,200);assert.equal(Object.keys(month.files).length,2);assert.equal(stored.size,3);
 user=null;assert.equal((await upload([['another.csv','a\n1']],month.revision)).status,401);
});
test('daily sales files combine only when their receipts do not overlap',()=>{
 const csv={day1:parseCsv('Receipt,Date,Name,Gross\n1,2026-10-01,Soup,10'),day2:parseCsv('Receipt,Date,Name,Gross\n2,2026-10-02,Tea,20')},m=plan('day1');m.additionalSalesFiles=['day2'];Object.assign(m.fields,{receipt_id:col('day1','Receipt'),date:col('day1','Date'),product_name:col('day1','Name'),gross:col('day1','Gross')});
 const r=calculate(csv,m,'2026-10');assert.equal(r.totals.gross,30);assert.equal(r.totals.receipts,2);assert.equal(r.audit.lineRows,2);assert.equal(r.audit.lookupRows,0);
 csv.day2.rows=[{...csv.day1.rows[0]}];assert.throws(()=>calculate(csv,m,'2026-10'),/exports overlap/);
});
test('datetime columns retain POS local time and ambiguous payment receipt IDs fail safely',()=>{
 const csv={sales:parseCsv('Receipt,Timestamp,Name,Gross\n1,2026-10-01T23:30:00+09:00,Soup,10\n1,2026-10-02T10:00:00+09:00,Tea,20'),payments:parseCsv('Receipt,Method,Amount,Date\n1,Card,10,2026-10-01\n1,Cash,20,2026-10-02')},m=plan('sales');Object.assign(m.fields,{receipt_id:col('sales','Receipt'),date:col('sales','Timestamp'),time:col('sales','Timestamp'),product_name:col('sales','Name'),gross:col('sales','Gross')});m.payments={file:'payments',receipt_id:'Receipt',method:'Method',amount:'Amount'};
 assert.throws(()=>calculate(csv,m,'2026-10'),/IDs repeat/);m.payments.date='Date';const r=calculate(csv,m,'2026-10');assert.equal(r.hourlyTrend[1].hour,'23:00');assert.equal(r.paymentStats[0].revenue,10);assert.equal(r.paymentStats[1].revenue,20);
});
test('payment tips are attributed only with complete data and known sales staff',()=>{
 const {csv,m}=multi();m.fields.tip=null;csv.tenders.headers.push('Tip');csv.tenders.rows.forEach((r,i)=>r.Tip=String(i===0?3:0));m.payments.tip='Tip';
 assert.equal(calculate(csv,m,'2026-10').employeeStats[0].tips,3);
 csv.tenders.rows[1].Tip='';const r=calculate(csv,m,'2026-10');assert.equal(r.employeeStats[0].tips,null);assert.ok(r.audit.warnings.some(w=>w.includes('tips are incomplete')));
});
