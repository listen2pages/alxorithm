'use client';
import {useRegionalSettings} from '@/i18n/useRegionalSettings';
import {formatMoney,getCurrency} from '@/utils/global-settings';


import { AddDemoButton, DemoFooter, DemoHeading, DemoNavigation, SubscribeDialog } from "@/localized/ru/components/demo/DemoExperience";
import { useState } from 'react';
import { ArrowLeft, ChefHat, Clock, DollarSign, ChevronDown, ChevronUp, Info, Utensils, Wine, Search, LayoutGrid, List, TrendingUp, Percent } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────
type Ingredient = {
  nazwa: string;
  ilosc: string;
  jednostka: string;
  cenaSkładnika: number; // cost for this amount used
  notatka?: string;      // e.g. "900g package = 2.50 PLN"
};

type MenuItem = {
  id: number;
  nazwa: string;
  kategoria: "Закуски" | "Основные блюда" | "Напитки" | "Алкоголь";
  cena: number;
  vat: number;
  prepTime: number;
  status: "Активное" | "Сезонное";
  diet?: string;
  alergeny?: string[];
  opis: string;
  skladniki: Ingredient[];
};

// ─── Full Menu Data ───────────────────────────────────────────────────
const menuItems: MenuItem[] = [
  {
    id: 1001,
    nazwa: "Аранчини с моцареллой и айоли с каламанси",
    kategoria: "Закуски",
    cena: 24.00,
    vat: 8,
    prepTime: 18,
    status: "Активное",
    diet: "Вегетарианское",
    alergeny: ["Глютен", "Молочные продукты", "Яйца"],
    opis: "Хрустящие сицилийские рисовые шарики с моцареллой и домашним айоли с каламанси.",
    skladniki: [
      { nazwa: "Рис арборио", ilosc: '150', jednostka: 'g', cenaSkładnika: 2.25, notatka: "1kg = 15,00 " },
      { nazwa: "Моцарелла", ilosc: '80', jednostka: 'g', cenaSkładnika: 3.20, notatka: "125g = 5,00 " },
      { nazwa: "Пармезан", ilosc: '20', jednostka: 'g', cenaSkładnika: 2.40, notatka: "100g = 12,00 " },
      { nazwa: "Яйца", ilosc: '2', jednostka: 'szt', cenaSkładnika: 2.40, notatka: "10 szt = 12,00 " },
      { nazwa: "Панировочные сухари", ilosc: '60', jednostka: 'g', cenaSkładnika: 0.48, notatka: "500g = 4,00 " },
      { nazwa: 'Calamansi / limonka', ilosc: '30', jednostka: 'ml', cenaSkładnika: 2.00, notatka: "1 szt ≈ 2,00 " },
      { nazwa: "Майонез", ilosc: '40', jednostka: 'g', cenaSkładnika: 0.80, notatka: "400g = 8,00 " },
      { nazwa: "Чеснок", ilosc: '5', jednostka: 'g', cenaSkładnika: 0.30, notatka: "Головка 50 г = 3,00 " },
      { nazwa: "Масло для жарки", ilosc: '200', jednostka: 'ml', cenaSkładnika: 1.80, notatka: "1L = 9,00 " },
      { nazwa: "Соль", ilosc: '3', jednostka: 'g', cenaSkładnika: 0.01, notatka: "1kg = 2,50 " },
      { nazwa: "Чёрный перец", ilosc: '1', jednostka: 'g', cenaSkładnika: 0.20, notatka: "20g = 4,00 " },
    ],
  },
  {
    id: 1002,
    nazwa: "Сэндвич Энтони Бурдена с эмменталем",
    kategoria: "Основные блюда",
    cena: 38.00,
    vat: 8,
    prepTime: 22,
    status: "Активное",
    diet: "Мясное",
    alergeny: ["Глютен", "Молочные продукты", "Горчица"],
    opis: "Сэндвич на хлебе с закваской с ростбифом, эмменталем и карамелизированным луком.",
    skladniki: [
      { nazwa: "Хлеб на закваске", ilosc: '120', jednostka: 'g', cenaSkładnika: 3.20, notatka: "300g bochenek = 8,00 " },
      { nazwa: "Эмменталь", ilosc: '60', jednostka: 'g', cenaSkładnika: 3.60, notatka: "100g = 6,00 " },
      { nazwa: "Ростбиф", ilosc: '120', jednostka: 'g', cenaSkładnika: 9.60, notatka: "1kg = 80,00 " },
      { nazwa: "Руккола", ilosc: '20', jednostka: 'g', cenaSkładnika: 1.00, notatka: "100g = 5,00 " },
      { nazwa: "Помидор", ilosc: '50', jednostka: 'g', cenaSkładnika: 0.60, notatka: "1kg = 12,00 " },
      { nazwa: "Лук (карамелизированный)", ilosc: '40', jednostka: 'g', cenaSkładnika: 0.16, notatka: "1kg = 4,00 " },
      { nazwa: "Дижонская горчица", ilosc: '15', jednostka: 'g', cenaSkładnika: 0.60, notatka: "200g = 8,00 " },
      { nazwa: "Сливочное масло", ilosc: '15', jednostka: 'g', cenaSkładnika: 0.53, notatka: "200g = 7,00 " },
      { nazwa: "Корнишоны", ilosc: '20', jednostka: 'g', cenaSkładnika: 0.40, notatka: "300g = 6,00 " },
      { nazwa: "Соль / перец", ilosc: '3', jednostka: 'g', cenaSkładnika: 0.05, notatka: "Смешанное" },
    ],
  },
  {
    id: 1003,
    nazwa: "Креветки с васаби-майонезом",
    kategoria: "Закуски",
    cena: 27.00,
    vat: 8,
    prepTime: 14,
    status: "Активное",
    diet: "Морепродукты",
    alergeny: ["Ракообразные", "Яйца", "Кунжут"],
    opis: "Сочные тигровые креветки с острым васаби-майонезом, кунжутом и микрозеленью.",
    skladniki: [
      { nazwa: "Тигровые креветки", ilosc: '150', jednostka: 'g', cenaSkładnika: 16.88, notatka: "400g = 45,00 " },
      { nazwa: "Паста васаби", ilosc: '5', jednostka: 'g', cenaSkładnika: 1.40, notatka: "43g = 12,00 " },
      { nazwa: "Майонез", ilosc: '40', jednostka: 'g', cenaSkładnika: 0.80, notatka: "400g = 8,00 " },
      { nazwa: "Лайм", ilosc: '1', jednostka: 'szt', cenaSkładnika: 2.00, notatka: "1 szt = 2,00 " },
      { nazwa: "Чеснок", ilosc: '5', jednostka: 'g', cenaSkładnika: 0.30, notatka: "50g = 3,00 " },
      { nazwa: "Кунжутное масло", ilosc: '10', jednostka: 'ml', cenaSkładnika: 0.56, notatka: "250ml = 14,00 " },
      { nazwa: "Соль", ilosc: '2', jednostka: 'g', cenaSkładnika: 0.01, notatka: "1kg = 2,50 " },
      { nazwa: "Кунжут", ilosc: '5', jednostka: 'g', cenaSkładnika: 0.25, notatka: "100g = 5,00 " },
      { nazwa: "Микрозелень", ilosc: '10', jednostka: 'g', cenaSkładnika: 1.60, notatka: "50g = 8,00 " },
    ],
  },
  {
    id: 1004,
    nazwa: "Лазанья",
    kategoria: "Основные блюда",
    cena: 29.00,
    vat: 8,
    prepTime: 45,
    status: "Активное",
    diet: "Мясное",
    alergeny: ["Глютен", "Молочные продукты", "Яйца"],
    opis: "Классическая лазанья болоньезе с домашним рагу, бешамелем и тремя сырами, запечённая до золотистой корочки.",
    skladniki: [
      { nazwa: "Листы лазаньи", ilosc: '200', jednostka: 'g', cenaSkładnika: 2.80, notatka: "500g = 7,00 " },
      { nazwa: "Говяжий фарш", ilosc: '200', jednostka: 'g', cenaSkładnika: 8.80, notatka: "500g = 22,00 " },
      { nazwa: "Томатная пассата", ilosc: '150', jednostka: 'ml', cenaSkładnika: 1.50, notatka: "500ml = 5,00 " },
      { nazwa: "Моцарелла", ilosc: '100', jednostka: 'g', cenaSkładnika: 4.00, notatka: "125g = 5,00 " },
      { nazwa: "Пармезан", ilosc: '30', jednostka: 'g', cenaSkładnika: 3.60, notatka: "100g = 12,00 " },
      { nazwa: "Лук", ilosc: '80', jednostka: 'g', cenaSkładnika: 0.32, notatka: "1kg = 4,00 " },
      { nazwa: "Чеснок", ilosc: '10', jednostka: 'g', cenaSkładnika: 0.60, notatka: "50g = 3,00 " },
      { nazwa: "Молоко", ilosc: '300', jednostka: 'ml', cenaSkładnika: 1.20, notatka: "1L = 4,00 " },
      { nazwa: "Сливочное масло", ilosc: '30', jednostka: 'g', cenaSkładnika: 1.05, notatka: "200g = 7,00 " },
      { nazwa: "Пшеничная мука", ilosc: '30', jednostka: 'g', cenaSkładnika: 0.09, notatka: "1kg = 3,00 " },
      { nazwa: "Оливковое масло", ilosc: '15', jednostka: 'ml', cenaSkładnika: 0.54, notatka: "500ml = 18,00 " },
      { nazwa: "Сушёный орегано", ilosc: '2', jednostka: 'g', cenaSkładnika: 0.60, notatka: "10g = 3,00 " },
      { nazwa: "Свежий базилик", ilosc: '5', jednostka: 'g', cenaSkładnika: 1.00, notatka: "20g = 4,00 " },
      { nazwa: "Соль / перец", ilosc: '4', jednostka: 'g', cenaSkładnika: 0.05, notatka: "Смешанное" },
    ],
  },
  {
    id: 1005,
    nazwa: "Говяжий тартар с трюфелями и картофелем фри",
    kategoria: "Закуски",
    cena: 39.00,
    vat: 8,
    prepTime: 25,
    status: "Активное",
    diet: "Мясное (сырое)",
    alergeny: ["Яйца", "Горчица", "Сельдерей"],
    opis: "Рубленый тартар из говяжьей вырезки с трюфельным маслом, желтком и хрустящим картофелем фри.",
    skladniki: [
      { nazwa: "Говяжья вырезка", ilosc: '150', jednostka: 'g', cenaSkładnika: 21.00, notatka: "1kg = 140,00 " },
      { nazwa: "Трюфельное масло", ilosc: '5', jednostka: 'ml', cenaSkładnika: 3.00, notatka: "50ml = 30,00 " },
      { nazwa: "Яичный желток", ilosc: '1', jednostka: 'szt', cenaSkładnika: 1.20, notatka: "10 jajek = 12,00 " },
      { nazwa: "Корнишоны", ilosc: '20', jednostka: 'g', cenaSkładnika: 0.40, notatka: "300g = 6,00 " },
      { nazwa: "Мелко нарезанный лук", ilosc: '20', jednostka: 'g', cenaSkładnika: 0.08, notatka: "1kg = 4,00 " },
      { nazwa: "Каперсы", ilosc: '10', jednostka: 'g', cenaSkładnika: 1.00, notatka: "100g = 10,00 " },
      { nazwa: "Дижонская горчица", ilosc: '10', jednostka: 'g', cenaSkładnika: 0.40, notatka: "200g = 8,00 " },
      { nazwa: "Вустерский соус", ilosc: '5', jednostka: 'ml', cenaSkładnika: 0.27, notatka: "150ml = 8,00 " },
      { nazwa: "Табаско", ilosc: '2', jednostka: 'ml', cenaSkładnika: 0.40, notatka: "60ml = 12,00 " },
      { nazwa: "Картофель (фри)", ilosc: '200', jednostka: 'g', cenaSkładnika: 0.60, notatka: "1kg = 3,00 " },
      { nazwa: "Масло для жарки", ilosc: '150', jednostka: 'ml', cenaSkładnika: 1.35, notatka: "1L = 9,00 " },
      { nazwa: "Соль / перец", ilosc: '4', jednostka: 'g', cenaSkładnika: 0.05, notatka: "Смешанное" },
    ],
  },
  {
    id: 2001,
    nazwa: "Безалкогольный Basil Smash",
    kategoria: "Напитки",
    cena: 36.00,
    vat: 23,
    prepTime: 5,
    status: "Активное",
    diet: "Веганское",
    alergeny: [],
    opis: "Освежающий безалкогольный коктейль с базиликом, лаймом, огурцом и газированной водой.",
    skladniki: [
      { nazwa: "Свежий базилик", ilosc: '15', jednostka: 'g', cenaSkładnika: 3.00, notatka: "20g = 4,00 " },
      { nazwa: "Лайм", ilosc: '1', jednostka: 'szt', cenaSkładnika: 2.00, notatka: "1 szt = 2,00 " },
      { nazwa: "Сахарный сироп", ilosc: '30', jednostka: 'ml', cenaSkładnika: 0.72, notatka: "500ml = 12,00 " },
      { nazwa: "Огурец", ilosc: '30', jednostka: 'g', cenaSkładnika: 0.24, notatka: "1kg = 8,00 " },
      { nazwa: "Газированная вода", ilosc: '150', jednostka: 'ml', cenaSkładnika: 0.45, notatka: "1L = 3,00 " },
      { nazwa: "Лёд", ilosc: '100', jednostka: 'g', cenaSkładnika: 0.30, notatka: "Оценка" },
    ],
  },
  {
    id: 2002,
    nazwa: "Набор шотов",
    kategoria: "Алкоголь",
    cena: 72.00,
    vat: 23,
    prepTime: 10,
    status: "Активное",
    diet: '—',
    alergeny: ["Молочные продукты"],
    opis: "Шесть авторских шотов: малиновый, кофейный, цитрусовый, голубая лагуна, гренадин и сливочный.",
    skladniki: [
      { nazwa: "Премиальная водка", ilosc: '120', jednostka: 'ml', cenaSkładnika: 10.29, notatka: "700ml = 60,00 " },
      { nazwa: "Малиновый ликёр", ilosc: '40', jednostka: 'ml', cenaSkładnika: 2.80, notatka: "500ml = 35,00 " },
      { nazwa: "Кофейный ликёр (Kahlúa)", ilosc: '40', jednostka: 'ml', cenaSkładnika: 3.20, notatka: "500ml = 40,00 " },
      { nazwa: "Сок лайма", ilosc: '30', jednostka: 'ml', cenaSkładnika: 1.50, notatka: "1 szt = 2,00 " },
      { nazwa: "Гренадин", ilosc: '20', jednostka: 'ml', cenaSkładnika: 0.60, notatka: "500ml = 15,00 " },
      { nazwa: "Блю Кюрасао", ilosc: '30', jednostka: 'ml', cenaSkładnika: 1.80, notatka: "500ml = 30,00 " },
      { nazwa: "Сливки 30%", ilosc: '20', jednostka: 'ml', cenaSkładnika: 0.50, notatka: "200ml = 5,00 " },
      { nazwa: "Лёд", ilosc: '150', jednostka: 'g', cenaSkładnika: 0.45, notatka: "Оценка" },
    ],
  },
  {
    id: 2003,
    nazwa: "Спритц Martini Fiero",
    kategoria: "Алкоголь",
    cena: 29.00,
    vat: 23,
    prepTime: 4,
    status: "Активное",
    diet: '—',
    alergeny: [],
    opis: "Лёгкий цитрусовый спритц с Martini Fiero, просекко и газированной водой для аперитива.",
    skladniki: [
      { nazwa: 'Martini Fiero', ilosc: '75', jednostka: 'ml', cenaSkładnika: 3.50, notatka: "750ml = 35,00 " },
      { nazwa: "Просекко", ilosc: '75', jednostka: 'ml', cenaSkładnika: 3.50, notatka: "750ml = 35,00 " },
      { nazwa: "Газированная вода", ilosc: '50', jednostka: 'ml', cenaSkładnika: 0.15, notatka: "1L = 3,00 " },
      { nazwa: "Апельсин (ломтик)", ilosc: '1', jednostka: 'szt', cenaSkładnika: 0.50, notatka: "4 plastry z 1 szt (2,00 )" },
      { nazwa: "Лёд", ilosc: '100', jednostka: 'g', cenaSkładnika: 0.30, notatka: "Оценка" },
    ],
  },
  {
    id: 2004,
    nazwa: "Базилик смэш",
    kategoria: "Алкоголь",
    cena: 39.00,
    vat: 23,
    prepTime: 6,
    status: "Активное",
    diet: '—',
    alergeny: [],
    opis: "Классический коктейль с джином, свежим базиликом, лимоном и сахарным сиропом.",
    skladniki: [
      { nazwa: "Джин", ilosc: '50', jednostka: 'ml', cenaSkładnika: 3.93, notatka: "700ml = 55,00 " },
      { nazwa: "Свежий базилик", ilosc: '15', jednostka: 'g', cenaSkładnika: 3.00, notatka: "20g = 4,00 " },
      { nazwa: "Сахарный сироп", ilosc: '25', jednostka: 'ml', cenaSkładnika: 0.60, notatka: "500ml = 12,00 " },
      { nazwa: "Лимонный сок", ilosc: '25', jednostka: 'ml', cenaSkładnika: 0.75, notatka: "1 cytryna ≈ 1,50 " },
      { nazwa: "Лёд", ilosc: '100', jednostka: 'g', cenaSkładnika: 0.30, notatka: "Оценка" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────
const moneyAmount = (v: number) => formatMoney(v,getCurrency(), "ru-RU");

const categoryEmoji: Record<string, string> = {
  "Закуски": '🥗',
  "Основные блюда": '🍝',
  "Напитки": '🥤',
  "Алкоголь": '🍸',
};

const categoryColor: Record<string, string> = {
  "Закуски": '#b87333',
  "Основные блюда": '#8b5e3c',
  "Напитки": '#4a7c7c',
  "Алкоголь": '#6b8e6b',
};

const categoryOrder = ["Закуски", "Основные блюда", "Напитки", "Алкоголь"];

const getCost = (item: MenuItem) => item.skladniki.reduce((s, i) => s + i.cenaSkładnika, 0);
const getMargin = (item: MenuItem) => ((item.cena - getCost(item)) / item.cena * 100);

// Overall stats
const totalMenuItems = menuItems.length;
const avgPrice = menuItems.reduce((s, i) => s + i.cena, 0) / totalMenuItems;
const avgCost = menuItems.reduce((s, i) => s + getCost(i), 0) / totalMenuItems;
const avgMargin = menuItems.reduce((s, i) => s + getMargin(i), 0) / totalMenuItems;
const avgPrep = menuItems.reduce((s, i) => s + i.prepTime, 0) / totalMenuItems;

// ─── Info Tooltip ─────────────────────────────────────────────────────
function InfoTip({ text }: { text: string }) {useRegionalSettings();
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block ml-1.5">
      <Info
        className="w-3.5 h-3.5 text-[#b29b8c] hover:text-[#8b7355] cursor-help transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 text-[11px] leading-relaxed bg-[#3e2f29] text-[#e8d5c4] rounded-lg px-3 py-2 shadow-xl border border-[#5a4335]/20 pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-[#3e2f29]" />
        </span>
      )}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function MenuPage() {useRegionalSettings();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'category' | 'list'>('category');
  const [feature, setFeature] = useState<string | null>(null);
  const filtered = menuItems.filter(item => (item.nazwa + ' ' + item.kategoria).toLocaleLowerCase("ru-RU").includes(searchQuery.toLocaleLowerCase("ru-RU")));
  return <main className="demo-shell demo-kitchen demo-has-floating"><div className="demo-container">
    <DemoNavigation current="kuchnia" /><DemoFooter />
    <DemoHeading eyebrow="02 / Кухня" title="Хорошее меню начинается с цифр.">{"Проверьте себестоимость порций, сравните маржу и изучите рецептуры. Откройте карточку блюда для подробностей."}</DemoHeading>
    <div className="demo-mobile-first">
      <section className="demo-kpis demo-kitchen-stats" aria-label="Сводка меню" style={{ marginTop: 16 }}>
        <div className="demo-kpi demo-kpi-feature"><span>{"Количество позиций"}</span><strong>{totalMenuItems}</strong><small>{categoryOrder.length} {" категории меню"}</small><AddDemoButton label="Добавить позицию" onClick={() => setFeature("Добавление позиций меню")} /></div>
        <div className="demo-kpi"><span>{"Средняя цена продажи"}</span><strong>{moneyAmount(avgPrice)}</strong><small>{"На позицию меню"}</small></div>
        <div className="demo-kpi"><span>{"Средняя себестоимость порции"}</span><strong>{moneyAmount(avgCost)}</strong><small>{"Ингредиенты одной порции"}</small></div>
        <div className="demo-kpi"><span>{"Средняя валовая маржа"}</span><strong>{avgMargin.toFixed(1)}%</strong><small>{"Среднее время приготовления "}{Math.round(avgPrep)} {" мин"}</small></div>
      </section>
      <div className="demo-toolbar demo-kitchen-toolbar"><div className="demo-chips" aria-label="Отображение меню"><button aria-pressed={viewMode === 'category'} onClick={() => setViewMode('category')}>{"По категориям"}</button><button aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}>{"Все позиции"}</button></div><input className="demo-input" aria-label="Поиск в меню" placeholder="Поиск блюд или категорий…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
      <section id="kitchen-menu" className="demo-kitchen-cards" aria-label="Карточки меню">
        {filtered.length === 0 && <p className="demo-empty" role="status">{"Подходящих блюд нет. Попробуйте другое название или категорию."}</p>}
        {(viewMode === 'category' ? categoryOrder : ["Все позиции"]).map(category => {
          const items = viewMode === 'category' ? filtered.filter(i => i.kategoria === category) : filtered;
          if (!items.length) return null;
          return <div key={category} style={{ marginBottom: 26 }}><div className="demo-section-head"><h2>{category} <span className="demo-badge">{items.length}</span></h2></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{items.map(item => <MenuCard key={item.id} item={item} isExpanded={expandedCard === item.id} onToggle={() => setExpandedCard(expandedCard === item.id ? null : item.id)} />)}</div></div>;
        })}
      </section>
    </div>
  </div><AddDemoButton floating label="Добавить позицию" onClick={() => setFeature("Добавление позиций меню")} />{feature && <SubscribeDialog feature={feature} onClose={() => setFeature(null)} />}</main>;
}

// ─── Menu Card Component ──────────────────────────────────────────────
function MenuCard({ item, isExpanded, onToggle, listMode }: { item: MenuItem; isExpanded: boolean; onToggle: () => void; listMode?: boolean }) {useRegionalSettings();
  const cost = getCost(item);
  const margin = getMargin(item);
  const profit = item.cena - cost;
  const color = categoryColor[item.kategoria];

  return (
    <div className={`rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] overflow-hidden hover:shadow-lg transition-all duration-300 ${listMode ? '' : ''}`}>
      {/* ── Card Header ── */}
      <div className="p-5">
        {/* Status & Category badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ backgroundColor: color + '18', color }}>
              {categoryEmoji[item.kategoria]} {item.kategoria}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.vat === 8 ? 'bg-[#b87333]/12 text-[#b87333]' : 'bg-[#6b8e6b]/12 text-[#6b8e6b]'}`}>
              {" НДС "}{item.vat}%
            </span>
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#6b8e6b]/15 text-[#6b8e6b]">
            ● {item.status}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-serif text-xl text-[#3e2f29] leading-snug">{item.nazwa}</h3>
        <p className="text-xs text-[#9a877c] mt-1.5 leading-relaxed">{item.opis}</p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#b87333]" />
            <span className="text-sm font-bold text-[#3e2f29]">{moneyAmount(item.cena)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#4a7c7c]" />
            <span className="text-sm text-[#6d594d]">{item.prepTime} {" мин"}</span>
          </div>
          {item.diet && item.diet !== '—' && (
            <div className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#8b5e3c]" />
              <span className="text-xs text-[#6d594d]">{item.diet}</span>
            </div>
          )}
        </div>

        {/* Allergens */}
        {item.alergeny && item.alergeny.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#b29b8c]">{"Аллергены:"}</span>
            {item.alergeny.map(a => (
              <span key={a} className="px-1.5 py-0.5 rounded text-[10px] bg-[#e8a96a]/15 text-[#c17d3a] font-medium">{a}</span>
            ))}
          </div>
        )}

        {/* Podgląd marży */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#9a877c]">{"Себестоимость: "}{moneyAmount(cost)}</span>
            <span className="font-semibold" style={{ color: margin >= 70 ? '#6b8e6b' : margin >= 50 ? '#b87333' : '#c0392b' }}>
              {" Маржа: "}{margin.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-[#e6ddd3] rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-500" style={{
              width: `${Math.min(margin, 100)}%`,
              background: margin >= 70 ? 'linear-gradient(90deg, #6b8e6b, #8fae8f)' : margin >= 50 ? 'linear-gradient(90deg, #b87333, #d4a574)' : 'linear-gradient(90deg, #c0392b, #e74c3c)',
            }} />
          </div>
        </div>

        {/* Recipe Toggle */}
        <button
          aria-expanded={isExpanded}
          onClick={onToggle}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold uppercase tracking-[0.15em] transition-all border border-[#5a4335]/10 hover:border-[#b87333]/30 hover:bg-[#efe8df]"
          style={{ color }}
        >
          <ChefHat className="w-3.5 h-3.5" />
          {isExpanded ? "Скрыть рецептуру" : "Показать рецептуру"}
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── Expanded Recipe ── */}
      {isExpanded && (
        <div className="border-t border-[#5a4335]/10 bg-[#faf7f3]">
          {/* Recipe Header */}
          <div className="px-5 pt-4 pb-2 flex items-center gap-2">
            <ChefHat className="w-4 h-4" style={{ color }} />
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254]">
              {" Рецептура — "}{item.nazwa}
            </h4>
          </div>

          {/* Ingredients Table */}
          <div className="px-5 pb-4">
            <div className="rounded-xl border border-[#5a4335]/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#3e2f29] text-[#e8d5c4]">
                    <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold">{"Ингредиент"}</th>
                    <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold">{"Количество"}</th>
                    <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold">{"Стоимость"}</th>
                    <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold">{"Заметки о закупке"}</th>
                  </tr>
                </thead>
                <tbody>
                  {item.skladniki.map((s, i) => (
                    <tr key={i} className={`border-t border-[#5a4335]/6 ${i % 2 === 0 ? 'bg-[#faf7f3]' : 'bg-[#f7f4ef]'} hover:bg-[#efe8df] transition-colors`}>
                      <td className="px-3 py-2 text-[#3e2f29] font-medium text-xs">{s.nazwa}</td>
                      <td className="px-3 py-2 text-right text-xs text-[#6d594d] font-mono">{s.ilosc} {s.jednostka}</td>
                      <td className="px-3 py-2 text-right text-xs font-semibold text-[#b87333]">{moneyAmount(s.cenaSkładnika)}</td>
                      <td className="px-3 py-2 text-left text-[10px] text-[#9a877c] italic">{s.notatka}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#3e2f29] text-[#e8d5c4]">
                    <td className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider" colSpan={2}>
                      {" 📊 Сводка затрат "}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-bold text-[#e8a96a]">
                      {moneyAmount(cost)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[#b29b8c]">
                      {item.skladniki.length} {" ингредиентов "}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Analiza zysku */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <div className="rounded-xl bg-[#f0ede8] border border-[#5a4335]/8 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#9a877c] font-semibold">{"Цена продажи"}</p>
                <p className="text-lg font-serif font-bold text-[#3e2f29] mt-0.5">{moneyAmount(item.cena)}</p>
              </div>
              <div className="rounded-xl bg-[#f0ede8] border border-[#5a4335]/8 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#9a877c] font-semibold">{"Прибыль с порции"}</p>
                <p className="text-lg font-serif font-bold text-[#6b8e6b] mt-0.5">{moneyAmount(profit)}</p>
              </div>
              <div className="rounded-xl bg-[#f0ede8] border border-[#5a4335]/8 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#9a877c] font-semibold">{"Валовая маржа"}</p>
                <p className="text-lg font-serif font-bold mt-0.5" style={{ color: margin >= 70 ? '#6b8e6b' : margin >= 50 ? '#b87333' : '#c0392b' }}>
                  {margin.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Struktura kosztów */}
            <div className="mt-3 rounded-xl bg-[#f0ede8] border border-[#5a4335]/8 p-3">
              <p className="text-[10px] uppercase tracking-wider text-[#9a877c] font-semibold mb-2">{"Структура затрат"}</p>
              <div className="space-y-1.5">
                {[...item.skladniki].sort((a, b) => b.cenaSkładnika - a.cenaSkładnika).slice(0, 5).map((s, i) => {
                  const pct = (s.cenaSkładnika / cost) * 100;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[11px] text-[#6d594d] w-28 truncate">{s.nazwa}</span>
                      <div className="flex-1 bg-[#e6ddd3] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#b87333] to-[#d4a574] transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-[#9a877c] w-12 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
