const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(relativePath) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  new Function('exports', compiled)(exports);
  return exports;
}
const staff = load('utils/demo/staff.ts');
const inventory = load('utils/demo/inventory.ts');
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.00001, `${actual} != ${expected}`);
test('weekly salaries use the exact same shifts and rates as employee cards', () => {
  const actual = staff.employees.map(e => staff.payroll(e.id, staff.DEMO_START, staff.DEMO_END, e.rate));
  assert.deepEqual(actual.map(s => s.hours), [40,40,40,38,41,38]);
  assert.deepEqual(actual.map(s => s.pay), [1920,2080,1520,1216,1353,1292]);
  assert.equal(actual.reduce((sum, s) => sum + s.pay, 0), 9381);
  assert.equal(actual.reduce((sum, s) => sum + s.hours, 0), 237);
});
test('date range is inclusive and off days have no pay', () => {
  assert.equal(staff.payroll(1,'2026-09-07','2026-09-07',48).hours,8);
  assert.equal(staff.payroll(5,'2026-09-07','2026-09-07',33).pay,0);
  assert.equal(staff.payroll(4,'2026-09-12','2026-09-12',32).pay,256);
  assert.equal(staff.validRange('2026-09-12','2026-09-07'),false);
  assert.equal(staff.validRange('','2026-09-13'),false);
  assert.equal(staff.validRange('2026-08-01','2026-09-13'),false);
});
test('overnight and minute-based shifts calculate correctly', () => {
  assert.equal(staff.shiftHours({start:'18:00',end:'02:00',breakMinutes:0}),8);
  assert.equal(staff.shiftHours({start:'09:15',end:'17:45',breakMinutes:30}),8);
  assert.equal(staff.payroll(1,staff.DEMO_START,staff.DEMO_END,50).pay,2000);
  assert.equal(staff.payroll(1,staff.DEMO_START,staff.DEMO_END,0).pay,0);
});
test('inventory waste is deducted before calculating unexplained shortages', () => {
  const tomato=inventory.stockBalance(inventory.stockItems[0],4.5);
  assert.equal(tomato.expected,5);
  assert.equal(tomato.shortage,0.5);
  assert.equal(tomato.recordedWasteCost,12);
  assert.equal(tomato.shortageCost,6);
  assert.equal(tomato.totalLoss,18);
  assert.equal(inventory.stockBalance(inventory.stockItems[0],5).totalLoss,12);
});
test('inventory uses unit prices consistently and never offsets waste with surplus', () => {
  const rows=inventory.stockItems.map(i=>inventory.stockBalance(i,i.counted));
  close(rows.reduce((s,r)=>s+r.stockValue,0),1047.9);
  close(rows.reduce((s,r)=>s+r.recordedWasteCost,0),112.4);
  close(rows.reduce((s,r)=>s+r.shortageCost,0),72.9);
  close(rows.reduce((s,r)=>s+r.totalLoss,0),185.3);
  assert.equal(rows[3].surplusValue,7.5);
  assert.equal(rows[3].totalLoss,0);
  assert.equal(inventory.stockBalance(inventory.stockItems[0],10).totalLoss,12);
  assert.equal(inventory.stockBalance(inventory.stockItems[0],0).stockValue,0);
});
