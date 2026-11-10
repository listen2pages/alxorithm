'use client';
import { fetch } from '@/i18n/fetch';
import Image from 'next/image';
import {useState} from 'react';
export default function ImageUpload({url,onChange,onBusy}:{url?:string|null;onChange:(path:string|null,url:string|null)=>void;onBusy?:(value:boolean)=>void}){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  return <div className="md:col-span-2"><p>{"Photo (optional)"}</p>{url&&<Image unoptimized src={url} alt="Photo preview" width={96} height={96} className="rounded-xl object-cover my-2"/>}<input aria-label="Upload photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);onBusy?.(true);setError('');try{const form=new FormData();form.append('file',file);const r=await fetch('/api/workspace-images',{method:'POST',body:form}),data=await r.json();if(!r.ok)throw Error(data.error);onChange(data.path,data.url);}catch(e){setError(e instanceof Error?e.message:"Photo error");}finally{setBusy(false);onBusy?.(false);}}}/>{busy&&<p role="status">{"Uploading photo…"}</p>}{error&&<p role="alert" className="text-red-800">{error}</p>}{url&&<button type="button" disabled={busy} className="demo-button demo-button-secondary mt-2" onClick={()=>onChange(null,null)}>{"Remove photo"}</button>}</div>;
}
