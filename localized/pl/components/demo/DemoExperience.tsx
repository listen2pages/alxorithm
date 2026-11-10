'use client';

import Image from 'next/image';
import Link from "@/i18n/navigation";
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, ChefHat, Users, Package, Plus, X, CircleHelp, LockKeyhole, Check } from 'lucide-react';

export const modules = [
  { key: 'panel', name: 'Panel', href: '/demo/panel_demo', icon: BarChart3, description: 'Zobacz, co zarabia na Twój biznes.', detail: 'Sprzedaż, trendy i najpopularniejsze dania.', stat: 'Sprzedaż pod kontrolą', color: 'green' },
  { key: 'kuchnia', name: 'Kuchnia', href: '/demo/kuchnia_demo', icon: ChefHat, description: 'Poznaj koszt każdej porcji.', detail: 'Receptury, składniki i marża Twojego menu.', stat: 'Od receptury do marży', color: 'orange' },
  { key: 'personel', name: 'Personel', href: '/demo/personel_demo', icon: Users, description: 'Połącz grafik z kosztami zespołu.', detail: 'Karty pracowników, godziny i kalkulator płac.', stat: 'Każda zmiana ma znaczenie', color: 'purple' },
  { key: 'magazyn', name: 'Magazyn', href: '/demo/magazyn_demo', icon: Package, description: 'Sprawdź, gdzie powstają straty.', detail: 'Stany, zużycie, odpady i ich wartość w zł.', stat: 'Mniej odpadów, więcej kontroli', color: 'blue' },
] as const;
export type DemoModule = 'demo' | typeof modules[number]['key'];
type Step = { title: string; text: string; target?: string; href?: string };
const tutorials: Record<DemoModule, Step[]> = {
  demo: [
    { title: 'Zacznij od wyników', text: 'Kliknij tutaj, aby zobaczyć demo swojego panelu. Sprawdź sprzedaż, trendy i wyniki restauracji.', target: 'demo-panel', href: '/demo/panel_demo' },
    { title: 'Zajrzyj do kuchni', text: 'Kliknij tutaj, aby zobaczyć demo swojej kuchni. Otwórz kartę dania i poznaj koszt składników oraz marżę.', target: 'demo-kuchnia', href: '/demo/kuchnia_demo' },
    { title: 'Poznaj swój zespół', text: 'Kliknij tutaj, aby zobaczyć demo swojego personelu. Przejdź do grafiku i oblicz wynagrodzenia za wybrany okres.', target: 'demo-personel', href: '/demo/personel_demo' },
    { title: 'Ogranicz straty w magazynie', text: 'Otwórz demo magazynu. Porównaj stan oczekiwany z rzeczywistym i zobacz, ile kosztują odpady.', target: 'demo-magazyn', href: '/demo/magazyn_demo' },
  ],
  panel: [
    { title: 'Twoje wyniki w jednym miejscu', text: "To przykładowe wyniki sprzedaży za marzec 2026. Karty pokazują przychód, podatek i sprzedaż produktów." },
    { title: 'Od liczb do decyzji', text: 'Przewiń do wykresów i porównaj produkty, dni oraz kanały sprzedaży. Najedź na wykres, aby zobaczyć szczegóły.' },
    { title: 'Teraz sprawdź swój lokal', text: 'Wybierz subskrypcję, aby pracować na danych swojej restauracji. Pozostałe moduły otworzysz z nawigacji nad panelem.' },
  ],
  kuchnia: [
    { title: 'Każde danie ma swoją kartę', text: 'Tutaj zobaczysz przykładowe menu: cenę sprzedaży, koszt porcji i marżę. Wyszukaj danie lub przeglądaj kategorie.', target: 'kitchen-menu' },
    { title: 'Zajrzyj do receptury', text: 'Rozwiń recepturę na karcie dania, aby poznać składniki, ilości i koszt przygotowania porcji.', target: 'kitchen-menu' },
    { title: 'Dodaj własne menu', text: 'Przycisk „Dodaj nową pozycję” prowadzi do oferty subskrypcji. Na telefonie znajdziesz go zawsze u dołu ekranu.' },
  ],
  personel: [
    { title: 'Poznaj zespół demo', text: 'Karty pracowników łączą rolę, stawkę, zaplanowane godziny i wynagrodzenie. Wszystkie liczby dotyczą tego samego wybranego okresu.', target: 'staff-tabs' },
    { title: 'Otwórz grafik pracy', text: 'Wybierz zakładkę „Grafik pracy i wynagrodzenia”. Zobaczysz zmiany, obsadę i tygodniowe zestawienie godzin.', target: 'staff-tabs' },
    { title: 'Przelicz koszty zespołu', text: 'Zmień daty lub przykładową stawkę w kalkulatorze. Karty i podsumowania przeliczą się razem. Dodawanie pracowników i reset wymagają subskrypcji.' },
  ],
  magazyn: [
    { title: 'Zobacz rzeczywisty koszt strat', text: 'Ten magazyn zawiera przykładowe dane. Poznaj wartość zapasu, zarejestrowanych odpadów i niewyjaśnionych braków.', target: 'inventory-summary' },
    { title: 'Przetestuj inwentaryzację', text: 'Zmień stan rzeczywisty produktu. Demo natychmiast przeliczy różnicę i jej wartość. Nadwyżki są pokazywane osobno, bez ukrywania strat.', target: 'inventory-items' },
    { title: 'Przejdź na własne dane', text: 'Dodawanie produktów, rejestrowanie odpadów i zapisywanie inwentaryzacji odblokujesz w subskrypcji. Zmiany w demo nie są zapisywane.' },
  ],
};

export function DemoTour({ module }: { module: DemoModule }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const steps = tutorials[module];
  const key = `jw:demo-tour:v1:${module}`;
  const finish = () => {
    try { localStorage.setItem(key, 'seen'); } catch { /* Tutorial still works without browser storage. */ }
    dialog.current?.close();
    setOpen(false);
  };
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try { if (localStorage.getItem(key)) return; } catch { /* Storage may be disabled. */ }
      setOpen(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [key]);
  useEffect(() => {
    if (!open) return;
    const element = steps[step].target ? document.getElementById(steps[step].target!) : null;
    element?.setAttribute('data-demo-highlight', 'true');
    element?.scrollIntoView({ behavior: 'instant', block: 'start' });
    if (!dialog.current?.open) dialog.current?.showModal();
    return () => element?.removeAttribute('data-demo-highlight');
  }, [open, step, steps]);
  return <>
    <button className="demo-button demo-button-quiet" onClick={() => { setStep(0); setOpen(true); }}><CircleHelp size={16} /> {" Przewodnik"}</button>
    <dialog ref={dialog} className={`demo-dialog demo-tour ${module === 'demo' && step >= 2 ? 'demo-tour-left' : ''}`} aria-labelledby={`tour-title-${module}`} aria-describedby={`tour-text-${module}`} onCancel={finish}>
      <div className="demo-dialog-top"><Image src="/logo.png" alt="alxorithm" width={46} height={46} /><span className="demo-eyebrow">{"Twój przewodnik · "}{step + 1}/{steps.length}</span><button autoFocus className="demo-icon-button" aria-label="Zamknij przewodnik" onClick={finish}><X size={20} /></button></div>
      <div aria-live="polite" aria-atomic="true"><h2 id={`tour-title-${module}`}>{steps[step].title}</h2><p id={`tour-text-${module}`}>{steps[step].text}</p></div>
      <div className="demo-step-dots" aria-hidden="true">{steps.map((s, i) => <span key={s.title} className={i <= step ? 'filled' : ''} />)}</div>
      {steps[step].href && <Link className="demo-tour-link" href={steps[step].href!} onClick={finish}>{"Otwórz ten moduł "}<ArrowRight size={16} /></Link>}
      <div className="demo-dialog-actions"><button className="demo-button demo-button-secondary" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> {" Wstecz"}</button><button className="demo-button" onClick={() => step === steps.length - 1 ? finish() : setStep(step + 1)}>{step === steps.length - 1 ? 'Zakończ' : 'Dalej'} <ArrowRight size={16} /></button></div>
    </dialog>
  </>;
}

export function SubscribeDialog({ feature, onClose }: { feature: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog className="demo-dialog demo-subscribe" ref={dialog} aria-labelledby="subscribe-title" aria-describedby="subscribe-description" onCancel={onClose}>
    <div className="demo-dialog-top"><span className="demo-feature-icon green"><LockKeyhole size={24} /></span><span className="demo-eyebrow">{"Twój lokal. Twoje dane."}</span><button className="demo-icon-button" aria-label="Zamknij ofertę" onClick={onClose}><X size={20} /></button></div>
    <h2 id="subscribe-title">{"Odblokuj: "}{feature.toLocaleLowerCase('pl-PL')}</h2>
    <p id="subscribe-description">{"Poznajesz teraz wersję demonstracyjną. Wybierz plan z zarządzaniem, aby korzystać z tej funkcji we własnej restauracji."}</p>
    <ul className="demo-benefits"><li><Check size={17} /> {" Własne dane i zapis zmian"}</li><li><Check size={17} /> {" Panel, kuchnia, personel i magazyn"}</li><li><Check size={17} /> {" Wszystko w jednym miejscu"}</li></ul>
    <Link autoFocus className="demo-button demo-button-wide" href="/cennik">{"Zobacz plany i subskrybuj "}<ArrowRight size={17} /></Link>
    <button className="demo-button demo-button-quiet demo-button-wide" onClick={onClose}>{"Wróć do demo"}</button>
  </dialog>;
}

export function DemoNavigation({ current }: { current: DemoModule }) {
  return <div className="demo-navigation">
    <div className="demo-navigation-top"><Link className="demo-back" href="/demo"><ArrowLeft size={16} /> {" Centrum demo"}</Link><span className="demo-badge">{"Dane przykładowe"}</span><DemoTour module={current} /></div>
    <nav className="demo-module-nav" aria-label="Moduły demonstracyjne">{modules.map(m => <Link key={m.key} href={m.href} aria-current={current === m.key ? 'page' : undefined}><m.icon size={18} /> {m.name}</Link>)}</nav>
  </div>;
}

export function DemoHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <header className="demo-heading"><p className="demo-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{children}</p></header>;
}

export function AddDemoButton({ label, onClick, floating = false }: { label: string; onClick: () => void; floating?: boolean }) {
  return <button className={`demo-button ${floating ? 'demo-floating-add' : 'demo-add-inline'}`} onClick={onClick}><Plus size={19} /> {label}</button>;
}

export function DemoFooter() {
  return <section className="demo-conversion"><div><span className="demo-eyebrow">{"Z demo do Twojej restauracji"}</span><h2>{"Teraz czas na Twój biznes."}</h2><p>{"Poznaj plany i zacznij pracować na własnych danych."}</p></div><Link className="demo-button demo-button-yellow" href="/cennik">{"Wybierz subskrypcję "}<ArrowRight size={18} /></Link></section>;
}
