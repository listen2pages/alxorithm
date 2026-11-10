'use client';
import {useState} from 'react';
import Dialog from '@/components/workspace/Dialog';
import ImageUpload from '@/components/workspace/ImageUpload';
import type {Member,PayRate} from '@/utils/staff/math';
export default function MemberEditor({initial,pay,busy,error,onClose,onSave}:{initial:Member;pay:PayRate;busy:boolean;error:string;onClose:()=>void;onSave:(member:Member,pay:PayRate)=>void}){
  const [member,setMember]=useState(initial),[rate,setRate]=useState(pay),[uploading,setUploading]=useState(false);
  return <Dialog title={member.id?'Edytuj pracownika':'Dodaj pracownika'} busy={busy||uploading} onClose={onClose}><form onSubmit={e=>{e.preventDefault();onSave(member,rate);}}><fieldset disabled={busy||uploading} className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {(['name','position','category'] as const).map((key,i)=><label key={key}>{['Imię i nazwisko','Stanowisko','Kategoria / dział'][i]}<input required className="demo-input w-full" value={member[key]} onChange={e=>setMember(m=>({...m,[key]:e.target.value}))}/></label>)}
    <label>Data zatrudnienia<input required type="date" className="demo-input w-full" value={member.employed_on} onChange={e=>{const date=e.target.value;setMember(m=>({...m,employed_on:date}));if(!member.id)setRate(r=>({...r,effective_on:date}));}}/></label>
    <label>Rodzaj wynagrodzenia<select className="demo-input w-full" value={rate.pay_type} onChange={e=>setRate(r=>({...r,pay_type:e.target.value as PayRate['pay_type']}))}><option value="hourly">Za godzinę</option><option value="monthly">Miesięczne</option></select></label><label>Stawka brutto (zł / {rate.pay_type==='hourly'?'godz.':'miesiąc'})<input required type="number" min="0" max="1000000" step="0.01" className="demo-input w-full" value={rate.rate} onChange={e=>setRate(r=>({...r,rate:Number(e.target.value)}))}/></label>
    <label>Stawka obowiązuje od<input required type="date" min={member.employed_on} className="demo-input w-full" value={rate.effective_on} onChange={e=>setRate(r=>({...r,effective_on:e.target.value}))}/></label><label>Notatki<textarea className="demo-input w-full" value={member.notes} onChange={e=>setMember(m=>({...m,notes:e.target.value}))}/></label>
    <ImageUpload url={member.image_url} onBusy={setUploading} onChange={(path,url)=>setMember(m=>({...m,image_path:path,image_url:url}))}/>
  </fieldset><p className="demo-stock-note">Stawki są zapisywane z datą obowiązywania. Nowa data zachowuje starszą historię; edycja stawki z tą samą datą zmieni obliczenia dla tego okresu.</p>{error&&<p role="alert" className="text-red-800 mt-3">{error}</p>}<button disabled={busy||uploading} className="demo-button mt-4">Zapisz pracownika</button></form></Dialog>;
}
