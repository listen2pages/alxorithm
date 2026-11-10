'use client';
import {getSettings} from '@/utils/global-settings';

import Link from 'next/link';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { ArrowRight, FileSpreadsheet, Plus, Trash2, Download } from 'lucide-react';
import { modules } from '@/components/demo/DemoExperience';
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
      setFiles(previous => [data.file, ...previous]); setNotice('Plik zapisany na Twoim koncie.');
    } catch (error) { setError(error instanceof Error ? error.message : 'Nie udało się przesłać pliku.'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  async function remove(file: UploadedFile) {
    if (!window.confirm('Usunąć plik ' + file.name + '?')) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/uploads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: file.path }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setFiles(previous => previous.filter(item => item.path !== file.path)); setNotice('Plik usunięty.');
    } catch (error) { setError(error instanceof Error ? error.message : 'Nie udało się usunąć pliku.'); }
    finally { setBusy(false); }
  }
  async function download(file: UploadedFile) {
    setError('');
    try {
      const response = await fetch('/api/uploads?path=' + encodeURIComponent(file.path));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (error) { setError(error instanceof Error ? error.message : 'Nie udało się pobrać pliku.'); }
  }
  return <HomeWorkspace files={files} loading={loading} busy={busy} error={error} notice={notice} input={input} upload={upload} remove={remove} download={download}/>;
}

/** Shared presentation; account reads and mutations stay in HomeClient. */
export function HomeWorkspace({files,loading,busy,error,notice,input,upload,remove,download}:{files:UploadedFile[];loading:boolean;busy:boolean;error:string;notice:string;input:RefObject<HTMLInputElement|null>;upload:(file:File)=>Promise<void>;remove:(file:UploadedFile)=>Promise<void>;download:(file:UploadedFile)=>Promise<void>}){
  return <main className="demo-shell"><div className="demo-container">
    <h1 className="sr-only">Wszystko na swoim miejscu.</h1>
    <section aria-label="Moduły restauracji">
      <div className="demo-modules">{modules.map((module, index) => <Link key={module.key} href={'/home/' + module.key} className="demo-module-card">
        <div className="demo-module-top"><span className={'demo-feature-icon ' + module.color}><module.icon size={25} /></span><span className="demo-module-number">0{index + 1} / 04</span></div>
        <h3>{module.name}</h3><p>{module.description}</p><span className="demo-module-open">Otwórz {module.name.toLowerCase()} <ArrowRight size={16} /></span>
      </Link>)}</div>
    </section>
    <section className="demo-workspace" aria-label="Twoja przestrzeń robocza">
      <div className="demo-card"><div className="workspace-file-head"><div><p className="demo-eyebrow">Twoje dane</p><h2 style={{ margin: '6px 0' }}>Moje pliki</h2></div><span className="workspace-file-count">{loading?'…':files.length} / 100</span></div><p className="demo-muted">Prześlij raporty POS i wygeneruj analizę swojej restauracji. CSV, XLSX, XLS lub PDF · do 100 plików / 50 MB.</p>
        {error && <p role="alert" className="demo-card" style={{ marginTop: 16, color: '#a22' }}>{error}</p>}
        {notice && <p role="status" className="demo-card" style={{ marginTop: 16 }}>{notice}</p>}
        <div className="workspace-file-list">{loading ? <p role="status">Ładowanie plików…</p> : files.length === 0 ? <p className="demo-empty" style={{ marginTop: 12 }}>Nie masz jeszcze plików. Dodaj pierwszy raport, aby rozpocząć.</p> : files.map(file => <div className="demo-file" key={file.path}>
          <FileSpreadsheet size={22} color="#46794a" /><div style={{ minWidth: 0, overflowWrap: 'anywhere' }}><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(1)} KB · {new Date(file.uploaded_at).toLocaleDateString('pl-PL', { timeZone: getSettings().timeZone })}</small></div>
          <button className="demo-icon-button" disabled={busy} aria-label={'Pobierz ' + file.name} onClick={() => download(file)}><Download size={16} /></button>
          <button className="demo-icon-button" disabled={busy} aria-label={'Usuń ' + file.name} onClick={() => remove(file)}><Trash2 size={16} /></button>
        </div>)}</div>
        <input ref={input} type="file" accept=".csv,.xlsx,.xls,.pdf" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
        <div className="demo-actions"><button disabled={busy || loading} className="demo-button demo-button-secondary" onClick={() => input.current?.click()}><Plus size={17} /> {busy ? 'Zapisywanie…' : 'Dodaj plik'}</button><Link className="demo-button" href="/home/panel">Otwórz analizę miesięczną <ArrowRight size={18} /></Link></div>
        <p className="demo-muted" style={{ marginTop: 12, fontSize: 11 }}>Pliki są przechowywane prywatnie na Twoim koncie. Analiza przetwarza dane z przesłanych raportów.</p>
      </div>
      <aside className="workspace-guide"><span className="demo-eyebrow">Następny krok</span><h2>Od pliku do odpowiedzi.</h2><ol><li>Dodaj raporty<small>Jeden lub kilka eksportów z Twojego POS.</small></li><li>Sprawdź kolumny<small>Połącz produkty, paragony i płatności.</small></li><li>Poznaj wyniki<small>Sprzedaż, trendy i szczegóły w jednym miejscu.</small></li></ol><Link href="/home/panel" className="demo-button demo-button-secondary">Przejdź do analizy <ArrowRight size={15}/></Link></aside>
    </section>
  </div></main>;
}
