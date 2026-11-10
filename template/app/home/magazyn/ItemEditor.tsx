'use client';
import {formatMoney,getCurrency} from '@/utils/global-settings';
import {useRegionalSettings} from '@/i18n/useRegionalSettings';
import {useState} from 'react';
import Dialog from '@/components/workspace/Dialog';
import ImageUpload from '@/components/workspace/ImageUpload';
import {measures,normalizePurchase,type InventoryItem} from '@/utils/inventory/math';
export default function ItemEditor({initial,busy,error,onClose,onSave}:{initial:InventoryItem;busy:boolean;error:string;onClose:()=>void;onSave:(item:InventoryItem)=>void}){
  useRegionalSettings();
  const [item,setItem]=useState(initial),[uploading,setUploading]=useState(false);
  const change=(key:keyof InventoryItem,value:unknown)=>setItem(i=>({...i,[key]:value}));
  let calculated;try{calculated=normalizePurchase(item);}catch{calculated=null;}
  return <Dialog title={item.id?'Edytuj produkt':'Dodaj produkt'} busy={busy||uploading} onClose={onClose}><form onSubmit={e=>{e.preventDefault();onSave(item);}}><fieldset disabled={busy||uploading} className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label>Nazwa<input required className="demo-input w-full" value={item.name} onChange={e=>change('name',e.target.value)}/></label><label>Kategoria<select className="demo-input w-full" value={item.kind} onChange={e=>change('kind',e.target.value)}><option value="food">Żywność / kuchnia</option><option value="drink">Napoje / bar</option><option value="cleaning">Środki czystości i higiena</option><option value="other">Pozostałe</option></select></label>
    <label>Cena zakupu brutto (zł)<input required type="number" min="0" step="0.0001" className="demo-input w-full" value={item.purchase_price??''} onChange={e=>change('purchase_price',e.target.value===''?null:Number(e.target.value))}/></label><label>Cena dotyczy ilości<input required type="number" min="0.0001" step="any" className="demo-input w-full" value={item.purchase_quantity} onChange={e=>change('purchase_quantity',Number(e.target.value))}/></label>
    <label>Jednostka zakupu<select className="demo-input w-full" value={item.purchase_unit} onChange={e=>change('purchase_unit',e.target.value)}>{Object.entries(measures).map(([key,m])=><option key={key} value={key}>{m.label}</option>)}<option value="opak">Opakowanie / paczka / karton / zgrzewka</option></select></label>
    {item.purchase_unit==='opak'&&<><label>Sztuk / pojemników w opakowaniu<input required type="number" min="1" step="1" className="demo-input w-full" value={item.units_per_pack} onChange={e=>change('units_per_pack',Number(e.target.value))}/></label><label>Zawartość jednej sztuki / pojemnika<input required type="number" min="0.0001" step="any" className="demo-input w-full" value={item.content_quantity} onChange={e=>change('content_quantity',Number(e.target.value))}/></label><label>Jednostka zawartości<select className="demo-input w-full" value={item.content_unit} onChange={e=>change('content_unit',e.target.value)}>{Object.entries(measures).map(([key,m])=><option key={key} value={key}>{m.label}</option>)}</select></label><p className="demo-muted md:col-span-2">Papier: 1 opakowanie × 12 sztuk × 1 szt. Piwo: 1 zgrzewka × 6 butelek × 0,5 l. Olej: 0,9 l.</p></>}
    <label>Dostawca (opcjonalnie)<input className="demo-input w-full" value={item.supplier_name} onChange={e=>change('supplier_name',e.target.value)}/></label><label>Kontakt do dostawcy<input className="demo-input w-full" value={item.supplier_contact} onChange={e=>change('supplier_contact',e.target.value)}/></label>
    <label>Opis<textarea className="demo-input w-full" value={item.description} onChange={e=>change('description',e.target.value)}/></label><label>Notatki<textarea className="demo-input w-full" value={item.notes} onChange={e=>change('notes',e.target.value)}/></label>
    <ImageUpload url={item.image_url} onBusy={setUploading} onChange={(path,url)=>setItem(i=>({...i,image_path:path,image_url:url}))}/>
  </fieldset><p className="demo-stock-note">Cena bazowa: {calculated?.price!==null&&calculated?.price!==undefined?formatMoney(calculated.price,getCurrency(),'pl-PL')+' / '+calculated.unit:'Uzupełnij cenę i ilość'}. Ta cena przelicza powiązane receptury.</p>{error&&<p role="alert" className="text-red-800 mt-3">{error}</p>}<button disabled={busy||uploading||!calculated} className="demo-button mt-4">{busy?'Zapisywanie…':'Zapisz produkt'}</button></form></Dialog>;
}
