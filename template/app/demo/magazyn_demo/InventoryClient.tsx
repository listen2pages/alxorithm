'use client';
import {useRegionalSettings} from '@/i18n/useRegionalSettings';

import { useState } from 'react';
import { Package, RotateCcw, Save, Trash2, ArrowDownRight } from 'lucide-react';
import { AddDemoButton, DemoFooter, DemoHeading, DemoNavigation, SubscribeDialog } from '@/components/demo/DemoExperience';
import { stockItems, stockBalance } from '@/utils/demo/inventory';
import { money, number } from '@/utils/demo/staff';

export default function InventoryClient() {useRegionalSettings();
  const [counts, setCounts] = useState<Record<number, string>>(() => Object.fromEntries(stockItems.map(i => [i.id, String(i.counted)])));
  const [query, setQuery] = useState('');
  const [zone, setZone] = useState('Wszystkie');
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [feature, setFeature] = useState<string | null>(null);
  const valid = (id: number) => { const n = Number(counts[id]); return counts[id].trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 100000 && (stockItems.find(i => i.id === id)?.unit !== 'szt' || Number.isInteger(n)); };
  const allValid = stockItems.every(i => valid(i.id));
  const rows = stockItems.map(item => ({ item, ...stockBalance(item, Number(counts[item.id]) || 0) }));
  const total = (key: 'stockValue' | 'totalLoss' | 'recordedWasteCost' | 'shortageCost' | 'surplusValue') => rows.reduce((sum, row) => sum + row[key], 0);
  const filtered = rows.filter(row => (zone === 'Wszystkie' || row.item.zone === zone) && `${row.item.name} ${row.item.recipe}`.toLocaleLowerCase('pl-PL').includes(query.toLocaleLowerCase('pl-PL')) && (!onlyIssues || row.difference !== 0 || Number(counts[row.item.id]) < row.item.minimum));
  return <main className="demo-shell demo-has-floating"><div className="demo-container">
    <DemoNavigation current="magazyn" /><DemoFooter />
    <DemoHeading eyebrow="04 / Magazyn" title="Mniej strat. Więcej z każdej dostawy.">Porównaj zapas z wynikiem inwentaryzacji i policz wartość odpadów. Zmień stan rzeczywisty produktu, aby sprawdzić, jak działa demo.</DemoHeading>
    <div className="demo-range"><Package size={22} /><div><strong style={{ fontSize: 14 }}>Inwentaryzacja: 13.09.2026</strong><p style={{ margin: '4px 0 0' }}>Ruchy magazynowe: 07–13.09.2026 · ceny zakupu netto · dane przykładowe</p></div><div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="demo-button demo-button-secondary" onClick={() => setFeature('Reset inwentaryzacji')}><RotateCcw size={16} /> Resetuj</button><button className="demo-button" onClick={() => setFeature('Zapis inwentaryzacji')}><Save size={16} /> Zapisz</button></div></div>
    {!allValid && <p className="demo-error" role="alert">Uzupełnij poprawny stan każdego produktu (0–100 000). Dla sztuk wpisz liczbę całkowitą. Podsumowanie pojawi się po poprawieniu danych.</p>}
    <section className="demo-kpis" id="inventory-summary" aria-label="Podsumowanie całego magazynu">
      <div className="demo-kpi demo-kpi-feature"><span>Produkty w magazynie</span><strong>{stockItems.length}</strong><small>5 stref przechowywania</small><AddDemoButton label="Dodaj nowy produkt" onClick={() => setFeature('Dodawanie produktów magazynowych')} /></div>
      <div className="demo-kpi"><span>Wartość stanu rzeczywistego</span><strong>{allValid ? money(total('stockValue')) : '—'}</strong><small>Ilość × cena jednostkowa netto</small></div>
      <div className="demo-kpi demo-kpi-waste"><span>Odpady + braki do wyjaśnienia</span><strong>{allValid ? money(total('totalLoss')) : '—'}</strong><small>Odpady: {money(total('recordedWasteCost'))}<br />Braki: {allValid ? money(total('shortageCost')) : '—'}</small></div>
      <div className="demo-kpi"><span>Poniżej minimum</span><strong>{allValid ? rows.filter(r => Number(counts[r.item.id]) < r.item.minimum).length : '—'}</strong><small>Nadwyżki: {allValid ? money(total('surplusValue')) : '—'}<br />Nie pomniejszają wykazanych strat.</small></div>
    </section>
    <div className="demo-stock-note"><strong>Jak czytać ten widok?</strong> Stan oczekiwany = stan początkowy + dostawy − zużycie w kuchni − zarejestrowane odpady. Brak to różnica poniżej oczekiwanego stanu, wymagająca wyjaśnienia. Koszt odpadów i braków liczymy oddzielnie, aby nie naliczyć straty dwa razy. Podsumowania zawsze obejmują cały magazyn.</div>
    <div className="demo-toolbar"><div className="demo-chips" aria-label="Strefa magazynu">{['Wszystkie','Chłodnia','Warzywniak','Suche','Zamrażarka','Bar'].map(z => <button key={z} aria-pressed={zone === z} onClick={() => setZone(z)}>{z}</button>)}</div><input className="demo-input" aria-label="Szukaj produktu magazynowego" placeholder="Szukaj produktu lub receptury…" value={query} onChange={e => setQuery(e.target.value)} /></div>
    <div className="demo-section-head"><div><h2>Stan produktów <span className="demo-badge">{filtered.length} / {stockItems.length}</span></h2><p>Edytuj pola „Stan rzeczywisty”. Wyniki aktualizują się na bieżąco.</p></div><label className="demo-muted" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={onlyIssues} onChange={e => setOnlyIssues(e.target.checked)} /> Tylko różnice i niski stan</label></div>
    <section id="inventory-items" className="demo-grid-cards" aria-label="Produkty magazynowe">{filtered.map(row => { const i = row.item; const isValid = valid(i.id); const low = Number(counts[i.id]) < i.minimum; return <article className="demo-card demo-stock-card" key={i.id}>
      <div className="demo-stock-heading"><div><p className="demo-eyebrow" style={{ fontSize: 10, marginBottom: 6 }}>{i.zone}</p><h2>{i.name}</h2></div><span className={`demo-stock-badge ${!isValid || row.shortage > 0 ? 'danger' : low ? 'warning' : ''}`}>{!isValid ? 'Uzupełnij stan' : row.shortage > 0 ? 'Brak' : low ? 'Niski stan' : row.surplus > 0 ? 'Nadwyżka' : 'Zgodny stan'}</span></div>
      <p className="demo-muted" style={{ marginTop: 9 }}>{money(i.unitPrice)} / {i.unit} netto · min. {number(i.minimum)} {i.unit}</p>
      <div className="demo-stock-equation"><span>{number(i.opening)} + {number(i.delivered)} − {number(i.used)} − {number(i.waste)} {i.unit}</span><br /><strong>Oczekiwane: {number(row.expected)} {i.unit}</strong></div>
      <label className="demo-stock-count">Stan rzeczywisty ({i.unit})<input className="demo-input" aria-label={`Stan rzeczywisty: ${i.name}`} aria-invalid={!isValid} type="number" min="0" max="100000" step={i.unit === 'szt' ? '1' : '0.01'} value={counts[i.id]} onChange={e => setCounts({ ...counts, [i.id]: e.target.value })} /></label>
      {!isValid && <p className="demo-error">Wpisz poprawną ilość {i.unit === 'szt' ? 'w pełnych sztukach' : 'od 0 do 100 000'}.</p>}
      <div className="demo-stock-loss"><div><small>Odpady: {number(i.waste)} {i.unit}</small><strong>{money(row.recordedWasteCost)}</strong></div><div><small>Brak: {isValid ? number(row.shortage) : '—'} {i.unit}</small><strong>{isValid ? money(row.shortageCost) : '—'}</strong></div></div>
      <p className="demo-muted" style={{ marginTop: 12 }}>Łączny koszt strat: <strong>{isValid ? money(row.totalLoss) : '—'}</strong>{isValid && row.surplus > 0 && <><br />Nadwyżka: {number(row.surplus)} {i.unit} ({money(row.surplusValue)}) — sprawdź dostawy.</>}</p>
      <details><summary>Ruchy, termin i źródło odpadu</summary><p>Stan początkowy 07.09: {number(i.opening)} {i.unit}<br />Przyjęte dostawy: {number(i.delivered)} {i.unit}<br />Zużycie w kuchni: {number(i.used)} {i.unit}<br />Zarejestrowane odpady: {number(i.waste)} {i.unit}<br />Powód: {i.reason}<br />Najbliższy termin partii: {i.expires}<br />Receptury: {i.recipe}</p></details>
    </article>; })}{filtered.length === 0 && <p className="demo-empty" role="status">Brak produktów dla tych filtrów. Zmień wyszukiwanie lub strefę.</p>}</section>
    <section className="demo-card" style={{ marginTop: 26 }} aria-labelledby="waste-title"><div className="demo-section-head"><div><p className="demo-eyebrow">Warto zacząć tutaj</p><h2 id="waste-title">Co generuje największe straty?</h2><p>Cały magazyn · odpady i braki do wyjaśnienia · 07–13.09.2026</p></div><button className="demo-button demo-button-secondary" onClick={() => setFeature('Rejestrowanie odpadów')}><Trash2 size={17} /> Zarejestruj odpad</button></div>{allValid ? [...rows].sort((a,b) => b.totalLoss - a.totalLoss).slice(0,3).map(row => <div key={row.item.id} style={{ marginTop: 18 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, marginBottom: 7 }}><span><ArrowDownRight size={15} className="inline" /> {row.item.name}</span><strong>{money(row.totalLoss)}</strong></div><div style={{ background: '#f3ece0', borderRadius: 6, height: 8 }}><div style={{ height: 8, borderRadius: 6, background: '#b7784b', width: `${total('totalLoss') ? row.totalLoss / total('totalLoss') * 100 : 0}%` }} /></div></div>) : <p className="demo-muted">Popraw stany produktów, aby zobaczyć ranking.</p>}<p className="demo-muted" style={{ marginTop: 20 }}>Zacznij od sprawdzenia partii produktów i porcji w recepturach. Niższy stan wymaga weryfikacji — sam w sobie nie wyjaśnia przyczyny braku.</p></section>
  </div><AddDemoButton floating label="Dodaj nowy produkt" onClick={() => setFeature('Dodawanie produktów magazynowych')} />{feature && <SubscribeDialog feature={feature} onClose={() => setFeature(null)} />}</main>;
}
