'use client';
import { fetch } from '@/i18n/fetch';
import {useWorkspacePeriod} from '@/i18n/WorkspacePeriod';
import { useEffect,useState } from 'react';
import { FolderOpen,Loader2 } from 'lucide-react';
import { validPeriod,monthLabel,type Month,type Mapping,type FileRole } from "@/localized/pl/utils/panel/types";
import type { UploadedFile } from '@/utils/uploads';
import ImportFiles from '@/i18n/ImportFiles';
import MappingEditor from './MappingEditor';
import ReportView from './ReportView';
export default function PanelClient(){
  const {period,setPeriod}=useWorkspacePeriod();
  const [month,setMonth]=useState<Month|null>(null),[existing,setExisting]=useState<UploadedFile[]>([]);
  const [availablePeriods,setAvailablePeriods]=useState<{period:string;rows:number}[]>([]);
  const [mapping,setMapping]=useState<Mapping|null>(null),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[refresh,setRefresh]=useState(0),[showFiles,setShowFiles]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();setLoading(true);setError('');setAvailablePeriods([]);setMonth(null);setMapping(null);setShowFiles(false);
    fetch('/api/panel/'+period,{signal:controller.signal}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error);setMonth(data.month);setMapping(data.month?.mapping||null);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[period,refresh]);
  useEffect(()=>{const controller=new AbortController();fetch('/api/uploads',{signal:controller.signal}).then(async r=>{if(r.ok){const data=await r.json();setExisting(data.files.filter((file:UploadedFile)=>file.name.toLowerCase().endsWith('.csv')));}}).catch(()=>{});return()=>controller.abort();},[]);
  const navigate=(next:string)=>{if(validPeriod(next)&&!busy)setPeriod(next);};
  async function upload(selected:File[]|string,id?:string){
    setBusy(true);setError('');
    try{const form=new FormData();form.append('revision',month?.revision||'');if(id)form.append('role',id);if(typeof selected==='string')form.append('path',selected);else selected.forEach(f=>form.append('files',f));
      const response=await fetch('/api/panel/'+period,{method:'PUT',body:form});const data=await response.json();if(!response.ok)throw new Error(data.error);setRefresh(n=>n+1);
    }catch(e){setError(e instanceof Error?e.message:'Nie udało się zapisać pliku.');}finally{setBusy(false);}
  }
  async function removeFile(fileId:string){
    setBusy(true);setError('');try{const response=await fetch('/api/panel/'+period,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileId,revision:month?.revision})});const data=await response.json();if(!response.ok)throw new Error(data.error);setRefresh(n=>n+1);}catch(e){setError(e instanceof Error?e.message:'Operacja nie powiodła się.');}finally{setBusy(false);}
  }
  async function analyze(action:'map'|'remap'|'calculate'){
    setBusy(true);setError('');setAvailablePeriods([]);
    try{const response=await fetch('/api/panel/'+period,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,revision:month?.revision,mapping})});const data=await response.json();if(!response.ok){if(data.code==='NO_SALES_IN_PERIOD'&&Array.isArray(data.availablePeriods))setAvailablePeriods(data.availablePeriods);throw new Error(data.error);}setRefresh(n=>n+1);
    }catch(e){setError(e instanceof Error?e.message:'Analiza nie powiodła się.');}finally{setBusy(false);}
  }
  const report=month?.report_revision===month?.revision?month?.report:null;
  const locked=busy||loading;

  const filesSection = (
    <div key="files-section" className="report-files-section">
      <ImportFiles files={month?.files||{}} mapping={mapping} existing={existing} disabled={locked} onAdd={(files,id)=>void upload(files,id)} onRemove={id=>void removeFile(id)}/>
      {month?.error&&!error?(
        <p role="alert" className="mt-4 text-red-800"><span>{month.error}</span></p>
      ):null}
      <div className="mt-5">
        {!mapping ? (
          <button
            key="btn-analyze-map"
            type="button"
            className="demo-button"
            disabled={locked||!Object.values(month?.files||{}).some(Boolean)}
            onClick={()=>analyze('map')}
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18}/>
                <span>{"Analizowanie kolumn…"}</span>
              </span>
            ) : (
              <span>{"Analizuj pliki"}</span>
            )}
          </button>
        ) : (
          <div key="mapping-editor-block">
            <button type="button" disabled={locked} className="demo-button demo-button-secondary mb-3" onClick={()=>analyze('remap')}>{"Rozpoznaj kolumny ponownie"}</button>
            <MappingEditor value={mapping} onChange={setMapping} files={month?.files||{}} disabled={locked}/>
            <button
              key="btn-analyze-calc"
              type="button"
              className="demo-button mt-4"
              disabled={locked}
              onClick={()=>analyze('calculate')}
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18}/>
                  <span>{"Obliczanie wszystkich wierszy…"}</span>
                </span>
              ) : (
                <span>{"Zatwierdź mapowanie i oblicz raport"}</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return <main className="demo-shell"><section className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6">
    
    <h1 className="sr-only">{"Panel: "}{monthLabel(period)}</h1>
    {error ? (
      <div role="alert" className="demo-card mt-4 text-red-800 flex items-center justify-between">
        <div><span>{error}</span>{availablePeriods.length>0&&<div className="mt-3"><p className="text-sm">{"W odpowiednim miesiącu wybierz te same CSV z listy zapisanych plików. Jeśli daty są niezgodne z eksportem, popraw mapowanie poniżej."}</p><div className="flex flex-wrap gap-2 mt-3">{availablePeriods.filter(p=>validPeriod(p.period)).map(p=><button key={p.period} type="button" disabled={locked} className="demo-button demo-button-secondary" onClick={()=>navigate(p.period)}>{"Otwórz "}{monthLabel(p.period)} · {p.rows} {" wierszy"}</button>)}</div></div>}</div>
        <button type="button" className="demo-button demo-button-secondary ml-3" disabled={busy} onClick={()=>setRefresh(n=>n+1)}>
          <span>{"Odśwież"}</span>
        </button>
      </div>
    ) : null}
    <div>
      {loading && !month ? (
        <p role="status" className="py-8">{"Ładowanie miesiąca…"}</p>
      ) : (
        <div>
          {report ? (
            <div key="report-mode">
              <button
                type="button"
                className="report-files-toggle"
                disabled={busy}
                onClick={()=>setShowFiles(v=>!v)}
              >
                <FolderOpen size={14}/><span>{showFiles?'Ukryj pliki':'Zarządzaj plikami'}</span>
              </button>
              {showFiles ? filesSection : null}
              <ReportView report={report}/>
            </div>
          ) : (
            <div key="files-mode">
              {filesSection}
            </div>
          )}
        </div>
      )}
    </div>
  </section></main>;
}
