const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
function load(file){const out={};new Function('exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(out,n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n));return out;}
const {dishMetrics,kitchenSummary,baseQuantity}=load('utils/kitchen/math.ts');
const {validateDish,validateDraft,validateIngredient}=load('utils/kitchen/validate.ts');
const {readAll}=load('utils/kitchen/read-all.ts');
const ingredients=[{id:'flour',name:'Mąka',unit:'kg',price:4},{id:'milk',name:'Mleko',unit:'l',price:6}];
const dish={name:'Test',category:'Test',sale_price:10,vat:8,prep_minutes:10,status:'Aktywny',diet:'',allergens:[],description:'',portions:2,estimated_fields:[],recipe:[{ingredient_id:'flour',quantity:500,unit:'g'},{ingredient_id:'milk',quantity:250,unit:'ml'}]};
test('recipe yield and compatible units determine costs, profit and gross margin',()=>{
  const m=dishMetrics(dish,ingredients);
  assert.deepEqual(m.lines,[2,1.5]);assert.equal(m.portionCost,1.75);assert.equal(m.profit,8.25);assert.equal(m.margin,82.5);assert.equal(m.foodCost,17.5);
  assert.throws(()=>baseQuantity(1,'l','kg'),/Niezgodne/);assert.throws(()=>baseQuantity(-1,'kg','kg'));
});
test('one ingredient price change propagates to every recipe and summary',()=>{
  const menu=[dish,{...dish,sale_price:20,portions:1}];
  const old=kitchenSummary(menu,ingredients);const changed=kitchenSummary(menu,ingredients.map(i=>i.id==='flour'?{...i,price:8}:i));
  assert.equal(old.avgCost,2.625);assert.equal(changed.avgCost,4.125);assert.equal(changed.avgPrice,15);assert.equal(changed.avgMargin,72.5);
});
test('missing prices and empty recipes do not become fictional zero costs',()=>{
  assert.equal(dishMetrics(dish,[{...ingredients[0],price:null},ingredients[1]]).portionCost,null);
  assert.equal(dishMetrics({...dish,recipe:[]},ingredients).portionCost,null);
  assert.equal(kitchenSummary([dish,{...dish,sale_price:null}],ingredients).avgPrice,null);
  const free=dishMetrics({...dish,sale_price:0},ingredients);assert.equal(free.profit,-1.75);assert.equal(free.margin,null);
  assert.equal(dishMetrics({...dish,sale_price:1},ingredients).margin,-75);
});
test('only source inputs are accepted; derived values are never persisted',()=>{
  const validated=validateDish({...dish,margin:99,profit:100,avgCost:0});
  assert.equal('margin' in validated,false);assert.equal('profit' in validated,false);assert.equal('avgCost' in validated,false);
  assert.throws(()=>validateIngredient({name:'Mąka',price:-2,unit:'kg'}));
  assert.throws(()=>validateDish({...dish,portions:0}));
  assert.throws(()=>validateDraft([{...dish,recipe:[{name:'Mąka',unit:'l',price_unit:'kg',quantity:1,price:4}]}]),/Niezgodne/);
});
test('complete recipe pagination crosses Supabase default row cap and fails closed',async()=>{
  const data=Array.from({length:2501},(_,i)=>i);let requests=0;
  assert.deepEqual(await readAll(async(from,to)=>{requests++;return {data:data.slice(from,to+1),error:null};}),data);assert.equal(requests,3);
  await assert.rejects(readAll(async from=>from===0?{data:data.slice(0,1000),error:null}:{data:null,error:'offline'}),/kompletnej/);
});
