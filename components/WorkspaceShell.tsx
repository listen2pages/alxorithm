'use client';

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import Link, { useLocale, usePathname } from '@/i18n/navigation';
import { localizedPath } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import {
  ArrowUpRight,
  BarChart3,
  ChefHat,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Users,
  X,
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import RegionalSettings from './RegionalSettings';
import WorkspaceMonthSelector from './WorkspaceMonthSelector';
import { WorkspacePeriodProvider, useWorkspacePeriod } from '@/i18n/WorkspacePeriod';

const words = {
  en: {
    workspace: 'Your workspace',
    overview: 'Overview',
    panel: 'POS analytics',
    kitchen: 'Kitchen & recipes',
    inventory: 'Inventory',
    staff: 'Team & schedule',
    search: 'Jump to a module…',
    quick: 'Quick switcher',
    empty: 'No matching modules.',
    hint: 'Type to filter · Tab to select · Enter to open',
    close: 'Close',
    skip: 'Skip to content',
    private: 'Private workspace',
    note: 'A little clarity. A better day.',
    open: 'Open',
    billing: 'Subscription & billing',
    signOut: 'Sign out',
    loading: 'Loading workspace…',
  },
  pl: {
    workspace: 'Twoja przestrzeń',
    overview: 'Przegląd',
    panel: 'Analityka POS',
    kitchen: 'Kuchnia i receptury',
    inventory: 'Magazyn',
    staff: 'Zespół i grafik',
    search: 'Przejdź do modułu…',
    quick: 'Szybkie przejście',
    empty: 'Brak pasujących modułów.',
    hint: 'Wpisz, aby filtrować · Tab, aby wybrać · Enter, aby otworzyć',
    close: 'Zamknij',
    skip: 'Przejdź do treści',
    private: 'Prywatna przestrzeń',
    note: 'Więcej przejrzystości. Lepszy dzień.',
    open: 'Otwórz',
    billing: 'Subskrypcja i płatności',
    signOut: 'Wyloguj się',
    loading: 'Ładowanie przestrzeni roboczej…',
  },
  ru: {
    workspace: 'Ваше рабочее пространство',
    overview: 'Обзор',
    panel: 'Аналитика POS',
    kitchen: 'Кухня и рецептуры',
    inventory: 'Склад',
    staff: 'Команда и график',
    search: 'Перейти к модулю…',
    quick: 'Быстрый переход',
    empty: 'Подходящих модулей нет.',
    hint: 'Введите запрос · Tab — выбор · Enter — переход',
    close: 'Закрыть',
    skip: 'Перейти к содержимому',
    private: 'Личное пространство',
    note: 'Больше ясности. Лучше каждый день.',
    open: 'Открыть',
    billing: 'Подписка и оплата',
    signOut: 'Выйти',
    loading: 'Загрузка рабочего пространства…',
  },
};

const subscribePlatform = () => () => {};
const readShortcut = () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl');
const serverShortcut = () => 'Ctrl';
const sidebarKey = 'alxorithm-sidebar-hidden';

const subscribeSidebar = (listener: () => void) => {
  window.addEventListener('storage', listener);
  window.addEventListener('workspace-sidebar-change', listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener('workspace-sidebar-change', listener);
  };
};

const readSidebar = () => {
  try {
    return localStorage.getItem(sidebarKey) === 'true';
  } catch {
    return false;
  }
};

const sidebarLabels = {
  en: { hide: 'Hide sidebar', show: 'Show sidebar' },
  pl: { hide: 'Ukryj panel boczny', show: 'Pokaż panel boczny' },
  ru: { hide: 'Скрыть боковую панель', show: 'Показать боковую панель' },
};

export default function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <WorkspacePeriodProvider>
        <WorkspaceFrame>{children}</WorkspaceFrame>
      </WorkspacePeriodProvider>
    </Suspense>
  );
}

function WorkspaceFrame({ children }: { children: ReactNode }) {
  const { ready } = useWorkspacePeriod();
  const locale = useLocale();
  const pathname = usePathname();
  const w = words[locale];
  const [query, setQuery] = useState('');
  const storedHidden = useSyncExternalStore(subscribeSidebar, readSidebar, () => false);
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null);
  const sidebarHidden = sidebarOverride ?? storedHidden;

  function toggleSidebar() {
    const next = !sidebarHidden;
    setSidebarOverride(next);
    try {
      localStorage.setItem(sidebarKey, String(next));
      window.dispatchEvent(new Event('workspace-sidebar-change'));
    } catch {
      /* Keep the control usable when storage is unavailable. */
    }
  }

  async function handleSignOut() {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } finally {
      window.location.href = localizedPath('/', locale);
    }
  }

  const shortcut = useSyncExternalStore(subscribePlatform, readShortcut, serverShortcut);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const links = [
    { href: '/home', label: w.overview, icon: LayoutDashboard },
    { href: '/home/panel', label: w.panel, icon: BarChart3 },
    { href: '/home/kuchnia', label: w.kitchen, icon: ChefHat },
    { href: '/home/magazyn', label: w.inventory, icon: Package },
    { href: '/home/personel', label: w.staff, icon: Users },
  ];

  const active =
    links.slice(1).find(l => l.href === pathname || pathname.startsWith(l.href + '/')) || links[0];
  const filtered = links.filter(l =>
    l.label.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)),
  );

  function open() {
    setQuery('');
    if (!dialog.current?.open) dialog.current?.showModal();
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (dialog.current?.open) {
          dialog.current.close();
        } else {
          setQuery('');
          dialog.current?.showModal();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <div className={'workspace-app' + (sidebarHidden ? ' workspace-sidebar-hidden' : '')}>
      <a className="workspace-skip" href="#workspace-content">
        {w.skip}
      </a>
      <aside id="workspace-sidebar" className="workspace-sidebar">
        <Link href="/home" className="workspace-brand" aria-label="alxorithm">
          <span className="workspace-brand-mark">
            a<span>.</span>
          </span>
          <span>
            alxorithm<small>{w.workspace}</small>
          </span>
        </Link>
        <WorkspaceMonthSelector />
        <div className="workspace-nav-label">{w.workspace}</div>
        <nav className="workspace-nav" aria-label={w.workspace}>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active.href === href ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {active.href === href && <span className="workspace-active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="workspace-sidebar-footer">
          <span className="workspace-status-dot" />
          {w.private}
          <p>{w.note}</p>
          <div className="workspace-account-links">
            <a href="/api/stripe/portal" className="workspace-account-link">
              <CreditCard size={14} />
              <span>{w.billing}</span>
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="workspace-account-link workspace-signout-btn"
            >
              <LogOut size={14} />
              <span>{w.signOut}</span>
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="workspace-topbar-leading">
            <button
              type="button"
              className="workspace-sidebar-toggle"
              onClick={toggleSidebar}
              aria-controls="workspace-sidebar"
              aria-expanded={!sidebarHidden}
              aria-label={sidebarHidden ? sidebarLabels[locale].show : sidebarLabels[locale].hide}
              title={sidebarHidden ? sidebarLabels[locale].show : sidebarLabels[locale].hide}
            >
              {sidebarHidden ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <div className="workspace-breadcrumb">
              <span>alxorithm</span>
              <span aria-hidden="true">/</span>
              <strong>{active.label}</strong>
            </div>
          </div>
          <div className="workspace-topbar-actions">
            <button
              ref={trigger}
              className="workspace-search-trigger"
              type="button"
              onClick={open}
              aria-label={w.quick}
              aria-haspopup="dialog"
            >
              <Search size={16} />
              <span>{w.search}</span>
              <kbd>{shortcut} K</kbd>
            </button>
            <LanguageSelector />
            <RegionalSettings />
            <a
              href="/api/stripe/portal"
              className="workspace-topbar-icon-btn"
              aria-label={w.billing}
              title={w.billing}
            >
              <CreditCard size={15} />
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="workspace-topbar-icon-btn workspace-topbar-signout"
              aria-label={w.signOut}
              title={w.signOut}
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>
        <div className="workspace-mobile-period">
          <WorkspaceMonthSelector mobile />
        </div>
        <div id="workspace-content" className="workspace-content" tabIndex={-1}>
          {ready ? (
            children
          ) : (
            <div className="workspace-loading-shell" role="status" aria-live="polite">
              <span>{w.loading}</span>
            </div>
          )}
        </div>
      </div>
      <dialog
        ref={dialog}
        className="workspace-command"
        aria-labelledby="workspace-command-title"
        onClick={event => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onClose={() => trigger.current?.focus()}
      >
        <div className="workspace-command-head">
          <Search size={20} />
          <label className="sr-only" id="workspace-command-title" htmlFor="workspace-command-search">
            {w.quick}
          </label>
          <input
            id="workspace-command-search"
            autoFocus
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={w.search}
            onKeyDown={event => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                dialog.current?.querySelector<HTMLAnchorElement>('nav a')?.focus();
              }
            }}
          />
          <button type="button" aria-label={w.close} onClick={() => dialog.current?.close()}>
            <X size={18} />
          </button>
        </div>
        <nav aria-label={w.quick}>
          {filtered.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => dialog.current?.close()}>
              <Icon size={20} />
              <span>{label}</span>
              <ArrowUpRight size={16} />
            </Link>
          ))}
          {!filtered.length && <p>{w.empty}</p>}
        </nav>
        <footer>{w.hint}</footer>
      </dialog>
    </div>
  );
}
