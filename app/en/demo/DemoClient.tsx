'use client';

import Link from "@/i18n/navigation";
import { useState } from 'react';
import { ArrowRight, FileSpreadsheet, Plus, UploadCloud, Trash2, MessageCircle } from 'lucide-react';
import { DemoFooter, SubscribeDialog, modules } from "@/localized/en/components/demo/DemoExperience";

export default function DemoClient() {
  const [feature, setFeature] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState('');
  return <main className="demo-shell"><div className="demo-container">
    <section aria-label="Demo modules" style={{ paddingTop: 32 }}>
      <div className="demo-modules">{modules.map((m,i) => <Link id={`demo-${m.key}`} key={m.key} href={m.href} className="demo-module-card"><div className="demo-module-top"><span className={`demo-feature-icon ${m.color}`}><m.icon size={25} /></span><span className="demo-module-number">0{i+1} / 04</span></div><h3>{m.name}</h3><p>{m.description}</p><p style={{ fontSize: 12, marginTop: 9 }}>{m.detail}</p><span className="demo-module-open">{"Open demo "}<ArrowRight size={19} /></span></Link>)}</div>
    </section>
    <DemoFooter />
    <section className="demo-workspace" aria-label="Sample workspace">
      <div className="demo-card"><p className="demo-eyebrow">{"Step 2 · Explore data import"}</p><h2 style={{ margin: '8px 0' }}>{"My files"}</h2><p className="demo-muted">{"Analyse POS files in one place. With a subscription, upload your own reports and generate analysis."}</p>
        {[{name:'raport_sprzedazy_marzec.xlsx',size:'24 KB'},{name:'koszty_personelu_v2.csv',size:'12 KB'}].map(f => <div className="demo-file" key={f.name}><FileSpreadsheet size={22} color="#46794a" /><div><strong>{f.name}</strong><small>{f.size} {" · sample file"}</small></div><button className="demo-icon-button" aria-label={`Delete file ${f.name}`} onClick={() => setFeature("File management")}><Trash2 size={16} /></button></div>)}
        <div className="demo-actions"><button className="demo-button demo-button-secondary" onClick={() => setFeature("Import your own files")}><Plus size={17} /> {" Add file"}</button><button className="demo-button" onClick={() => setFeature("POS data analysis")}><UploadCloud size={18} /> {" Generate analysis"}</button></div><p className="demo-muted" style={{ marginTop: 12, fontSize: 11 }}>{"The demo does not upload files or save changes. Your reports stay on your device."}</p>
      </div>
      <div className="demo-card"><p className="demo-eyebrow">{"Your workspace"}</p><p className="demo-muted">{"Questions about getting started? Explore the offer for your restaurant or contact sales."}</p>
        <div className="demo-actions"><button className="demo-button demo-button-secondary" onClick={() => setShowContact(!showContact)} aria-expanded={showContact}><MessageCircle size={17} /> {" Contact sales"}</button><Link className="demo-tour-link" href="/login">{"Sign in / Create account "}<ArrowRight size={15} /></Link></div>
        {showContact && <div style={{ marginTop: 18 }}><label htmlFor="demo-contact" className="demo-muted">{"Message to the team (form preview)"}</label><textarea id="demo-contact" className="demo-input" style={{ width: '100%', marginTop: 8 }} rows={3} placeholder="How can we help your business grow?" value={message} onChange={e => setMessage(e.target.value)} /><p className="demo-muted">{"This is a preview; the message will not be sent. Contact details are on the pricing page."}</p><div className="demo-actions"><Link className="demo-button" href="/cennik">{"Go to contact "}<ArrowRight size={15} /></Link><button className="demo-button demo-button-quiet" onClick={() => setShowContact(false)}>{"Cancel"}</button></div></div>}
      </div>
    </section>
  </div>{feature && <SubscribeDialog feature={feature} onClose={() => setFeature(null)} />}</main>;
}

