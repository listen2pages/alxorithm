const {test}=require('node:test');
const assert=require('node:assert/strict');
const {load}=require('./helpers/ts-loader.cjs');
const {validWorkspaceMonth,withWorkspaceMonth}=load('utils/workspace/period.ts');
test('workspace month validates supported months',()=>{
 for(const value of ['2025-01','2026-10','2027-12'])assert.equal(validWorkspaceMonth(value),true);
 for(const value of ['2026-00','2026-13','2026-1','2028-01',null])assert.equal(validWorkspaceMonth(value),false);
});
test('month follows every localized workspace module while preserving query and anchor',()=>{
 for(const locale of ['en','pl','ru'])for(const page of ['panel','magazyn','personel','kuchnia']){
  assert.equal(withWorkspaceMonth(`/${locale}/home/${page}?view=list#content`,'2026-10'),`/${locale}/home/${page}?view=list&month=2026-10#content`);
 }
 assert.equal(withWorkspaceMonth('/home','2026-10'),'/home?month=2026-10');
});
test('explicit month navigation wins and public links remain unchanged',()=>{
 assert.equal(withWorkspaceMonth('/en/home/panel?month=2026-03','2026-10'),'/en/home/panel?month=2026-03');
 for(const href of ['/en','/en/homepage','https://example.com/home','/api/panel'])assert.equal(withWorkspaceMonth(href,'2026-10'),href);
 assert.equal(withWorkspaceMonth('/en/home',null),'/en/home');
});
