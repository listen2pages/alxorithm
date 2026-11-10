'use client';
import {useState} from 'react';
import Dialog from "@/localized/ru/components/workspace/Dialog";
import ImageUpload from "@/localized/ru/components/workspace/ImageUpload";
import type {Member,PayRate} from '@/utils/staff/math';
export default function MemberEditor({initial,pay,busy,error,onClose,onSave}:{initial:Member;pay:PayRate;busy:boolean;error:string;onClose:()=>void;onSave:(member:Member,pay:PayRate)=>void}){
  const [member,setMember]=useState(initial),[rate,setRate]=useState(pay),[uploading,setUploading]=useState(false);
  return <Dialog title={member.id?"Изменить сотрудника":"Добавить сотрудника"} busy={busy||uploading} onClose={onClose}><form onSubmit={e=>{e.preventDefault();onSave(member,rate);}}><fieldset disabled={busy||uploading} className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {(['name','position','category'] as const).map((key,i)=><label key={key}>{["Имя и фамилия","Должность","Категория / отдел"][i]}<input required className="demo-input w-full" value={member[key]} onChange={e=>setMember(m=>({...m,[key]:e.target.value}))}/></label>)}
    <label>{"Дата найма"}<input required type="date" className="demo-input w-full" value={member.employed_on} onChange={e=>{const date=e.target.value;setMember(m=>({...m,employed_on:date}));if(!member.id)setRate(r=>({...r,effective_on:date}));}}/></label>
    <label>{"Тип оплаты"}<select className="demo-input w-full" value={rate.pay_type} onChange={e=>setRate(r=>({...r,pay_type:e.target.value as PayRate['pay_type']}))}><option value="hourly">{"Почасовая"}</option><option value="monthly">{"Месячная"}</option></select></label><label>{"Ставка до вычетов ( / "}{rate.pay_type==='hourly'?"ч":"месяц"})<input required type="number" min="0" max="1000000" step="0.01" className="demo-input w-full" value={rate.rate} onChange={e=>setRate(r=>({...r,rate:Number(e.target.value)}))}/></label>
    <label>{"Ставка действует с"}<input required type="date" min={member.employed_on} className="demo-input w-full" value={rate.effective_on} onChange={e=>setRate(r=>({...r,effective_on:e.target.value}))}/></label><label>{"Заметки"}<textarea className="demo-input w-full" value={member.notes} onChange={e=>setMember(m=>({...m,notes:e.target.value}))}/></label>
    <ImageUpload url={member.image_url} onBusy={setUploading} onChange={(path,url)=>setMember(m=>({...m,image_path:path,image_url:url}))}/>
  </fieldset><p className="demo-stock-note">{"Ставки сохраняются с датой начала действия. Новая дата сохраняет предыдущую историю; изменение ставки с той же датой меняет расчёты периода."}</p>{error&&<p role="alert" className="text-red-800 mt-3">{error}</p>}<button disabled={busy||uploading} className="demo-button mt-4">{"Сохранить сотрудника"}</button></form></Dialog>;
}
