'use client';

import Image from 'next/image';
import Link from "@/i18n/navigation";
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, ChefHat, Users, Package, Plus, X, CircleHelp, LockKeyhole, Check } from 'lucide-react';

export const modules = [
  { key: 'panel', name: "Панель", href: '/demo/panel_demo', icon: BarChart3, description: "Узнайте, что приносит прибыль вашему бизнесу.", detail: "Продажи, тенденции и самые популярные блюда.", stat: "Продажи под контролем", color: 'green' },
  { key: 'kuchnia', name: "Кухня", href: '/demo/kuchnia_demo', icon: ChefHat, description: "Узнайте себестоимость каждой порции.", detail: "Рецептуры, ингредиенты и маржа меню.", stat: "От рецептуры к марже", color: 'orange' },
  { key: 'personel', name: "Персонал", href: '/demo/personel_demo', icon: Users, description: "Свяжите график с расходами на команду.", detail: "Карточки сотрудников, часы и калькулятор зарплаты.", stat: "Каждая смена важна", color: 'purple' },
  { key: 'magazyn', name: "Склад", href: '/demo/magazyn_demo', icon: Package, description: "Узнайте, где возникают потери.", detail: "Остатки, расход, отходы и стоимость в PLN.", stat: "Меньше отходов, больше контроля", color: 'blue' },
] as const;
export type DemoModule = 'demo' | typeof modules[number]['key'];
type Step = { title: string; text: string; target?: string; href?: string };
const tutorials: Record<DemoModule, Step[]> = {
  demo: [
    { title: "Начните с результатов", text: "Нажмите для демо панели. Изучите продажи, тенденции и результаты ресторана.", target: 'demo-panel', href: '/demo/panel_demo' },
    { title: "Посмотреть кухню", text: "Нажмите для демо кухни. Откройте карточку блюда для стоимости ингредиентов и маржи.", target: 'demo-kuchnia', href: '/demo/kuchnia_demo' },
    { title: "Познакомьтесь с командой", text: "Нажмите для демо персонала. Откройте график и рассчитайте зарплаты за период.", target: 'demo-personel', href: '/demo/personel_demo' },
    { title: "Сократите потери склада", text: "Откройте демо склада. Сравните ожидаемые и фактические остатки и стоимость отходов.", target: 'demo-magazyn', href: '/demo/magazyn_demo' },
  ],
  panel: [
    { title: "Ваши результаты в одном месте", text: "Пример продаж за март 2026. Карточки показывают выручку, НДС и продажи товаров." },
    { title: "От цифр к решениям", text: "Прокрутите к графикам и сравните товары, дни и каналы продаж. Наведите для подробностей." },
    { title: "Теперь проверьте своё заведение", text: "Выберите подписку для работы с данными ресторана. Другие модули доступны в навигации сверху." },
  ],
  kuchnia: [
    { title: "У каждого блюда есть карточка", text: "Пример меню: цена продажи, себестоимость порции и маржа. Ищите блюда или смотрите категории.", target: 'kitchen-menu' },
    { title: "Посмотреть рецептуру", text: "Разверните рецептуру блюда для ингредиентов, количеств и стоимости порции.", target: 'kitchen-menu' },
    { title: "Добавьте своё меню", text: "«Добавить позицию» открывает тариф подписки. На телефоне кнопка всегда внизу экрана." },
  ],
  personel: [
    { title: "Познакомьтесь с демо-командой", text: "Карточки объединяют роль, ставку, часы и зарплату. Все цифры относятся к выбранному периоду.", target: 'staff-tabs' },
    { title: "Открыть рабочий график", text: "Выберите «График и зарплаты» для смен, состава и недельных часов.", target: 'staff-tabs' },
    { title: "Пересчитайте расходы команды", text: "Измените даты или ставку в калькуляторе. Карточки и сводки обновятся вместе. Добавление сотрудников и сброс требуют подписки." },
  ],
  magazyn: [
    { title: "Посмотреть стоимость потерь", text: "Склад содержит пример данных. Изучите стоимость остатков, отходов и невыясненных недостач.", target: 'inventory-summary' },
    { title: "Попробуйте инвентаризацию", text: "Измените фактический остаток товара. Демо сразу пересчитает разницу и стоимость. Излишки показаны отдельно, не скрывая потери.", target: 'inventory-items' },
    { title: "Перейдите к своим данным", text: "Подписка открывает добавление товаров, запись отходов и сохранение инвентаризации. Изменения демо не сохраняются." },
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
    <button className="demo-button demo-button-quiet" onClick={() => { setStep(0); setOpen(true); }}><CircleHelp size={16} /> {" Путеводитель"}</button>
    <dialog ref={dialog} className={`demo-dialog demo-tour ${module === 'demo' && step >= 2 ? 'demo-tour-left' : ''}`} aria-labelledby={`tour-title-${module}`} aria-describedby={`tour-text-${module}`} onCancel={finish}>
      <div className="demo-dialog-top"><Image src="/logo.png" alt="alxorithm" width={46} height={46} /><span className="demo-eyebrow">{"Ваш гид · "}{step + 1}/{steps.length}</span><button autoFocus className="demo-icon-button" aria-label="Закрыть гид" onClick={finish}><X size={20} /></button></div>
      <div aria-live="polite" aria-atomic="true"><h2 id={`tour-title-${module}`}>{steps[step].title}</h2><p id={`tour-text-${module}`}>{steps[step].text}</p></div>
      <div className="demo-step-dots" aria-hidden="true">{steps.map((s, i) => <span key={s.title} className={i <= step ? 'filled' : ''} />)}</div>
      {steps[step].href && <Link className="demo-tour-link" href={steps[step].href!} onClick={finish}>{"Открыть модуль "}<ArrowRight size={16} /></Link>}
      <div className="demo-dialog-actions"><button className="demo-button demo-button-secondary" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> {" Назад"}</button><button className="demo-button" onClick={() => step === steps.length - 1 ? finish() : setStep(step + 1)}>{step === steps.length - 1 ? "Завершить" : "Далее"} <ArrowRight size={16} /></button></div>
    </dialog>
  </>;
}

export function SubscribeDialog({ feature, onClose }: { feature: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog className="demo-dialog demo-subscribe" ref={dialog} aria-labelledby="subscribe-title" aria-describedby="subscribe-description" onCancel={onClose}>
    <div className="demo-dialog-top"><span className="demo-feature-icon green"><LockKeyhole size={24} /></span><span className="demo-eyebrow">{"Ваше заведение. Ваши данные."}</span><button className="demo-icon-button" aria-label="Закрыть предложение" onClick={onClose}><X size={20} /></button></div>
    <h2 id="subscribe-title">{"Откройте: "}{feature.toLocaleLowerCase("ru-RU")}</h2>
    <p id="subscribe-description">{"Вы изучаете демо. Выберите тариф управления для использования функции в своём ресторане."}</p>
    <ul className="demo-benefits"><li><Check size={17} /> {" Ваши данные и сохранение изменений"}</li><li><Check size={17} /> {" Панель, кухня, персонал и склад"}</li><li><Check size={17} /> {" Всё в одном месте"}</li></ul>
    <Link autoFocus className="demo-button demo-button-wide" href="/cennik">{"Посмотреть тарифы и подписаться "}<ArrowRight size={17} /></Link>
    <button className="demo-button demo-button-quiet demo-button-wide" onClick={onClose}>{"Вернуться к демо"}</button>
  </dialog>;
}

export function DemoNavigation({ current }: { current: DemoModule }) {
  return <div className="demo-navigation">
    <div className="demo-navigation-top"><Link className="demo-back" href="/demo"><ArrowLeft size={16} /> {" Центр демо"}</Link><span className="demo-badge">{"Пример данных"}</span><DemoTour module={current} /></div>
    <nav className="demo-module-nav" aria-label="Демонстрационные модули">{modules.map(m => <Link key={m.key} href={m.href} aria-current={current === m.key ? 'page' : undefined}><m.icon size={18} /> {m.name}</Link>)}</nav>
  </div>;
}

export function DemoHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <header className="demo-heading"><p className="demo-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{children}</p></header>;
}

export function AddDemoButton({ label, onClick, floating = false }: { label: string; onClick: () => void; floating?: boolean }) {
  return <button className={`demo-button ${floating ? 'demo-floating-add' : 'demo-add-inline'}`} onClick={onClick}><Plus size={19} /> {label}</button>;
}

export function DemoFooter() {
  return <section className="demo-conversion"><div><span className="demo-eyebrow">{"От демо к вашему ресторану"}</span><h2>{"Теперь очередь вашего бизнеса."}</h2><p>{"Посмотрите тарифы и начните работать со своими данными."}</p></div><Link className="demo-button demo-button-yellow" href="/cennik">{"Выбрать подписку "}<ArrowRight size={18} /></Link></section>;
}
