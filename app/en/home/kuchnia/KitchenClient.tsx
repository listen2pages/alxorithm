'use client';
import { fetch } from '@/i18n/fetch';
import {useRegionalSettings} from '@/i18n/useRegionalSettings';
import {formatMoney,getCurrency} from '@/utils/global-settings';

import Link from "@/i18n/navigation";
import {useState} from 'react';
import {Plus,Search,ArrowUpRight,Clock,DollarSign,Utensils,ChefHat} from 'lucide-react';
import {dishMetrics,kitchenSummary,type Dish,type Ingredient,type DraftDish} from '@/utils/kitchen/math';
import DishEditor from './DishEditor';
import RecipeDrawer from './RecipeDrawer';
import {ConfirmDelete} from "@/localized/en/components/workspace/Dialog";
import {useData} from '@/utils/workspace/use-data';
type ImportRecord={id:string;files:{name:string}[];status:string;error:string|null;draft:DraftDish[]|null;sources:{url:string;title:string}[];notes:string[];search_suggestions:string[]};
const fieldLabels:Record<string,string>={name:"Name",category:"Category",sale_price:"Selling price",sale_price_unavailable:"Selling price — no confirmed source",vat:"tax",prep_minutes:"Preparation time",status:'Status',diet:"Diet",allergens:"Allergens",description:"Description",portions:"Portion count",recipe:"Recipe"};
const money=(n:number|null)=>n===null?"No data":formatMoney(n,getCurrency(), "en-GB");
function sanitizeSearchHtml(raw:string):string{
  const cleaned=String(raw||'').replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<(iframe|object|embed|form|meta|base)\b[^>]*>/gi,'').replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,'').replace(/(href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data):[\s\S]*?\2/gi,'$1=$2#$2');
  return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; font-src https: data:;">${cleaned}`;
}
const emptyDish: Dish={id:'',name:'',category:"Other",sale_price:null,vat:null,prep_minutes:null,status:"Active",diet:'',allergens:[],description:'',portions:1,estimated_fields:[],revision:'',recipe:[]};
export default function KitchenClient(){useRegionalSettings();
  const {data,error,setError,loading,refresh}=useData<{userId:string;items:Dish[];ingredients:Ingredient[];imports:ImportRecord[]}>('/api/kitchen',['inventory_items','kitchen_items','kitchen_recipe_lines']);
  const items=data?.items||[],ingredients=data?.ingredients||[],imports=data?.imports||[],preview=ingredients;
  const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[query,setQuery]=useState(''),[view,setView]=useState('category');
  const [recipeId,setRecipeId]=useState<string|null>(null),[editing,setEditing]=useState<Dish|null>(null),[removing,setRemoving]=useState<Dish|null>(null);
  async function removeDish(){if(!removing)return;setBusy(true);setError('');try{const r=await fetch('/api/kitchen',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:removing.id,revision:removing.revision,confirm:true})});const result=await r.json();if(!r.ok)throw Error(result.error);setRemoving(null);refresh();setNotice("Dish and recipe deleted. Products remain in inventory.");}catch(e){setError(e instanceof Error?e.message:"Deletion error");}finally{setBusy(false);}}
  const summary=kitchenSummary(items,preview);
  async function request(url:string,body:unknown){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error);return data;}
  async function save(body:unknown){setBusy(true);setError('');try{await request('/api/kitchen',body);setEditing(null);refresh();setNotice("Changes saved. Costs and margins recalculated.");return true;}catch(e){setError(e instanceof Error?e.message:"Save error.");return false;}finally{setBusy(false);}}
  async function upload(files:FileList|null){if(!files?.length)return;setBusy(true);setError('');try{const form=new FormData();[...files].forEach(file=>form.append('files',file));const r=await fetch('/api/kitchen/import',{method:'PUT',body:form});const data=await r.json();if(!r.ok)throw new Error(data.error);refresh();setNotice("Documents saved. Click Analyse beside the import.");}catch(e){setError(e instanceof Error?e.message:"Upload error.");}finally{setBusy(false);}}
  async function importAction(id:string,action:string){
    setBusy(true);setError('');setNotice("Processing import…");
    try{
      if(action!=='estimate')await request('/api/kitchen/import',{id,action});
      if(action==='analyze'||action==='estimate'){
        let remaining=1,round=0;
        while(remaining>0&&round<40){
          setNotice(round?"Checking prices in Poland. Remaining: "+remaining+' pozycji…':"Checking current prices for missing ingredients…");
          const result=await request('/api/kitchen/import',{id,action:'estimate'});remaining=result.remaining||0;round++;
        }
        setNotice(remaining?"Draft saved. Click “Fill missing market prices” to continue.":"Draft saved. Check data and price sources before approval.");
      }else setNotice("Items added to menu. You can edit every dish and ingredient.");
      refresh();
    }catch(e){setError(e instanceof Error?e.message:"Analysis error.");refresh();}finally{setBusy(false);}
  }
  const filtered=items.filter(i=>(i.name+' '+i.category).toLowerCase().includes(query.toLowerCase()));
  const selectedRecipe=items.find(item=>item.id===recipeId);
  const groups=view==='list'?["All items"]:[...new Set(filtered.map(i=>i.category))];
  return <main className="demo-shell demo-kitchen demo-has-floating"><div className="demo-container pb-24"><h1 className="sr-only">{"Kitchen"}</h1>
    {error&&<p role="alert" className="demo-card text-red-800 my-4">{error}</p>}{notice&&<p role="status" className="demo-card my-4">{notice}</p>}
    {loading?<p role="status">{"Loading menu…"}</p>:<>
      <div className="demo-mobile-first"><section className="demo-kpis demo-kitchen-stats" aria-label="Menu summary"><div className="demo-kpi"><span>{"Item count"}</span><strong>{summary.count}</strong><button className="demo-button mt-3" disabled={busy} onClick={()=>{setError('');setEditing(emptyDish);}}><Plus size={16}/> {" Add new item"}</button></div><div className="demo-kpi"><span>{"Average selling price"}</span><strong>{money(summary.avgPrice)}</strong><small>{"Per menu item"}</small></div><div className="demo-kpi"><span>{"Average portion cost"}</span><strong>{money(summary.avgCost)}</strong><small>{"Ingredients for one portion"}</small></div><div className="demo-kpi"><span>{"Average gross margin"}</span><strong>{summary.avgMargin===null?"No data":summary.avgMargin.toFixed(1)+'%'}</strong><small>{"Preparation: "}{summary.avgPrep===null?"No data":summary.avgPrep.toFixed(0)+' min'}</small></div></section>
      <section className="demo-kitchen-cards mt-6"><div className="flex flex-wrap gap-3 mb-4"><label className="flex items-center gap-2"><Search size={18}/><input className="demo-input min-w-0 w-full" aria-label="Search dish or category" placeholder="Search dish or category" value={query} onChange={e=>setQuery(e.target.value)}/></label><button className="demo-button demo-button-secondary" onClick={()=>setView(view==='list'?'category':'list')}>{view==='list'?"Group by category":"Show list"}</button></div>
        {!items.length&&<div className="demo-card"><h2>{"You have no menu yet"}</h2><p className="demo-muted">{"Add your first dish manually or analyse documents."}</p></div>}
        {groups.map(group=>{const groupItems=filtered.filter(d=>view==='list'||d.category===group);return <div key={group} className="mb-6"><div className="demo-section-head"><h2>{group} <span className="demo-badge">{groupItems.length}</span></h2></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{groupItems.map(d=><DishCard key={d.id} dish={d} ingredients={preview} onRecipe={()=>setRecipeId(d.id)} busy={busy} onEdit={()=>{setError('');setEditing(d);}}/>)}</div></div>;})}
      </section></div><section className="demo-card mt-5"><h2 className="text-xl font-bold">{"Menu and recipe import"}</h2><p className="demo-muted mt-2">{"Add menus, recipes or invoices. CSV, XLSX, XLS, PDF, TXT and photos · up to 3 files / 12 MB. You can also enter dishes and ingredients manually."}</p><label className="demo-button mt-3 cursor-pointer">{"Upload documents"}<input className="sr-only" aria-label="Kitchen documents" type="file" accept=".csv,.xlsx,.xls,.pdf,.txt,.png,.jpg,.jpeg" multiple disabled={busy} onChange={e=>{void upload(e.target.files);e.target.value='';}}/></label>
        {imports.map(record=><details key={record.id} className="border-t border-[#ded9cd] mt-4 pt-4" open={record.status!=='approved'}><summary className="cursor-pointer font-bold">{record.files.map(f=>f.name).join(', ')} · {({uploaded:"Files saved",processing:"Processing",draft:"Review needed",approved:"Added to menu",error:"Needs attention"} as Record<string,string>)[record.status]}</summary>{record.error&&<p className="text-red-800 mt-2">{record.error}</p>}
          {record.status!=='approved'&&<div className="demo-actions"><button className="demo-button" disabled={busy} onClick={()=>importAction(record.id,'analyze')}>{record.draft?"Resume price analysis":"Analyse"}</button>{record.draft&&<><button className="demo-button demo-button-secondary" disabled={busy} onClick={()=>importAction(record.id,'estimate')}>{"Fill missing market prices"}</button><button className="demo-button" disabled={busy} onClick={()=>importAction(record.id,'approve')}>{"Approve and add to menu"}</button></>}</div>}
          {record.notes?.map((note,i)=><p className="demo-muted mt-2" key={i}>{note}</p>)}{record.search_suggestions?.map((html,i)=><iframe key={i} title={"Google search " +(i+1)} sandbox="allow-popups" referrerPolicy="no-referrer" srcDoc={sanitizeSearchHtml(html)} className="w-full border-0 mt-3 h-36"/>)}{record.draft&&<div className="mt-4"><p className="demo-muted">{"Estimates need verification. Existing ingredients keep your database prices. Confirm allergens and diet against recipes and labels."}</p>{record.draft.map((d,index)=><details key={index} className="p-3 rounded-xl bg-[#f7f4ef] mt-2"><summary>{d.name} · {money(d.sale_price)} {d.estimated_fields.includes('sale_price')?'(szacowana cena)':''}</summary><p className="text-sm my-2">{d.description}</p><p className="text-sm">{"tax: "}{d.vat??'—'}% · {d.prep_minutes??'—'} {" min · Recipe for "}{d.portions} {" portions"}</p><p className="text-sm">{"Diet: "}{d.diet||"To be confirmed"} {" · Allergens: "}{d.allergens.join(', ')||"To be confirmed"}</p><p className="demo-muted">{"Estimated / verify: "}{d.estimated_fields.map(field=>fieldLabels[field]||"Other information").join(', ')||'—'}</p>{d.recipe.map((line,i)=><p className="text-sm mt-2" key={i}>{line.name}: {line.quantity} {line.unit} · {money(line.price)}/{line.price_unit} {line.price_origin==='estimate'?'— szacunek rynkowy':''} {line.source_url&&<a className="underline" href={line.source_url} target="_blank" rel="noreferrer">{"Source ("}{line.checked_at?.slice(0,10)})</a>}</p>)}</details>)}{record.sources.length>0&&<div className="mt-3"><h3>{"Price sources"}</h3>{record.sources.map((s,i)=><a key={i} className="block underline text-sm" href={s.url} target="_blank" rel="noreferrer">{s.title}</a>)}</div>}</div>}
        </details>)}
      </section>
      <section className="demo-card mt-6"><div className="demo-section-head"><h2>{"Inventory ingredients"}</h2><Link href="/home/magazyn" className="demo-button">{"Add and edit inventory products"}</Link></div><p className="demo-muted">{"Base unit prices are calculated from pack price and size. Changes recalculate recipes."}</p>{ingredients.length?ingredients.map(i=><div key={i.id} className="flex justify-between gap-3 border-t py-3 mt-3"><strong>{i.name}</strong><span>{money(i.price)} / {i.unit}</span></div>):<p className="demo-empty">{"Add your first inventory product to see it here and in the recipe editor."}</p>}</section>
    </>}
    <button className="demo-button fixed bottom-20 right-5 z-30 md:hidden shadow-lg" disabled={busy||loading} onClick={()=>{setError('');setEditing(emptyDish);}}><Plus size={18}/> {" Add item"}</button>
    {selectedRecipe&&<RecipeDrawer dish={selectedRecipe} ingredients={preview} busy={busy} onClose={()=>setRecipeId(null)} onEdit={()=>{setRecipeId(null);setError('');setEditing(selectedRecipe);}}/>}
    {removing&&<ConfirmDelete name={removing.name} detail="The dish and recipe will be deleted from the database. Inventory products will remain." busy={busy} error={error} onClose={()=>setRemoving(null)} onConfirm={removeDish}/>}
    {editing&&<DishEditor key={editing.id||'new'} initial={editing} ingredients={preview} busy={busy} error={error} onClose={()=>setEditing(null)} onSave={dish=>save({kind:'dish',id:dish.id||null,revision:dish.revision||null,dish})}/>}
  </div></main>;
}

// ─── Category styling (mirrors demo) ─────────────────────────────────────────
const categoryEmoji: Record<string,string> = {"Starters":'🥗',"Main courses":'🍝',"Drinks":'🥤',"Alcohol":'🍸',"Desserts":'🍰',"Soups":'🍲',"Other":'🍽️'};
const categoryColor: Record<string,string> = {"Starters":'#b87333',"Main courses":'#8b5e3c',"Drinks":'#4a7c7c',"Alcohol":'#6b8e6b',"Desserts":'#9b6fa6',"Soups":'#7a6ea0',"Other":'#7a8b7a'};
const getColor = (cat: string) => categoryColor[cat] ?? '#7a8b7a';
const getEmoji = (cat: string) => categoryEmoji[cat] ?? '🍽️';
const moneyAmount = (v: number | null) => v === null ? "No data" : formatMoney(v,getCurrency(), "en-GB");

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
                {" tax "}{dish.vat}%
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
              <span className="text-sm text-[#6d594d]">{dish.prep_minutes} {" min"}</span>
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
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#b29b8c]">{"Allergens:"}</span>
            {dish.allergens.map(a=>(
              <span key={a} className="px-1.5 py-0.5 rounded text-[10px] bg-[#e8a96a]/15 text-[#c17d3a] font-medium">{a}</span>
            ))}
          </div>
        )}

        {/* Estimated fields warning */}
        {dish.estimated_fields.length > 0 && (
          <p className="text-[10px] text-amber-700 mt-2">{"⚠ Contains estimates or fields to verify"}</p>
        )}

        {/* Margin bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#9a877c]">{"Cost: "}{moneyAmount(m.portionCost)}</span>
            <span className="font-semibold" style={{color:margin===null?'#9a877c':margin>=70?'#6b8e6b':margin>=50?'#b87333':'#c0392b'}}>
              {" Margin: "}{margin===null?"No data":margin.toFixed(1)+'%'}
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
            {" Open recipe "}<ArrowUpRight className="w-3.5 h-3.5"/>
          </button>
          <button
            className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-[0.15em] transition-all border border-[#5a4335]/10 hover:border-[#b87333]/30 hover:bg-[#efe8df] text-[#6d594d]"
            disabled={busy}
            onClick={onEdit}
          >
            {" Edit "}</button>
        </div>
      </div>



    </article>
  );
}
