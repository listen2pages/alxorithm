const {test}=require('node:test'),assert=require('node:assert/strict');
const {NextRequest,NextResponse}=require('next/server');const {load,database}=require('./helpers/ts-loader.cjs');
const draft=[{name:'Zupa',category:'Zupy',sale_price:20,vat:8,prep_minutes:10,status:'Aktywny',diet:'',allergens:[],description:'',portions:1,estimated_fields:[],recipe:[]}];
test('kitchen upload persists before analysis; recovery retains the draft and approval is idempotent',async()=>{
  const tables={kitchen_imports:[]},db=database(tables),files=new Map();let extracts=0,estimates=0,approvals=0,failEstimate=true;
  db.storage={from:()=>({upload:async(path,bytes)=>{files.set(path,bytes);return {error:null};},download:async path=>({data:new Blob([files.get(path)]),error:null})})};
  db.rpc=async(_name,{p_import_id})=>{approvals++;tables.kitchen_imports.find(r=>r.id===p_import_id).status='approved';return {data:1,error:null};};
  class KitchenError extends Error{constructor(message,status=400){super(message);this.status=status;}}
  const api=load('app/api/kitchen/import/route.ts',{'@/utils/kitchen/server':{kitchenContext:async()=>({supabase:db,userId:'owner'}),KitchenError,kitchenJson:(data,status=200)=>NextResponse.json(data,{status}),kitchenFailure:e=>NextResponse.json({error:e.message},{status:e.status||422})},'@/utils/kitchen/ai':{extractKitchen:async()=>{extracts++;return draft;},estimatePrices:async items=>{estimates++;if(failEstimate)throw new Error('offline');return {items,sources:[],notes:[],searchSuggestions:[],remaining:0};}}});
  const form=new FormData();form.append('files',new File(['Name,Price\nZupa,20'],'menu.csv'));
  const uploaded=await api.PUT(new NextRequest('http://localhost/api/kitchen/import',{method:'PUT',body:form}));assert.equal(uploaded.status,200);
  const {id}=await uploaded.json();assert.equal(tables.kitchen_imports[0].status,'uploaded');assert.equal(files.size,1);assert.equal(extracts,0);
  const run=action=>api.POST(new NextRequest('http://localhost/api/kitchen/import',{method:'POST',body:JSON.stringify({id,action})}));
  assert.equal((await run('analyze')).status,200);assert.equal(extracts,1);
  assert.equal((await run('estimate')).status,422);assert.equal(tables.kitchen_imports[0].status,'draft');assert.deepEqual(tables.kitchen_imports[0].draft,draft);
  failEstimate=false;await run('analyze');assert.equal(extracts,1);await run('estimate');assert.equal(estimates,2);
  assert.equal((await run('approve')).status,200);assert.equal((await run('approve')).status,200);assert.equal(approvals,1);
});
