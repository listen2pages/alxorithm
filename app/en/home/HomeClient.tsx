'use client';
import { fetch } from '@/i18n/fetch';
import {getSettings} from '@/utils/global-settings';

import Link from "@/i18n/navigation";
import { useEffect, useRef, useState, type RefObject } from 'react';
import { ArrowRight, FileSpreadsheet, Plus, Trash2, Download } from 'lucide-react';
import { modules } from "@/localized/en/components/demo/DemoExperience";
import { validateUpload, type UploadedFile } from '@/utils/uploads';

export default function HomeClient() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/uploads', { signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setFiles(data.files);
    }).catch(error => { if (error.name !== 'AbortError') setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  async function upload(file: File) {
    const invalid = validateUpload(file.name, file.size, files);
    if (invalid) { setError(invalid); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const body = new FormData(); body.append('file', file);
      const response = await fetch('/api/uploads', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setFiles(previous => [data.file, ...previous]); setNotice("File saved in your account.");
    } catch (error) { setError(error instanceof Error ? error.message : "Could not upload the file."); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  async function remove(file: UploadedFile) {
    if (!window.confirm("Delete file " + file.name + '?')) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/uploads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: file.path }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setFiles(previous => previous.filter(item => item.path !== file.path)); setNotice("File deleted.");
    } catch (error) { setError(error instanceof Error ? error.message : "Could not delete the file."); }
    finally { setBusy(false); }
  }
  async function download(file: UploadedFile) {
    setError('');
    try {
      const response = await fetch('/api/uploads?path=' + encodeURIComponent(file.path));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (error) { setError(error instanceof Error ? error.message : "Could not download the file."); }
  }
  return <HomeWorkspace files={files} loading={loading} busy={busy} error={error} notice={notice} input={input} upload={upload} remove={remove} download={download}/>;
}

/** Shared presentation; account reads and mutations stay in HomeClient. */
export function HomeWorkspace({files,loading,busy,error,notice,input,upload,remove,download}:{files:UploadedFile[];loading:boolean;busy:boolean;error:string;notice:string;input:RefObject<HTMLInputElement|null>;upload:(file:File)=>Promise<void>;remove:(file:UploadedFile)=>Promise<void>;download:(file:UploadedFile)=>Promise<void>}){
  return <main className="demo-shell"><div className="demo-container">
    <h1 className="sr-only">{"Everything in its place."}</h1>
    <section aria-label="Restaurant modules">
      <div className="demo-modules">{modules.map((module, index) => <Link key={module.key} href={'/home/' + module.key} className="demo-module-card">
        <div className="demo-module-top"><span className={'demo-feature-icon ' + module.color}><module.icon size={25} /></span><span className="demo-module-number">0{index + 1} / 04</span></div>
        <h3>{module.name}</h3><p>{module.description}</p><span className="demo-module-open">{"Open "}{module.name.toLowerCase()} <ArrowRight size={16} /></span>
      </Link>)}</div>
    </section>
    <section className="demo-workspace" aria-label="Your workspace">
      <div className="demo-card"><div className="workspace-file-head"><div><p className="demo-eyebrow">{"Your data"}</p><h2 style={{ margin: '6px 0' }}>{"My files"}</h2></div><span className="workspace-file-count">{loading?'…':files.length} / 100</span></div><p className="demo-muted">{"Upload POS reports and generate restaurant analysis. CSV, XLSX, XLS or PDF · up to 100 files / 50 MB."}</p>
        {error && <p role="alert" className="demo-card" style={{ marginTop: 16, color: '#a22' }}>{error}</p>}
        {notice && <p role="status" className="demo-card" style={{ marginTop: 16 }}>{notice}</p>}
        <div className="workspace-file-list">{loading ? <p role="status">{"Loading files…"}</p> : files.length === 0 ? <p className="demo-empty" style={{ marginTop: 12 }}>{"You have no files yet. Add your first report to get started."}</p> : files.map(file => <div className="demo-file" key={file.path}>
          <FileSpreadsheet size={22} color="#46794a" /><div style={{ minWidth: 0, overflowWrap: 'anywhere' }}><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(1)} {" KB · "}{new Date(file.uploaded_at).toLocaleDateString("en-GB", { timeZone: getSettings().timeZone })}</small></div>
          <button className="demo-icon-button" disabled={busy} aria-label={"Download " + file.name} onClick={() => download(file)}><Download size={16} /></button>
          <button className="demo-icon-button" disabled={busy} aria-label={"Delete " + file.name} onClick={() => remove(file)}><Trash2 size={16} /></button>
        </div>)}</div>
        <input ref={input} type="file" accept=".csv,.xlsx,.xls,.pdf" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
        <div className="demo-actions"><button disabled={busy || loading} className="demo-button demo-button-secondary" onClick={() => input.current?.click()}><Plus size={17} /> {busy ? "Saving…" : "Add file"}</button><Link className="demo-button" href="/home/panel">{"Open monthly analysis "}<ArrowRight size={18} /></Link></div>
        <p className="demo-muted" style={{ marginTop: 12, fontSize: 11 }}>{"Files are stored privately in your account. Analysis processes data from uploaded reports."}</p>
      </div>
      <aside className="workspace-guide"><span className="demo-eyebrow">{"Your next step"}</span><h2>{"From files to answers."}</h2><ol><li>{"Add your reports"}<small>{"One or several exports from your POS."}</small></li><li>{"Review the columns"}<small>{"Connect products, receipts and payments."}</small></li><li>{"Explore the results"}<small>{"Sales, trends and details in one place."}</small></li></ol><Link href="/home/panel" className="demo-button demo-button-secondary">{"Go to analytics "}<ArrowRight size={15}/></Link></aside>
    </section>
  </div></main>;
}
