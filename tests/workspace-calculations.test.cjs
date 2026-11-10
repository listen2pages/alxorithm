const {test}=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/ts-loader.cjs');
const {normalizePurchase,inventoryStats}=load('utils/inventory/math.ts');
const {payroll,shiftHours}=load('utils/staff/math.ts');
const {datesBetween}=load('utils/workspace/dates.ts');
const basis={purchase_price:20,purchase_quantity:900,purchase_unit:'g',units_per_pack:1,content_quantity:1,content_unit:'szt'};
test('inventory normalizes salt, toilet paper, oil and beer multi-packs',()=>{
  assert.deepEqual(normalizePurchase(basis),{unit:'kg',purchase_base_quantity:.9,price:22.2222});
  assert.deepEqual(normalizePurchase({...basis,purchase_price:30,purchase_quantity:1,purchase_unit:'opak',units_per_pack:12}),{unit:'szt',purchase_base_quantity:12,price:2.5});
  assert.deepEqual(normalizePurchase({...basis,purchase_price:12,purchase_quantity:.9,purchase_unit:'l'}),{unit:'l',purchase_base_quantity:.9,price:13.3333});
  assert.deepEqual(normalizePurchase({...basis,purchase_price:30,purchase_quantity:1,purchase_unit:'opak',units_per_pack:6,content_quantity:500,content_unit:'ml'}),{unit:'l',purchase_base_quantity:3,price:10});
  assert.equal(normalizePurchase({...basis,purchase_price:10,purchase_quantity:100,purchase_unit:'cm'}).price,10);
  assert.throws(()=>normalizePurchase({...basis,purchase_quantity:0}));
});
test('monthly history uses purchase snapshots, carries stock forward and separates waste',()=>{
  const movements=[{item_id:'a',occurred_on:'2026-08-31',kind:'order',base_quantity:12,cost:30},{item_id:'a',occurred_on:'2026-09-01',kind:'order',base_quantity:24,cost:70},{item_id:'a',occurred_on:'2026-09-02',kind:'use',base_quantity:4,cost:10},{item_id:'a',occurred_on:'2026-09-03',kind:'waste',base_quantity:2,cost:5},{item_id:'a',occurred_on:'2026-09-30',kind:'order',base_quantity:12,cost:40}];
  assert.deepEqual(inventoryStats(movements,'a','2026-09-01','2026-09-14'),{stock:30,orders:1,purchased:24,spend:70,waste:5});
});
const member={id:'a',employed_on:'2026-09-01'};
test('hourly payroll subtracts breaks and uses dated pay history for overnight shifts',()=>{
  const shifts=[{member_id:'a',date:'2026-09-01',start_time:'22:00',end_time:'06:00',break_minutes:30},{member_id:'a',date:'2026-09-02',start_time:'09:00',end_time:'17:00',break_minutes:0}];
  const rates=[{member_id:'a',effective_on:'2026-09-01',pay_type:'hourly',rate:30},{member_id:'a',effective_on:'2026-09-02',pay_type:'hourly',rate:40}];
  assert.deepEqual(payroll(member,shifts,rates,'2026-09-01','2026-09-02'),{hours:15.5,days:2,pay:545});
  assert.throws(()=>shiftHours({...shifts[0],break_minutes:480}));
});
test('monthly salary is calendar-prorated for the range and employment date',()=>{
  const rates=[{member_id:'a',effective_on:'2026-09-01',pay_type:'monthly',rate:6000}];
  assert.equal(payroll(member,[],rates,'2026-09-01','2026-09-30').pay,6000);
  assert.equal(payroll(member,[],rates,'2026-09-01','2026-09-15').pay,3000);
  assert.equal(payroll({...member,employed_on:'2026-09-16'},[],rates,'2026-09-01','2026-09-30').pay,3000);
  assert.equal(payroll(member,[],[],'2026-09-01','2026-09-30').pay,null);
});
test('range is at most three calendar months, not a loose 93-day estimate',()=>{
  assert.equal(datesBetween('2026-01-01','2026-03-31').length,90);
  assert.throws(()=>datesBetween('2026-01-01','2026-04-01'));
  assert.throws(()=>datesBetween('2026-02-30','2026-03-01'));
});
