'use client';

import Link from "@/i18n/navigation";
import { useState } from 'react';
import { ArrowRight, FileSpreadsheet, Plus, UploadCloud, Trash2, MessageCircle } from 'lucide-react';
import { DemoFooter, SubscribeDialog, modules } from "@/localized/pl/components/demo/DemoExperience";

export default function DemoClient() {
  const [feature, setFeature] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState('');
  return <main className="demo-shell"><div className="demo-container">
    <section aria-label="Moduły demonstracyjne" style={{ paddingTop: 32 }}>
      <div className="demo-modules">{modules.map((m,i) => <Link id={`demo-${m.key}`} key={m.key} href={m.href} className="demo-module-card"><div className="demo-module-top"><span className={`demo-feature-icon ${m.color}`}><m.icon size={25} /></span><span className="demo-module-number">0{i+1} / 04</span></div><h3>{m.name}</h3><p>{m.description}</p><p style={{ fontSize: 12, marginTop: 9 }}>{m.detail}</p><span className="demo-module-open">{"Otwórz demo "}<ArrowRight size={19} /></span></Link>)}</div>
    </section>
    <DemoFooter />
    <section className="demo-workspace" aria-label="Przykładowa przestrzeń robocza">
      <div className="demo-card"><p className="demo-eyebrow">{"Krok 2 · Poznaj import danych"}</p><h2 style={{ margin: '8px 0' }}>{"Moje pliki"}</h2><p className="demo-muted">{"Analizuj pliki POS w jednym miejscu. Po subskrypcji dodasz własne raporty i wygenerujesz analizę."}</p>
        {[{name:'raport_sprzedazy_marzec.xlsx',size:'24 KB'},{name:'koszty_personelu_v2.csv',size:'12 KB'}].map(f => <div className="demo-file" key={f.name}><FileSpreadsheet size={22} color="#46794a" /><div><strong>{f.name}</strong><small>{f.size} {" · plik przykładowy"}</small></div><button className="demo-icon-button" aria-label={`Usuń plik ${f.name}`} onClick={() => setFeature('Zarządzanie plikami')}><Trash2 size={16} /></button></div>)}
        <div className="demo-actions"><button className="demo-button demo-button-secondary" onClick={() => setFeature('Import własnych plików')}><Plus size={17} /> {" Dodaj plik"}</button><button className="demo-button" onClick={() => setFeature('Analiza danych POS')}><UploadCloud size={18} /> {" Generuj analizę"}</button></div><p className="demo-muted" style={{ marginTop: 12, fontSize: 11 }}>{"Demo nie przesyła plików i nie zapisuje zmian. Twoje raporty pozostają na Twoim urządzeniu."}</p>
      </div>
      <div className="demo-card"><p className="demo-eyebrow">{"Twoja przestrzeń"}</p><p className="demo-muted">{"Masz pytania o wdrożenie? Poznaj ofertę dla swojej restauracji lub skontaktuj się ze sprzedażą."}</p>
        <div className="demo-actions"><button className="demo-button demo-button-secondary" onClick={() => setShowContact(!showContact)} aria-expanded={showContact}><MessageCircle size={17} /> {" Skontaktuj się ze sprzedażą"}</button><Link className="demo-tour-link" href="/login">{"Zaloguj się / Załóż konto "}<ArrowRight size={15} /></Link></div>
        {showContact && <div style={{ marginTop: 18 }}><label htmlFor="demo-contact" className="demo-muted">{"Wiadomość do zespołu (podgląd formularza)"}</label><textarea id="demo-contact" className="demo-input" style={{ width: '100%', marginTop: 8 }} rows={3} placeholder="Jak możemy pomóc w rozwoju Twojego lokalu?" value={message} onChange={e => setMessage(e.target.value)} /><p className="demo-muted">{"To podgląd — wiadomość nie zostanie wysłana. Kontakt jest dostępny na stronie oferty."}</p><div className="demo-actions"><Link className="demo-button" href="/cennik">{"Przejdź do kontaktu "}<ArrowRight size={15} /></Link><button className="demo-button demo-button-quiet" onClick={() => setShowContact(false)}>{"Anuluj"}</button></div></div>}
      </div>
    </section>
  </div>{feature && <SubscribeDialog feature={feature} onClose={() => setFeature(null)} />}</main>;
}

