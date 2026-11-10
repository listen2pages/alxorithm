'use client';
import {useState} from 'react';
import Dialog from "@/localized/en/components/workspace/Dialog";
import ImageUpload from "@/localized/en/components/workspace/ImageUpload";
import type {Member,PayRate} from '@/utils/staff/math';
export default function MemberEditor({initial,pay,busy,error,onClose,onSave}:{initial:Member;pay:PayRate;busy:boolean;error:string;onClose:()=>void;onSave:(member:Member,pay:PayRate)=>void}){
  const [member,setMember]=useState(initial),[rate,setRate]=useState(pay),[uploading,setUploading]=useState(false);
  return <Dialog title={member.id?"Edit employee":"Add employee"} busy={busy||uploading} onClose={onClose}><form onSubmit={e=>{e.preventDefault();onSave(member,rate);}}><fieldset disabled={busy||uploading} className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {(['name','position','category'] as const).map((key,i)=><label key={key}>{["Full name","Position","Category / department"][i]}<input required className="demo-input w-full" value={member[key]} onChange={e=>setMember(m=>({...m,[key]:e.target.value}))}/></label>)}
    <label>{"Employment date"}<input required type="date" className="demo-input w-full" value={member.employed_on} onChange={e=>{const date=e.target.value;setMember(m=>({...m,employed_on:date}));if(!member.id)setRate(r=>({...r,effective_on:date}));}}/></label>
    <label>{"Pay type"}<select className="demo-input w-full" value={rate.pay_type} onChange={e=>setRate(r=>({...r,pay_type:e.target.value as PayRate['pay_type']}))}><option value="hourly">{"Hourly"}</option><option value="monthly">{"Monthly"}</option></select></label><label>{"Gross rate ( / "}{rate.pay_type==='hourly'?"h":"month"})<input required type="number" min="0" max="1000000" step="0.01" className="demo-input w-full" value={rate.rate} onChange={e=>setRate(r=>({...r,rate:Number(e.target.value)}))}/></label>
    <label>{"Rate effective from"}<input required type="date" min={member.employed_on} className="demo-input w-full" value={rate.effective_on} onChange={e=>setRate(r=>({...r,effective_on:e.target.value}))}/></label><label>{"Notes"}<textarea className="demo-input w-full" value={member.notes} onChange={e=>setMember(m=>({...m,notes:e.target.value}))}/></label>
    <ImageUpload url={member.image_url} onBusy={setUploading} onChange={(path,url)=>setMember(m=>({...m,image_path:path,image_url:url}))}/>
  </fieldset><p className="demo-stock-note">{"Rates are saved with effective dates. A new date preserves earlier history; editing a rate with the same date changes calculations for that period."}</p>{error&&<p role="alert" className="text-red-800 mt-3">{error}</p>}<button disabled={busy||uploading} className="demo-button mt-4">{"Save employee"}</button></form></Dialog>;
}
