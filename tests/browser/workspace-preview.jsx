// Isolated synthetic fixture; no requests reach Supabase or Gemini.
import React from 'react';
import {createRoot} from 'react-dom/client';
import InventoryClient from '../../app/home/magazyn/InventoryClient';
import StaffClient from '../../app/home/personel/StaffClient';
import KitchenClient from '../../app/home/kuchnia/KitchenClient';
import {normalizePurchase} from '../../utils/inventory/math';
const item={id:'11111111-1111-4111-8111-111111111111',name:'Papier toaletowy testowy',unit:'szt',price:2.5,kind:'cleaning',purchase_price:30,purchase_quantity:1,purchase_unit:'opak',units_per_pack:12,content_quantity:1,content_unit:'szt',purchase_base_quantity:12,supplier_name:'Dostawca testowy',supplier_contact:'',notes:'',description:'',image_path:null,price_origin:'manual',source_url:null,checked_at:null,revision:'1'};
const member={id:'22222222-2222-4222-8222-222222222222',name:'Anna Testowa',position:'Kucharka',category:'Kuchnia',employed_on:'2026-01-01',image_path:null,notes:'',revision:'1'};
const state={userId:'test',items:[item],movements:[{id:'m1',item_id:item.id,kind:'order',occurred_on:'2026-09-01',quantity:2,base_quantity:24,base_unit:'szt',cost:60,package_label:'1 opak × 12 szt',notes:'',created_at:''}],members:[member],rates:[{member_id:member.id,effective_on:'2026-01-01',pay_type:'hourly',rate:30}],shifts:[{id:'s1',member_id:member.id,date:'2026-09-14',start_time:'09:00',end_time:'17:00',break_minutes:30,notes:''}],dishes:[{id:'dish1',name:'Danie testowe',category:'Zupy',sale_price:20,vat:8,prep_minutes:10,status:'Aktywny',diet:'',allergens:[],description:'Podgląd testowy',portions:1,estimated_fields:[],revision:'1',recipe:[]}],imports:[]};
window.fetch=async(url,options={})=>{
  if(!['/api/inventory','/api/staff','/api/kitchen'].includes(url))throw Error('Fixture blocks external requests');
  const b=options.body?JSON.parse(options.body):{};
  if(options.method==='DELETE'){if(url==='/api/kitchen')state.dishes=state.dishes.filter(i=>i.id!==b.id);else if(b.kind==='member'){state.members=state.members.filter(i=>i.id!==b.id);state.shifts=state.shifts.filter(i=>i.member_id!==b.id);}else state.shifts=state.shifts.filter(i=>i.id!==b.id);return new Response('{}');}
  if(options.method==='POST'){
    if(url==='/api/inventory'){
      if(b.action==='movement'){const i=state.items.find(i=>i.id===b.item_id);state.movements.push({id:crypto.randomUUID(),item_id:i.id,occurred_on:b.date,kind:b.kind,quantity:b.quantity,base_quantity:b.quantity*(b.kind==='order'?i.purchase_base_quantity:1),base_unit:i.unit,cost:b.quantity*(b.kind==='order'?i.purchase_price:i.price),package_label:'opak',notes:b.notes,created_at:''});}
      else{const i={...b.item,...normalizePurchase(b.item),revision:'2',id:b.item.id||crypto.randomUUID()},index=state.items.findIndex(x=>x.id===i.id);if(index<0)state.items.push(i);else state.items[index]=i;}
    }else if(url==='/api/staff'){
      if(b.action==='shifts'){if(b.replace)state.shifts=state.shifts.filter(s=>s.member_id!==b.member_id||!b.shifts.some(d=>d.date===s.date));state.shifts.push(...b.shifts.map(s=>({...s,id:crypto.randomUUID(),member_id:b.member_id})));}
      else{const m={...b.member,id:b.member.id||crypto.randomUUID(),revision:'2'},index=state.members.findIndex(x=>x.id===m.id);if(index<0)state.members.push(m);else state.members[index]=m;state.rates=state.rates.filter(r=>r.member_id!==m.id||r.effective_on!==b.pay.effective_on);state.rates.push({...b.pay,member_id:m.id});}
    }
    return new Response('{}');
  }
  return new Response(JSON.stringify(url==='/api/kitchen'?{userId:'test',items:state.dishes,ingredients:state.items,imports:[]}:state));
};
const path=location.pathname;const View=path.includes('staff')||path.includes('personel')?StaffClient:path.includes('kitchen')||path.includes('kuchnia')?KitchenClient:InventoryClient;
createRoot(document.getElementById('root')).render(<><p style={{padding:8,background:'#ffe090'}}>Dane testowe · brak połączenia z kontem · <a href="/inventory">Magazyn</a> · <a href="/staff">Personel</a> · <a href="/kitchen">Kuchnia</a></p><View referenceDate="2026-09-14"/></>);
