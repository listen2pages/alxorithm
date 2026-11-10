'use client';

import Image from 'next/image';
import Link from "@/i18n/navigation";
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, ChefHat, Users, Package, Plus, X, CircleHelp, LockKeyhole, Check } from 'lucide-react';

export const modules = [
  { key: 'panel', name: "Dashboard", href: '/demo/panel_demo', icon: BarChart3, description: "See what earns money for your business.", detail: "Sales, trends and your most popular dishes.", stat: "Sales under control", color: 'green' },
  { key: 'kuchnia', name: "Kitchen", href: '/demo/kuchnia_demo', icon: ChefHat, description: "Know the cost of every portion.", detail: "Recipes, ingredients and your menu's margin.", stat: "From recipe to margin", color: 'orange' },
  { key: 'personel', name: "Staff", href: '/demo/personel_demo', icon: Users, description: "Connect your schedule to team costs.", detail: "Employee cards, hours and payroll calculator.", stat: "Every shift matters", color: 'purple' },
  { key: 'magazyn', name: "Inventory", href: '/demo/magazyn_demo', icon: Package, description: "See where losses happen.", detail: "Stock, usage, waste and value in PLN.", stat: "Less waste, more control", color: 'blue' },
] as const;
export type DemoModule = 'demo' | typeof modules[number]['key'];
type Step = { title: string; text: string; target?: string; href?: string };
const tutorials: Record<DemoModule, Step[]> = {
  demo: [
    { title: "Start with results", text: "Click here to view your dashboard demo. Explore sales, trends and restaurant results.", target: 'demo-panel', href: '/demo/panel_demo' },
    { title: "Explore kitchen", text: "Click here to view the kitchen demo. Open a dish card to see ingredient costs and margin.", target: 'demo-kuchnia', href: '/demo/kuchnia_demo' },
    { title: "Meet your team", text: "Click here to view the staff demo. Open the schedule and calculate pay for a selected period.", target: 'demo-personel', href: '/demo/personel_demo' },
    { title: "Reduce inventory losses", text: "Open the inventory demo. Compare expected and actual stock and see the cost of waste.", target: 'demo-magazyn', href: '/demo/magazyn_demo' },
  ],
  panel: [
    { title: "Your results in one place", text: "Sample sales results for March 2026. Cards show revenue, tax and product sales." },
    { title: "From numbers to decisions", text: "Scroll to charts and compare products, days and sales channels. Hover for details." },
    { title: "Now check your own business", text: "Choose a subscription to work with your restaurant data. Open other modules from the navigation above." },
  ],
  kuchnia: [
    { title: "Every dish has a card", text: "Explore a sample menu: selling price, portion cost and margin. Search dishes or browse categories.", target: 'kitchen-menu' },
    { title: "Explore recipe", text: "Expand a dish recipe to see ingredients, quantities and portion preparation cost.", target: 'kitchen-menu' },
    { title: "Add your own menu", text: "“Add new item” opens subscription pricing. On mobile, it stays at the bottom of the screen." },
  ],
  personel: [
    { title: "Meet the demo team", text: "Employee cards combine roles, rates, scheduled hours and pay. All numbers relate to the same selected period.", target: 'staff-tabs' },
    { title: "Open work schedule", text: "Choose “Schedule and pay” to see shifts, staffing and weekly hours.", target: 'staff-tabs' },
    { title: "Recalculate team costs", text: "Change dates or a sample rate in the calculator. Cards and summaries update together. Adding employees and resetting require a subscription." },
  ],
  magazyn: [
    { title: "See actual loss costs", text: "This inventory contains sample data. Explore stock value, recorded waste and unexplained shortages.", target: 'inventory-summary' },
    { title: "Try stocktaking", text: "Change a product's actual stock. The demo recalculates differences and value immediately. Surpluses appear separately without hiding losses.", target: 'inventory-items' },
    { title: "Switch to your own data", text: "Unlock adding products, recording waste and saving stocktakes with a subscription. Demo changes are not saved." },
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
    <button className="demo-button demo-button-quiet" onClick={() => { setStep(0); setOpen(true); }}><CircleHelp size={16} /> {" Guide"}</button>
    <dialog ref={dialog} className={`demo-dialog demo-tour ${module === 'demo' && step >= 2 ? 'demo-tour-left' : ''}`} aria-labelledby={`tour-title-${module}`} aria-describedby={`tour-text-${module}`} onCancel={finish}>
      <div className="demo-dialog-top"><Image src="/logo.png" alt="alxorithm" width={46} height={46} /><span className="demo-eyebrow">{"Your guide · "}{step + 1}/{steps.length}</span><button autoFocus className="demo-icon-button" aria-label="Close guide" onClick={finish}><X size={20} /></button></div>
      <div aria-live="polite" aria-atomic="true"><h2 id={`tour-title-${module}`}>{steps[step].title}</h2><p id={`tour-text-${module}`}>{steps[step].text}</p></div>
      <div className="demo-step-dots" aria-hidden="true">{steps.map((s, i) => <span key={s.title} className={i <= step ? 'filled' : ''} />)}</div>
      {steps[step].href && <Link className="demo-tour-link" href={steps[step].href!} onClick={finish}>{"Open this module "}<ArrowRight size={16} /></Link>}
      <div className="demo-dialog-actions"><button className="demo-button demo-button-secondary" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> {" Back"}</button><button className="demo-button" onClick={() => step === steps.length - 1 ? finish() : setStep(step + 1)}>{step === steps.length - 1 ? "Finish" : "Next"} <ArrowRight size={16} /></button></div>
    </dialog>
  </>;
}

export function SubscribeDialog({ feature, onClose }: { feature: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog className="demo-dialog demo-subscribe" ref={dialog} aria-labelledby="subscribe-title" aria-describedby="subscribe-description" onCancel={onClose}>
    <div className="demo-dialog-top"><span className="demo-feature-icon green"><LockKeyhole size={24} /></span><span className="demo-eyebrow">{"Your business. Your data."}</span><button className="demo-icon-button" aria-label="Close offer" onClick={onClose}><X size={20} /></button></div>
    <h2 id="subscribe-title">{"Unlock: "}{feature.toLocaleLowerCase("en-GB")}</h2>
    <p id="subscribe-description">{"You are exploring the demo. Choose a management plan to use this feature in your restaurant."}</p>
    <ul className="demo-benefits"><li><Check size={17} /> {" Your data and saved changes"}</li><li><Check size={17} /> {" Dashboard, kitchen, staff and inventory"}</li><li><Check size={17} /> {" Everything in one place"}</li></ul>
    <Link autoFocus className="demo-button demo-button-wide" href="/cennik">{"See plans and subscribe "}<ArrowRight size={17} /></Link>
    <button className="demo-button demo-button-quiet demo-button-wide" onClick={onClose}>{"Back to demo"}</button>
  </dialog>;
}

export function DemoNavigation({ current }: { current: DemoModule }) {
  return <div className="demo-navigation">
    <div className="demo-navigation-top"><Link className="demo-back" href="/demo"><ArrowLeft size={16} /> {" Demo centre"}</Link><span className="demo-badge">{"Sample data"}</span><DemoTour module={current} /></div>
    <nav className="demo-module-nav" aria-label="Demo modules">{modules.map(m => <Link key={m.key} href={m.href} aria-current={current === m.key ? 'page' : undefined}><m.icon size={18} /> {m.name}</Link>)}</nav>
  </div>;
}

export function DemoHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <header className="demo-heading"><p className="demo-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{children}</p></header>;
}

export function AddDemoButton({ label, onClick, floating = false }: { label: string; onClick: () => void; floating?: boolean }) {
  return <button className={`demo-button ${floating ? 'demo-floating-add' : 'demo-add-inline'}`} onClick={onClick}><Plus size={19} /> {label}</button>;
}

export function DemoFooter() {
  return <section className="demo-conversion"><div><span className="demo-eyebrow">{"From demo to your restaurant"}</span><h2>{"Now it is time for your business."}</h2><p>{"Explore plans and start working with your own data."}</p></div><Link className="demo-button demo-button-yellow" href="/cennik">{"Choose a subscription "}<ArrowRight size={18} /></Link></section>;
}
