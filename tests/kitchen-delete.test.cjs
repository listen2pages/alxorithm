const {test}=require('node:test'),assert=require('node:assert/strict');
const {NextRequest,NextResponse}=require('next/server');const {load}=require('./helpers/ts-loader.cjs');
test('dish deletion requires confirmation, ownership and current revision',async()=>{
  let deleted=false,called=false;
  class KitchenError extends Error{constructor(message,status=400){super(message);this.status=status;}}
  const api=load('app/api/kitchen/route.ts',{'@/utils/kitchen/server':{KitchenError,kitchenJson:NextResponse.json,kitchenFailure:e=>NextResponse.json({error:e.message},{status:e.status||422}),kitchenContext:async()=>({userId:'owner',supabase:{from:()=>{let filters={};const q={delete(){called=true;return q;},eq(k,v){filters[k]=v;return q;},select(){return q;},async maybeSingle(){deleted=filters.id==='dish'&&filters.revision==='current'&&filters.user_id==='owner';return {error:null,data:deleted?{id:'dish'}:null};}};return q;}}})}});
  const run=body=>api.DELETE(new NextRequest('http://localhost/api/kitchen',{method:'DELETE',body:JSON.stringify(body)}));
  assert.equal((await run({id:'dish',revision:'current'})).status,400);assert.equal(called,false);
  assert.equal((await run({id:'dish',revision:'stale',confirm:true})).status,409);assert.equal(deleted,false);
  assert.equal((await run({id:'dish',revision:'current',confirm:true})).status,200);assert.equal(deleted,true);
});
