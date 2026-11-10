'use client';
import {useRegionalSettings} from '@/i18n/useRegionalSettings';
import {formatMoney,getCurrency} from '@/utils/global-settings';

import Link from 'next/link';
import {useState} from 'react';
import {Plus,Search,ArrowUpRight,Clock,DollarSign,Utensils,ChefHat} from 'lucide-react';
import {dishMetrics,kitchenSummary,type Dish,type Ingredient,type DraftDish} from '@/utils/kitchen/math';
import DishEditor from './DishEditor';
import RecipeDrawer from './RecipeDrawer';
import {ConfirmDelete} from '@/components/workspace/Dialog';
import {useData} from '@/utils/workspace/use-data';
type ImportRecord={id:string;files:{name:string}[];status:string;error:string|null;draft:DraftDish[]|null;sources:{url:string;title:string}[];notes:string[];search_suggestions:string[]};
const fieldLabels:Record<string,string>={name:'Nazwa',category:'Kategoria',sale_price:'Cena sprzedaży',sale_price_unavailable:'Cena sprzedaży — brak potwierdzonego źródła',vat:'VAT',prep_minutes:'Czas przygotowania',status:'Status',diet:'Dieta',allergens:'Alergeny',description:'Opis',portions:'Liczba porcji',recipe:'Receptura'};
const money=(n:number|null)=>n===null?'Brak danych':formatMoney(n,getCurrency(), 'pl-PL');
function sanitizeSearchHtml(raw:string):string{
  const cleaned=String(raw||'').replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<(iframe|object|embed|form|meta|base)\b[^>]*>/gi,'').replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,'').replace(/(href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data):[\s\S]*?\2/gi,'$1=$2#$2');
  return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; font-src https: data:;">${cleaned}`;
}
const emptyDish: Dish={id:'',name:'',category:'Inne',sale_price:null,vat:null,prep_minutes:null,status:'Aktywny',diet:'',allergens:[],description:'',portions:1,estimated_fields:[],revision:'',recipe:[]};
export default function KitchenClient(){useRegionalSettings();
  const {data,error,setError,loading,refresh}=useData<{userId:string;items:Dish[];ingredients:Ingredient[];imports:ImportRecord[]}>('/api/kitchen',['inventory_items','kitchen_items','kitchen_recipe_lines']);
  const items=data?.items||[],ingredients=data?.ingredients||[],imports=data?.imports||[],preview=ingredients;
  const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[query,setQuery]=useState(''),[view,setView]=useState('category');
  const [recipeId,setRecipeId]=useState<string|null>(null),[editing,setEditing]=useState<Dish|null>(null),[removing,setRemoving]=useState<Dish|null>(null);
  async function removeDish(){if(!removing)return;setBusy(true);setError('');try{const r=await fetch('/api/kitchen',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:removing.id,revision:removing.revision,confirm:true})});const result=await r.json();if(!r.ok)throw Error(result.error);setRemoving(null);refresh();setNotice('Danie i receptura usunięte. Produkty pozostają w magazynie.');}catch(e){setError(e instanceof Error?e.message:'Błąd usuwania');}finally{setBusy(false);}}
  const summary=kitchenSummary(items,preview);
  async function request(url:string,body:unknown){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error);return data;}
  async function save(body:unknown){setBusy(true);setError('');try{await request('/api/kitchen',body);setEditing(null);refresh();setNotice('Zmiany zapisane. Koszty i marże przeliczono.');return true;}catch(e){setError(e instanceof Error?e.message:'Błąd zapisu.');return false;}finally{setBusy(false);}}
  async function upload(files:FileList|null){if(!files?.length)return;setBusy(true);setError('');try{const form=new FormData();[...files].forEach(file=>form.append('files',file));const r=await fetch('/api/kitchen/import',{method:'PUT',body:form});const data=await r.json();if(!r.ok)throw new Error(data.error);refresh();setNotice('Dokumenty zapisane. Kliknij Analizuj przy imporcie.');}catch(e){setError(e instanceof Error?e.message:'Błąd przesyłania.');}finally{setBusy(false);}}
  async function importAction(id:string,action:string){
    setBusy(true);setError('');setNotice('Przetwarzanie importu…');
    try{
      if(action!=='estimate')await request('/api/kitchen/import',{id,action});
      if(action==='analyze'||action==='estimate'){
        let remaining=1,round=0;
        while(remaining>0&&round<40){
          setNotice(round?'Sprawdzanie cen w Polsce. Pozostało: '+remaining+' pozycji…':'Sprawdzanie aktualnych cen brakujących składników…');
          const result=await request('/api/kitchen/import',{id,action:'estimate'});remaining=result.remaining||0;round++;
        }
        setNotice(remaining?'Wersja robocza zapisana. Kliknij „Uzupełnij brakujące ceny rynkowe”, aby kontynuować.':'Wersja robocza zapisana. Sprawdź dane i źródła cen przed zatwierdzeniem.');
      }else setNotice('Pozycje dodane do menu. Możesz edytować każde danie i składnik.');
      refresh();
    }catch(e){setError(e instanceof Error?e.message:'Błąd analizy.');refresh();}finally{setBusy(false);}
  }
  const filtered=items.filter(i=>(i.name+' '+i.category).toLowerCase().includes(query.toLowerCase()));
  const selectedRecipe=items.find(item=>item.id===recipeId);
  const groups=view==='list'?['Wszystkie pozycje']:[...new Set(filtered.map(i=>i.category))];
  return <main className="demo-shell demo-kitchen demo-has-floating"><div className="demo-container pb-24"><h1 className="sr-only">Kuchnia</h1>
    {error&&<p role="alert" className="demo-card text-red-800 my-4">{error}</p>}{notice&&<p role="status" className="demo-card my-4">{notice}</p>}
    {loading?<p role="status">Ładowanie menu…</p>:<>
      <div className="demo-mobile-first"><section className="demo-kpis demo-kitchen-stats" aria-label="Podsumowanie menu"><div className="demo-kpi"><span>Liczba pozycji</span><strong>{summary.count}</strong><button className="demo-button mt-3" disabled={busy} onClick={()=>{setError('');setEditing(emptyDish);}}><Plus size={16}/> Dodaj nową pozycję</button></div><div className="demo-kpi"><span>Średnia cena sprzedaży</span><strong>{money(summary.avgPrice)}</strong><small>Na pozycję menu</small></div><div className="demo-kpi"><span>Średni koszt porcji</span><strong>{money(summary.avgCost)}</strong><small>Składniki jednej porcji</small></div><div className="demo-kpi"><span>Średnia marża brutto</span><strong>{summary.avgMargin===null?'Brak danych':summary.avgMargin.toFixed(1)+'%'}</strong><small>Przygotowanie: {summary.avgPrep===null?'Brak danych':summary.avgPrep.toFixed(0)+' min'}</small></div></section>
      <section className="demo-kitchen-cards mt-6"><div className="flex flex-wrap gap-3 mb-4"><label className="flex items-center gap-2"><Search size={18}/><input className="demo-input min-w-0 w-full" aria-label="Szukaj dania lub kategorii" placeholder="Szukaj dania lub kategorii" value={query} onChange={e=>setQuery(e.target.value)}/></label><button className="demo-button demo-button-secondary" onClick={()=>setView(view==='list'?'category':'list')}>{view==='list'?'Grupuj według kategorii':'Pokaż listę'}</button></div>
        {!items.length&&<div className="demo-card"><h2>Nie masz jeszcze menu</h2><p className="demo-muted">Dodaj pierwsze danie ręcznie lub przeanalizuj dokumenty.</p></div>}
        {groups.map(group=>{const groupItems=filtered.filter(d=>view==='list'||d.category===group);return <div key={group} className="mb-6"><div className="demo-section-head"><h2>{group} <span className="demo-badge">{groupItems.length}</span></h2></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{groupItems.map(d=><DishCard key={d.id} dish={d} ingredients={preview} onRecipe={()=>setRecipeId(d.id)} busy={busy} onEdit={()=>{setError('');setEditing(d);}}/>)}</div></div>;})}
      </section></div><section className="demo-card mt-5"><h2 className="text-xl font-bold">Import menu i receptur</h2><p className="demo-muted mt-2">Dodaj menu, receptury lub faktury. CSV, XLSX, XLS, PDF, TXT i zdjęcia · do 3 plików / 12 MB. Możesz też wprowadzić dania i składniki ręcznie.</p><label className="demo-button mt-3 cursor-pointer">Prześlij dokumenty<input className="sr-only" aria-label="Dokumenty kuchni" type="file" accept=".csv,.xlsx,.xls,.pdf,.txt,.png,.jpg,.jpeg" multiple disabled={busy} onChange={e=>{void upload(e.target.files);e.target.value='';}}/></label>
        {imports.map(record=><details key={record.id} className="border-t border-[#ded9cd] mt-4 pt-4" open={record.status!=='approved'}><summary className="cursor-pointer font-bold">{record.files.map(f=>f.name).join(', ')} · {({uploaded:'Pliki zapisane',processing:'Przetwarzanie',draft:'Do sprawdzenia',approved:'Dodano do menu',error:'Wymaga uwagi'} as Record<string,string>)[record.status]}</summary>{record.error&&<p className="text-red-800 mt-2">{record.error}</p>}
          {record.status!=='approved'&&<div className="demo-actions"><button className="demo-button" disabled={busy} onClick={()=>importAction(record.id,'analyze')}>{record.draft?'Wznów analizę cen':'Analizuj'}</button>{record.draft&&<><button className="demo-button demo-button-secondary" disabled={busy} onClick={()=>importAction(record.id,'estimate')}>Uzupełnij brakujące ceny rynkowe</button><button className="demo-button" disabled={busy} onClick={()=>importAction(record.id,'approve')}>Zatwierdź i dodaj do menu</button></>}</div>}
          {record.notes?.map((note,i)=><p className="demo-muted mt-2" key={i}>{note}</p>)}{record.search_suggestions?.map((html,i)=><iframe key={i} title={"Wyszukiwanie Google " +(i+1)} sandbox="allow-popups" referrerPolicy="no-referrer" srcDoc={sanitizeSearchHtml(html)} className="w-full border-0 mt-3 h-36"/>)}{record.draft&&<div className="mt-4"><p className="demo-muted">Szacunki wymagają weryfikacji. Istniejące składniki zachowają ceny z Twojej bazy. Alergeny i dietę potwierdź na podstawie receptur i etykiet.</p>{record.draft.map((d,index)=><details key={index} className="p-3 rounded-xl bg-[#f7f4ef] mt-2"><summary>{d.name} · {money(d.sale_price)} {d.estimated_fields.includes('sale_price')?'(szacowana cena)':''}</summary><p className="text-sm my-2">{d.description}</p><p className="text-sm">VAT: {d.vat??'—'}% · {d.prep_minutes??'—'} min · Receptura na {d.portions} porcji</p><p className="text-sm">Dieta: {d.diet||'Do potwierdzenia'} · Alergeny: {d.allergens.join(', ')||'Do potwierdzenia'}</p><p className="demo-muted">Szacowane / do weryfikacji: {d.estimated_fields.map(field=>fieldLabels[field]||'Inne informacje').join(', ')||'—'}</p>{d.recipe.map((line,i)=><p className="text-sm mt-2" key={i}>{line.name}: {line.quantity} {line.unit} · {money(line.price)}/{line.price_unit} {line.price_origin==='estimate'?'— szacunek rynkowy':''} {line.source_url&&<a className="underline" href={line.source_url} target="_blank" rel="noreferrer">Źródło ({line.checked_at?.slice(0,10)})</a>}</p>)}</details>)}{record.sources.length>0&&<div className="mt-3"><h3>Źródła cen</h3>{record.sources.map((s,i)=><a key={i} className="block underline text-sm" href={s.url} target="_blank" rel="noreferrer">{s.title}</a>)}</div>}</div>}
        </details>)}
      </section>
      <section className="demo-card mt-6"><div className="demo-section-head"><h2>Składniki z magazynu</h2><Link href="/home/magazyn" className="demo-button">Dodaj i edytuj produkty w magazynie</Link></div><p className="demo-muted">Ceny za jednostkę bazową są obliczane z ceny i wielkości opakowania. Ich zmiana przelicza receptury.</p>{ingredients.length?ingredients.map(i=><div key={i.id} className="flex justify-between gap-3 border-t py-3 mt-3"><strong>{i.name}</strong><span>{money(i.price)} / {i.unit}</span></div>):<p className="demo-empty">Dodaj pierwszy produkt w magazynie, a pojawi się tutaj i w edytorze receptury.</p>}</section>
    </>}
    <button className="demo-button fixed bottom-20 right-5 z-30 md:hidden shadow-lg" disabled={busy||loading} onClick={()=>{setError('');setEditing(emptyDish);}}><Plus size={18}/> Dodaj pozycję</button>
    {selectedRecipe&&<RecipeDrawer dish={selectedRecipe} ingredients={preview} busy={busy} onClose={()=>setRecipeId(null)} onEdit={()=>{setRecipeId(null);setError('');setEditing(selectedRecipe);}}/>}
    {removing&&<ConfirmDelete name={removing.name} detail="Danie i powiązana receptura zostaną usunięte z bazy. Produkty magazynowe pozostaną." busy={busy} error={error} onClose={()=>setRemoving(null)} onConfirm={removeDish}/>}
    {editing&&<DishEditor key={editing.id||'new'} initial={editing} ingredients={preview} busy={busy} error={error} onClose={()=>setEditing(null)} onSave={dish=>save({kind:'dish',id:dish.id||null,revision:dish.revision||null,dish})}/>}
  </div></main>;
}

// ─── Category styling (mirrors demo) ─────────────────────────────────────────
const categoryEmoji: Record<string,string> = {'Przystawki':'🥗','Dania główne':'🍝','Napoje':'🥤','Alkohol':'🍸','Desery':'🍰','Zupy':'🍲','Inne':'🍽️'};
const categoryColor: Record<string,string> = {'Przystawki':'#b87333','Dania główne':'#8b5e3c','Napoje':'#4a7c7c','Alkohol':'#6b8e6b','Desery':'#9b6fa6','Zupy':'#7a6ea0','Inne':'#7a8b7a'};
const getColor = (cat: string) => categoryColor[cat] ?? '#7a8b7a';
const getEmoji = (cat: string) => categoryEmoji[cat] ?? '🍽️';
const moneyAmount = (v: number | null) => v === null ? 'Brak danych' : formatMoney(v,getCurrency(), 'pl-PL');

// ─── DishCard Component ───────────────────────────────────────────────────────
function DishCard({dish,ingredients,onRecipe,busy,onEdit}:{dish:Dish;ingredients:Ingredient[];onRecipe:()=>void;busy:boolean;onEdit:()=>void;}){useRegionalSettings();
  const m = dishMetrics(dish, ingredients);
  const color = getColor(dish.category);
  const margin = m.margin;
  return (
    <article className="workspace-dish-card overflow-hidden transition-all duration-300">
      {/* ── Card Header ── */}
      <div className="p-5">
        {/* Status & Category badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{backgroundColor:color+'18',color}}>
              {getEmoji(dish.category)} {dish.category}
            </span>
            {dish.vat !== null && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${dish.vat===8?'bg-[#b87333]/12 text-[#b87333]':'bg-[#6b8e6b]/12 text-[#6b8e6b]'}`}>
                VAT {dish.vat}%
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#6b8e6b]/15 text-[#6b8e6b]">
            ● {dish.status}
          </span>
        </div>

        {/* Name & description */}
        <h3 className="font-serif text-xl text-[#3e2f29] leading-snug">{dish.name}</h3>
        <p className="text-xs text-[#9a877c] mt-1.5 leading-relaxed">{dish.description}</p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#b87333]"/>
            <span className="text-sm font-bold text-[#3e2f29]">{moneyAmount(dish.sale_price)}</span>
          </div>
          {dish.prep_minutes !== null && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#4a7c7c]"/>
              <span className="text-sm text-[#6d594d]">{dish.prep_minutes} min</span>
            </div>
          )}
          {dish.diet && (
            <div className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#8b5e3c]"/>
              <span className="text-xs text-[#6d594d]">{dish.diet}</span>
            </div>
          )}
        </div>

        {/* Allergens */}
        {dish.allergens.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#b29b8c]">Alergeny:</span>
            {dish.allergens.map(a=>(
              <span key={a} className="px-1.5 py-0.5 rounded text-[10px] bg-[#e8a96a]/15 text-[#c17d3a] font-medium">{a}</span>
            ))}
          </div>
        )}

        {/* Estimated fields warning */}
        {dish.estimated_fields.length > 0 && (
          <p className="text-[10px] text-amber-700 mt-2">⚠ Zawiera szacunki lub pola do weryfikacji</p>
        )}

        {/* Margin bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#9a877c]">Koszt: {moneyAmount(m.portionCost)}</span>
            <span className="font-semibold" style={{color:margin===null?'#9a877c':margin>=70?'#6b8e6b':margin>=50?'#b87333':'#c0392b'}}>
              Marża: {margin===null?'Brak danych':margin.toFixed(1)+'%'}
            </span>
          </div>
          <div className="w-full bg-[#e6ddd3] rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-500" style={{
              width:`${Math.min(margin??0,100)}%`,
              background:margin===null?'#e6ddd3':margin>=70?'linear-gradient(90deg,#6b8e6b,#8fae8f)':margin>=50?'linear-gradient(90deg,#b87333,#d4a574)':'linear-gradient(90deg,#c0392b,#e74c3c)',
            }}/>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-[0.15em] transition-all border border-[#5a4335]/10 hover:border-[#b87333]/30 hover:bg-[#efe8df] flex items-center justify-center gap-2"
            style={{color}}
            aria-haspopup="dialog"
            onClick={onRecipe}
          >
            <ChefHat className="w-3.5 h-3.5"/>
            Otwórz recepturę
            <ArrowUpRight className="w-3.5 h-3.5"/>
          </button>
          <button
            className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-[0.15em] transition-all border border-[#5a4335]/10 hover:border-[#b87333]/30 hover:bg-[#efe8df] text-[#6d594d]"
            disabled={busy}
            onClick={onEdit}
          >
            Edytuj
          </button>
        </div>
      </div>



    </article>
  );
}
