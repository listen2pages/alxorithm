// Isolated browser fixture. Never imported by an application route; no real account or API calls.
import React from 'react';
import {createRoot} from 'react-dom/client';
import KitchenClient from '../../app/home/kuchnia/KitchenClient';
const ingredient={id:'11111111-1111-4111-8111-111111111111',name:'Ziemniaki testowe',unit:'kg',price:4,price_origin:'manual',source_url:null,checked_at:null,revision:'1'};
const dish={id:'22222222-2222-4222-8222-222222222222',name:'Zupa testowa',category:'Zupy',sale_price:20,vat:8,prep_minutes:10,status:'Aktywny',diet:'',allergens:['Mleko'],description:'Dane wyłącznie do weryfikacji widoku.',portions:2,estimated_fields:[],revision:'1',recipe:[{ingredient_id:ingredient.id,quantity:500,unit:'g'}]};
const state={items:[dish,{...dish,id:'33333333-3333-4333-8333-333333333333',name:'Drugie danie testowe',sale_price:30}],ingredients:[ingredient],imports:[]};
window.fetch=async(url,options={})=>{
  if(url!=='/api/kitchen')throw Error('Fixture blocks external requests');
  if(options.method==='POST'){
    const body=JSON.parse(options.body),key=body.kind==='dish'?'items':'ingredients',value=body.kind==='dish'?body.dish:body.ingredient;
    const index=state[key].findIndex(i=>i.id===body.id);
    if(index>=0)state[key][index]={...state[key][index],...value};else state[key].push({...value,id:crypto.randomUUID(),revision:'1'});
    return new Response(JSON.stringify({success:true}));
  }
  return new Response(JSON.stringify(state));
};
createRoot(document.getElementById('root')).render(<><p style={{background:'#ffdf87',padding:8,textAlign:'center'}}>Podgląd testowy · dane syntetyczne · bez połączenia z kontem</p><KitchenClient/></>);
