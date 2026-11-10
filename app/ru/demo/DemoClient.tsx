'use client';

import Link from "@/i18n/navigation";
import { useState } from 'react';
import { ArrowRight, FileSpreadsheet, Plus, UploadCloud, Trash2, MessageCircle } from 'lucide-react';
import { DemoFooter, SubscribeDialog, modules } from "@/localized/ru/components/demo/DemoExperience";

export default function DemoClient() {
  const [feature, setFeature] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState('');
  return <main className="demo-shell"><div className="demo-container">
    <section aria-label="Демонстрационные модули" style={{ paddingTop: 32 }}>
      <div className="demo-modules">{modules.map((m,i) => <Link id={`demo-${m.key}`} key={m.key} href={m.href} className="demo-module-card"><div className="demo-module-top"><span className={`demo-feature-icon ${m.color}`}><m.icon size={25} /></span><span className="demo-module-number">0{i+1} / 04</span></div><h3>{m.name}</h3><p>{m.description}</p><p style={{ fontSize: 12, marginTop: 9 }}>{m.detail}</p><span className="demo-module-open">{"Открыть демо "}<ArrowRight size={19} /></span></Link>)}</div>
    </section>
    <DemoFooter />
    <section className="demo-workspace" aria-label="Пример рабочего пространства">
      <div className="demo-card"><p className="demo-eyebrow">{"Шаг 2 · Изучите импорт данных"}</p><h2 style={{ margin: '8px 0' }}>{"Мои файлы"}</h2><p className="demo-muted">{"Анализируйте файлы POS в одном месте. После подписки загрузите свои отчёты и создайте анализ."}</p>
        {[{name:'raport_sprzedazy_marzec.xlsx',size:'24 KB'},{name:'koszty_personelu_v2.csv',size:'12 KB'}].map(f => <div className="demo-file" key={f.name}><FileSpreadsheet size={22} color="#46794a" /><div><strong>{f.name}</strong><small>{f.size} {" · пример файла"}</small></div><button className="demo-icon-button" aria-label={`Удалить файл ${f.name}`} onClick={() => setFeature("Управление файлами")}><Trash2 size={16} /></button></div>)}
        <div className="demo-actions"><button className="demo-button demo-button-secondary" onClick={() => setFeature("Импорт своих файлов")}><Plus size={17} /> {" Добавить файл"}</button><button className="demo-button" onClick={() => setFeature("Анализ данных POS")}><UploadCloud size={18} /> {" Создать анализ"}</button></div><p className="demo-muted" style={{ marginTop: 12, fontSize: 11 }}>{"Демо не загружает файлы и не сохраняет изменения. Отчёты остаются на вашем устройстве."}</p>
      </div>
      <div className="demo-card"><p className="demo-eyebrow">{"Ваше пространство"}</p><p className="demo-muted">{"Есть вопросы о внедрении? Посмотрите предложение для ресторана или свяжитесь с отделом продаж."}</p>
        <div className="demo-actions"><button className="demo-button demo-button-secondary" onClick={() => setShowContact(!showContact)} aria-expanded={showContact}><MessageCircle size={17} /> {" Связаться с отделом продаж"}</button><Link className="demo-tour-link" href="/login">{"Войти / Создать аккаунт "}<ArrowRight size={15} /></Link></div>
        {showContact && <div style={{ marginTop: 18 }}><label htmlFor="demo-contact" className="demo-muted">{"Сообщение команде (пример формы)"}</label><textarea id="demo-contact" className="demo-input" style={{ width: '100%', marginTop: 8 }} rows={3} placeholder="Как помочь развитию вашего заведения?" value={message} onChange={e => setMessage(e.target.value)} /><p className="demo-muted">{"Это пример, сообщение не отправляется. Контакты доступны на странице тарифа."}</p><div className="demo-actions"><Link className="demo-button" href="/cennik">{"Перейти к контактам "}<ArrowRight size={15} /></Link><button className="demo-button demo-button-quiet" onClick={() => setShowContact(false)}>{"Отмена"}</button></div></div>}
      </div>
    </section>
  </div>{feature && <SubscribeDialog feature={feature} onClose={() => setFeature(null)} />}</main>;
}

