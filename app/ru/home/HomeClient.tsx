'use client';
import { fetch } from '@/i18n/fetch';
import {getSettings} from '@/utils/global-settings';

import Link from "@/i18n/navigation";
import { useEffect, useRef, useState, type RefObject } from 'react';
import { ArrowRight, FileSpreadsheet, Plus, Trash2, Download } from 'lucide-react';
import { modules } from "@/localized/ru/components/demo/DemoExperience";
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
      setFiles(previous => [data.file, ...previous]); setNotice("Файл сохранён в аккаунте.");
    } catch (error) { setError(error instanceof Error ? error.message : "Не удалось загрузить файл."); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  async function remove(file: UploadedFile) {
    if (!window.confirm("Удалить файл " + file.name + '?')) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/uploads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: file.path }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setFiles(previous => previous.filter(item => item.path !== file.path)); setNotice("Файл удалён.");
    } catch (error) { setError(error instanceof Error ? error.message : "Не удалось удалить файл."); }
    finally { setBusy(false); }
  }
  async function download(file: UploadedFile) {
    setError('');
    try {
      const response = await fetch('/api/uploads?path=' + encodeURIComponent(file.path));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (error) { setError(error instanceof Error ? error.message : "Не удалось скачать файл."); }
  }
  return <HomeWorkspace files={files} loading={loading} busy={busy} error={error} notice={notice} input={input} upload={upload} remove={remove} download={download}/>;
}

/** Shared presentation; account reads and mutations stay in HomeClient. */
export function HomeWorkspace({files,loading,busy,error,notice,input,upload,remove,download}:{files:UploadedFile[];loading:boolean;busy:boolean;error:string;notice:string;input:RefObject<HTMLInputElement|null>;upload:(file:File)=>Promise<void>;remove:(file:UploadedFile)=>Promise<void>;download:(file:UploadedFile)=>Promise<void>}){
  return <main className="demo-shell"><div className="demo-container">
    <h1 className="sr-only">{"Всё на своём месте."}</h1>
    <section aria-label="Модули ресторана">
      <div className="demo-modules">{modules.map((module, index) => <Link key={module.key} href={'/home/' + module.key} className="demo-module-card">
        <div className="demo-module-top"><span className={'demo-feature-icon ' + module.color}><module.icon size={25} /></span><span className="demo-module-number">0{index + 1} / 04</span></div>
        <h3>{module.name}</h3><p>{module.description}</p><span className="demo-module-open">{"Открыть "}{module.name.toLowerCase()} <ArrowRight size={16} /></span>
      </Link>)}</div>
    </section>
    <section className="demo-workspace" aria-label="Ваше рабочее пространство">
      <div className="demo-card"><div className="workspace-file-head"><div><p className="demo-eyebrow">{"Ваши данные"}</p><h2 style={{ margin: '6px 0' }}>{"Мои файлы"}</h2></div><span className="workspace-file-count">{loading?'…':files.length} / 100</span></div><p className="demo-muted">{"Загрузите отчёты POS и создайте анализ ресторана. CSV, XLSX, XLS или PDF · до 100 файлов / 50 МБ."}</p>
        {error && <p role="alert" className="demo-card" style={{ marginTop: 16, color: '#a22' }}>{error}</p>}
        {notice && <p role="status" className="demo-card" style={{ marginTop: 16 }}>{notice}</p>}
        <div className="workspace-file-list">{loading ? <p role="status">{"Загрузка файлов…"}</p> : files.length === 0 ? <p className="demo-empty" style={{ marginTop: 12 }}>{"Файлов пока нет. Добавьте первый отчёт, чтобы начать."}</p> : files.map(file => <div className="demo-file" key={file.path}>
          <FileSpreadsheet size={22} color="#46794a" /><div style={{ minWidth: 0, overflowWrap: 'anywhere' }}><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(1)} {" КБ · "}{new Date(file.uploaded_at).toLocaleDateString("ru-RU", { timeZone: getSettings().timeZone })}</small></div>
          <button className="demo-icon-button" disabled={busy} aria-label={"Скачать " + file.name} onClick={() => download(file)}><Download size={16} /></button>
          <button className="demo-icon-button" disabled={busy} aria-label={"Удалить " + file.name} onClick={() => remove(file)}><Trash2 size={16} /></button>
        </div>)}</div>
        <input ref={input} type="file" accept=".csv,.xlsx,.xls,.pdf" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
        <div className="demo-actions"><button disabled={busy || loading} className="demo-button demo-button-secondary" onClick={() => input.current?.click()}><Plus size={17} /> {busy ? "Сохранение…" : "Добавить файл"}</button><Link className="demo-button" href="/home/panel">{"Открыть месячный анализ "}<ArrowRight size={18} /></Link></div>
        <p className="demo-muted" style={{ marginTop: 12, fontSize: 11 }}>{"Файлы хранятся приватно в аккаунте. Анализ обрабатывает данные загруженных отчётов."}</p>
      </div>
      <aside className="workspace-guide"><span className="demo-eyebrow">{"Следующий шаг"}</span><h2>{"От файлов к ответам."}</h2><ol><li>{"Добавьте отчёты"}<small>{"Один или несколько экспортов из вашей POS."}</small></li><li>{"Проверьте столбцы"}<small>{"Свяжите товары, чеки и платежи."}</small></li><li>{"Изучите результаты"}<small>{"Продажи, тренды и детали в одном месте."}</small></li></ol><Link href="/home/panel" className="demo-button demo-button-secondary">{"Перейти к аналитике "}<ArrowRight size={15}/></Link></aside>
    </section>
  </div></main>;
}
