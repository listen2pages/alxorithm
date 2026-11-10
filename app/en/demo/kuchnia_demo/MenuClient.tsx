'use client';
import {useRegionalSettings} from '@/i18n/useRegionalSettings';
import {formatMoney,getCurrency} from '@/utils/global-settings';


import { AddDemoButton, DemoFooter, DemoHeading, DemoNavigation, SubscribeDialog } from "@/localized/en/components/demo/DemoExperience";
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
  kategoria: "Starters" | "Main courses" | "Drinks" | "Alcohol";
  cena: number;
  vat: number;
  prepTime: number;
  status: "Active" | "Seasonal";
  diet?: string;
  alergeny?: string[];
  opis: string;
  skladniki: Ingredient[];
};

// ─── Full Menu Data ───────────────────────────────────────────────────
const menuItems: MenuItem[] = [
  {
    id: 1001,
    nazwa: "Mozzarella arancini with calamansi aioli",
    kategoria: "Starters",
    cena: 24.00,
    vat: 8,
    prepTime: 18,
    status: "Active",
    diet: "Vegetarian",
    alergeny: ['Gluten', "Dairy", "Eggs"],
    opis: "Crispy Sicilian rice balls with a mozzarella centre, served with homemade calamansi aioli.",
    skladniki: [
      { nazwa: "Arborio rice", ilosc: '150', jednostka: 'g', cenaSkładnika: 2.25, notatka: "1kg = 15,00 " },
      { nazwa: 'Mozzarella', ilosc: '80', jednostka: 'g', cenaSkładnika: 3.20, notatka: "125g = 5,00 " },
      { nazwa: "Parmesan", ilosc: '20', jednostka: 'g', cenaSkładnika: 2.40, notatka: "100g = 12,00 " },
      { nazwa: "Eggs", ilosc: '2', jednostka: 'szt', cenaSkładnika: 2.40, notatka: "10 szt = 12,00 " },
      { nazwa: "Breadcrumbs", ilosc: '60', jednostka: 'g', cenaSkładnika: 0.48, notatka: "500g = 4,00 " },
      { nazwa: 'Calamansi / limonka', ilosc: '30', jednostka: 'ml', cenaSkładnika: 2.00, notatka: "1 szt ≈ 2,00 " },
      { nazwa: "Mayonnaise", ilosc: '40', jednostka: 'g', cenaSkładnika: 0.80, notatka: "400g = 8,00 " },
      { nazwa: "Garlic", ilosc: '5', jednostka: 'g', cenaSkładnika: 0.30, notatka: "50 g bulb = 3.00" },
      { nazwa: "Frying oil", ilosc: '200', jednostka: 'ml', cenaSkładnika: 1.80, notatka: "1L = 9,00 " },
      { nazwa: "Salt", ilosc: '3', jednostka: 'g', cenaSkładnika: 0.01, notatka: "1kg = 2,50 " },
      { nazwa: "Black pepper", ilosc: '1', jednostka: 'g', cenaSkładnika: 0.20, notatka: "20g = 4,00 " },
    ],
  },
  {
    id: 1002,
    nazwa: "Anthony Bourdain sandwich with Emmental",
    kategoria: "Main courses",
    cena: 38.00,
    vat: 8,
    prepTime: 22,
    status: "Active",
    diet: "Meat",
    alergeny: ['Gluten', "Dairy", "Mustard"],
    opis: "Sourdough sandwich with slow-roasted beef, Emmental and caramelised onion.",
    skladniki: [
      { nazwa: "Sourdough bread", ilosc: '120', jednostka: 'g', cenaSkładnika: 3.20, notatka: "300g bochenek = 8,00 " },
      { nazwa: "Emmental", ilosc: '60', jednostka: 'g', cenaSkładnika: 3.60, notatka: "100g = 6,00 " },
      { nazwa: "Roast beef", ilosc: '120', jednostka: 'g', cenaSkładnika: 9.60, notatka: "1kg = 80,00 " },
      { nazwa: "Rocket", ilosc: '20', jednostka: 'g', cenaSkładnika: 1.00, notatka: "100g = 5,00 " },
      { nazwa: "Tomato", ilosc: '50', jednostka: 'g', cenaSkładnika: 0.60, notatka: "1kg = 12,00 " },
      { nazwa: "Onion (caramelised)", ilosc: '40', jednostka: 'g', cenaSkładnika: 0.16, notatka: "1kg = 4,00 " },
      { nazwa: "Dijon mustard", ilosc: '15', jednostka: 'g', cenaSkładnika: 0.60, notatka: "200g = 8,00 " },
      { nazwa: "Butter", ilosc: '15', jednostka: 'g', cenaSkładnika: 0.53, notatka: "200g = 7,00 " },
      { nazwa: "Gherkins", ilosc: '20', jednostka: 'g', cenaSkładnika: 0.40, notatka: "300g = 6,00 " },
      { nazwa: "Salt / pepper", ilosc: '3', jednostka: 'g', cenaSkładnika: 0.05, notatka: "Mixed" },
    ],
  },
  {
    id: 1003,
    nazwa: "Shrimp with wasabi mayo",
    kategoria: "Starters",
    cena: 27.00,
    vat: 8,
    prepTime: 14,
    status: "Active",
    diet: "Seafood",
    alergeny: ["Crustaceans", "Eggs", "Sesame"],
    opis: "Juicy tiger prawns with spicy wasabi mayo, sesame and microgreens.",
    skladniki: [
      { nazwa: "Tiger prawns", ilosc: '150', jednostka: 'g', cenaSkładnika: 16.88, notatka: "400g = 45,00 " },
      { nazwa: "Wasabi paste", ilosc: '5', jednostka: 'g', cenaSkładnika: 1.40, notatka: "43g = 12,00 " },
      { nazwa: "Mayonnaise", ilosc: '40', jednostka: 'g', cenaSkładnika: 0.80, notatka: "400g = 8,00 " },
      { nazwa: "Lime", ilosc: '1', jednostka: 'szt', cenaSkładnika: 2.00, notatka: "1 szt = 2,00 " },
      { nazwa: "Garlic", ilosc: '5', jednostka: 'g', cenaSkładnika: 0.30, notatka: "50g = 3,00 " },
      { nazwa: "Sesame oil", ilosc: '10', jednostka: 'ml', cenaSkładnika: 0.56, notatka: "250ml = 14,00 " },
      { nazwa: "Salt", ilosc: '2', jednostka: 'g', cenaSkładnika: 0.01, notatka: "1kg = 2,50 " },
      { nazwa: "Sesame", ilosc: '5', jednostka: 'g', cenaSkładnika: 0.25, notatka: "100g = 5,00 " },
      { nazwa: 'Microgreens', ilosc: '10', jednostka: 'g', cenaSkładnika: 1.60, notatka: "50g = 8,00 " },
    ],
  },
  {
    id: 1004,
    nazwa: "Lasagne",
    kategoria: "Main courses",
    cena: 29.00,
    vat: 8,
    prepTime: 45,
    status: "Active",
    diet: "Meat",
    alergeny: ['Gluten', "Dairy", "Eggs"],
    opis: "Classic lasagne Bolognese with homemade ragù, béchamel and three cheeses, baked golden.",
    skladniki: [
      { nazwa: "Lasagne sheets", ilosc: '200', jednostka: 'g', cenaSkładnika: 2.80, notatka: "500g = 7,00 " },
      { nazwa: "Minced beef", ilosc: '200', jednostka: 'g', cenaSkładnika: 8.80, notatka: "500g = 22,00 " },
      { nazwa: "Tomato passata", ilosc: '150', jednostka: 'ml', cenaSkładnika: 1.50, notatka: "500ml = 5,00 " },
      { nazwa: 'Mozzarella', ilosc: '100', jednostka: 'g', cenaSkładnika: 4.00, notatka: "125g = 5,00 " },
      { nazwa: "Parmesan", ilosc: '30', jednostka: 'g', cenaSkładnika: 3.60, notatka: "100g = 12,00 " },
      { nazwa: "Onion", ilosc: '80', jednostka: 'g', cenaSkładnika: 0.32, notatka: "1kg = 4,00 " },
      { nazwa: "Garlic", ilosc: '10', jednostka: 'g', cenaSkładnika: 0.60, notatka: "50g = 3,00 " },
      { nazwa: "Milk", ilosc: '300', jednostka: 'ml', cenaSkładnika: 1.20, notatka: "1L = 4,00 " },
      { nazwa: "Butter", ilosc: '30', jednostka: 'g', cenaSkładnika: 1.05, notatka: "200g = 7,00 " },
      { nazwa: "Wheat flour", ilosc: '30', jednostka: 'g', cenaSkładnika: 0.09, notatka: "1kg = 3,00 " },
      { nazwa: "Olive oil", ilosc: '15', jednostka: 'ml', cenaSkładnika: 0.54, notatka: "500ml = 18,00 " },
      { nazwa: "Dried oregano", ilosc: '2', jednostka: 'g', cenaSkładnika: 0.60, notatka: "10g = 3,00 " },
      { nazwa: "Fresh basil", ilosc: '5', jednostka: 'g', cenaSkładnika: 1.00, notatka: "20g = 4,00 " },
      { nazwa: "Salt / pepper", ilosc: '4', jednostka: 'g', cenaSkładnika: 0.05, notatka: "Mixed" },
    ],
  },
  {
    id: 1005,
    nazwa: "Beef tartare with truffles and fries",
    kategoria: "Starters",
    cena: 39.00,
    vat: 8,
    prepTime: 25,
    status: "Active",
    diet: "Meat (raw)",
    alergeny: ["Eggs", "Mustard", "Celery"],
    opis: "Hand-chopped beef tenderloin tartare with truffle oil, egg yolk and crispy fries.",
    skladniki: [
      { nazwa: "Beef tenderloin", ilosc: '150', jednostka: 'g', cenaSkładnika: 21.00, notatka: "1kg = 140,00 " },
      { nazwa: "Truffle oil", ilosc: '5', jednostka: 'ml', cenaSkładnika: 3.00, notatka: "50ml = 30,00 " },
      { nazwa: "Egg yolk", ilosc: '1', jednostka: 'szt', cenaSkładnika: 1.20, notatka: "10 jajek = 12,00 " },
      { nazwa: "Gherkins", ilosc: '20', jednostka: 'g', cenaSkładnika: 0.40, notatka: "300g = 6,00 " },
      { nazwa: "Finely chopped onion", ilosc: '20', jednostka: 'g', cenaSkładnika: 0.08, notatka: "1kg = 4,00 " },
      { nazwa: "Capers", ilosc: '10', jednostka: 'g', cenaSkładnika: 1.00, notatka: "100g = 10,00 " },
      { nazwa: "Dijon mustard", ilosc: '10', jednostka: 'g', cenaSkładnika: 0.40, notatka: "200g = 8,00 " },
      { nazwa: "Worcestershire sauce", ilosc: '5', jednostka: 'ml', cenaSkładnika: 0.27, notatka: "150ml = 8,00 " },
      { nazwa: 'Tabasco', ilosc: '2', jednostka: 'ml', cenaSkładnika: 0.40, notatka: "60ml = 12,00 " },
      { nazwa: "Potatoes (fries)", ilosc: '200', jednostka: 'g', cenaSkładnika: 0.60, notatka: "1kg = 3,00 " },
      { nazwa: "Frying oil", ilosc: '150', jednostka: 'ml', cenaSkładnika: 1.35, notatka: "1L = 9,00 " },
      { nazwa: "Salt / pepper", ilosc: '4', jednostka: 'g', cenaSkładnika: 0.05, notatka: "Mixed" },
    ],
  },
  {
    id: 2001,
    nazwa: 'Virgin Basil Smash',
    kategoria: "Drinks",
    cena: 36.00,
    vat: 23,
    prepTime: 5,
    status: "Active",
    diet: "Vegan",
    alergeny: [],
    opis: "Refreshing alcohol-free cocktail with basil, lime, cucumber and sparkling water.",
    skladniki: [
      { nazwa: "Fresh basil", ilosc: '15', jednostka: 'g', cenaSkładnika: 3.00, notatka: "20g = 4,00 " },
      { nazwa: "Lime", ilosc: '1', jednostka: 'szt', cenaSkładnika: 2.00, notatka: "1 szt = 2,00 " },
      { nazwa: "Sugar syrup", ilosc: '30', jednostka: 'ml', cenaSkładnika: 0.72, notatka: "500ml = 12,00 " },
      { nazwa: "Cucumber", ilosc: '30', jednostka: 'g', cenaSkładnika: 0.24, notatka: "1kg = 8,00 " },
      { nazwa: "Sparkling water", ilosc: '150', jednostka: 'ml', cenaSkładnika: 0.45, notatka: "1L = 3,00 " },
      { nazwa: "Ice", ilosc: '100', jednostka: 'g', cenaSkładnika: 0.30, notatka: 'Estimated' },
    ],
  },
  {
    id: 2002,
    nazwa: "Shot selection",
    kategoria: "Alcohol",
    cena: 72.00,
    vat: 23,
    prepTime: 10,
    status: "Active",
    diet: '—',
    alergeny: ["Dairy"],
    opis: "Six signature shots: raspberry, coffee, citrus, blue lagoon, grenadine and cream.",
    skladniki: [
      { nazwa: "Premium vodka", ilosc: '120', jednostka: 'ml', cenaSkładnika: 10.29, notatka: "700ml = 60,00 " },
      { nazwa: "Raspberry liqueur", ilosc: '40', jednostka: 'ml', cenaSkładnika: 2.80, notatka: "500ml = 35,00 " },
      { nazwa: "Coffee liqueur (Kahlúa)", ilosc: '40', jednostka: 'ml', cenaSkładnika: 3.20, notatka: "500ml = 40,00 " },
      { nazwa: "Lime juice", ilosc: '30', jednostka: 'ml', cenaSkładnika: 1.50, notatka: "1 szt = 2,00 " },
      { nazwa: "Grenadine", ilosc: '20', jednostka: 'ml', cenaSkładnika: 0.60, notatka: "500ml = 15,00 " },
      { nazwa: 'Blue Curaçao', ilosc: '30', jednostka: 'ml', cenaSkładnika: 1.80, notatka: "500ml = 30,00 " },
      { nazwa: "Cream 30%", ilosc: '20', jednostka: 'ml', cenaSkładnika: 0.50, notatka: "200ml = 5,00 " },
      { nazwa: "Ice", ilosc: '150', jednostka: 'g', cenaSkładnika: 0.45, notatka: 'Estimated' },
    ],
  },
  {
    id: 2003,
    nazwa: 'Martini Fiero Spritz',
    kategoria: "Alcohol",
    cena: 29.00,
    vat: 23,
    prepTime: 4,
    status: "Active",
    diet: '—',
    alergeny: [],
    opis: "Light citrus spritz with Martini Fiero, prosecco and sparkling water, perfect for aperitivo.",
    skladniki: [
      { nazwa: 'Martini Fiero', ilosc: '75', jednostka: 'ml', cenaSkładnika: 3.50, notatka: "750ml = 35,00 " },
      { nazwa: 'Prosecco', ilosc: '75', jednostka: 'ml', cenaSkładnika: 3.50, notatka: "750ml = 35,00 " },
      { nazwa: "Sparkling water", ilosc: '50', jednostka: 'ml', cenaSkładnika: 0.15, notatka: "1L = 3,00 " },
      { nazwa: "Orange (slice)", ilosc: '1', jednostka: 'szt', cenaSkładnika: 0.50, notatka: "4 plastry z 1 szt (2,00 )" },
      { nazwa: "Ice", ilosc: '100', jednostka: 'g', cenaSkładnika: 0.30, notatka: 'Estimated' },
    ],
  },
  {
    id: 2004,
    nazwa: 'Basil Smash',
    kategoria: "Alcohol",
    cena: 39.00,
    vat: 23,
    prepTime: 6,
    status: "Active",
    diet: '—',
    alergeny: [],
    opis: "Classic gin cocktail with fresh basil, lemon and sugar syrup.",
    skladniki: [
      { nazwa: 'Gin', ilosc: '50', jednostka: 'ml', cenaSkładnika: 3.93, notatka: "700ml = 55,00 " },
      { nazwa: "Fresh basil", ilosc: '15', jednostka: 'g', cenaSkładnika: 3.00, notatka: "20g = 4,00 " },
      { nazwa: "Sugar syrup", ilosc: '25', jednostka: 'ml', cenaSkładnika: 0.60, notatka: "500ml = 12,00 " },
      { nazwa: "Lemon juice", ilosc: '25', jednostka: 'ml', cenaSkładnika: 0.75, notatka: "1 cytryna ≈ 1,50 " },
      { nazwa: "Ice", ilosc: '100', jednostka: 'g', cenaSkładnika: 0.30, notatka: 'Estimated' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────
const moneyAmount = (v: number) => formatMoney(v,getCurrency(), "en-GB");

const categoryEmoji: Record<string, string> = {
  "Starters": '🥗',
  "Main courses": '🍝',
  "Drinks": '🥤',
  "Alcohol": '🍸',
};

const categoryColor: Record<string, string> = {
  "Starters": '#b87333',
  "Main courses": '#8b5e3c',
  "Drinks": '#4a7c7c',
  "Alcohol": '#6b8e6b',
};

const categoryOrder = ["Starters", "Main courses", "Drinks", "Alcohol"];

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
  const filtered = menuItems.filter(item => (item.nazwa + ' ' + item.kategoria).toLocaleLowerCase("en-GB").includes(searchQuery.toLocaleLowerCase("en-GB")));
  return <main className="demo-shell demo-kitchen demo-has-floating"><div className="demo-container">
    <DemoNavigation current="kuchnia" /><DemoFooter />
    <DemoHeading eyebrow="02 / Kitchen" title="A good menu starts with numbers.">{"Check portion costs, compare margins and explore recipes. Open a dish card for details."}</DemoHeading>
    <div className="demo-mobile-first">
      <section className="demo-kpis demo-kitchen-stats" aria-label="Menu summary" style={{ marginTop: 16 }}>
        <div className="demo-kpi demo-kpi-feature"><span>{"Item count"}</span><strong>{totalMenuItems}</strong><small>{categoryOrder.length} {" menu categories"}</small><AddDemoButton label="Add new item" onClick={() => setFeature("Adding menu items")} /></div>
        <div className="demo-kpi"><span>{"Average selling price"}</span><strong>{moneyAmount(avgPrice)}</strong><small>{"Per menu item"}</small></div>
        <div className="demo-kpi"><span>{"Average portion cost"}</span><strong>{moneyAmount(avgCost)}</strong><small>{"Ingredients for one portion"}</small></div>
        <div className="demo-kpi"><span>{"Average gross margin"}</span><strong>{avgMargin.toFixed(1)}%</strong><small>{"Average preparation time "}{Math.round(avgPrep)} {" min"}</small></div>
      </section>
      <div className="demo-toolbar demo-kitchen-toolbar"><div className="demo-chips" aria-label="Menu display"><button aria-pressed={viewMode === 'category'} onClick={() => setViewMode('category')}>{"By category"}</button><button aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}>{"All items"}</button></div><input className="demo-input" aria-label="Search menu" placeholder="Search dishes or categories…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
      <section id="kitchen-menu" className="demo-kitchen-cards" aria-label="Menu cards">
        {filtered.length === 0 && <p className="demo-empty" role="status">{"No matching dishes. Try another name or category."}</p>}
        {(viewMode === 'category' ? categoryOrder : ["All items"]).map(category => {
          const items = viewMode === 'category' ? filtered.filter(i => i.kategoria === category) : filtered;
          if (!items.length) return null;
          return <div key={category} style={{ marginBottom: 26 }}><div className="demo-section-head"><h2>{category} <span className="demo-badge">{items.length}</span></h2></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{items.map(item => <MenuCard key={item.id} item={item} isExpanded={expandedCard === item.id} onToggle={() => setExpandedCard(expandedCard === item.id ? null : item.id)} />)}</div></div>;
        })}
      </section>
    </div>
  </div><AddDemoButton floating label="Add new item" onClick={() => setFeature("Adding menu items")} />{feature && <SubscribeDialog feature={feature} onClose={() => setFeature(null)} />}</main>;
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
              {" tax "}{item.vat}%
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
            <span className="text-sm text-[#6d594d]">{item.prepTime} {" min"}</span>
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
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#b29b8c]">{"Allergens:"}</span>
            {item.alergeny.map(a => (
              <span key={a} className="px-1.5 py-0.5 rounded text-[10px] bg-[#e8a96a]/15 text-[#c17d3a] font-medium">{a}</span>
            ))}
          </div>
        )}

        {/* Podgląd marży */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#9a877c]">{"Cost: "}{moneyAmount(cost)}</span>
            <span className="font-semibold" style={{ color: margin >= 70 ? '#6b8e6b' : margin >= 50 ? '#b87333' : '#c0392b' }}>
              {" Margin: "}{margin.toFixed(1)}%
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
          {isExpanded ? "Hide recipe" : "Show recipe"}
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
              {" Recipe — "}{item.nazwa}
            </h4>
          </div>

          {/* Ingredients Table */}
          <div className="px-5 pb-4">
            <div className="rounded-xl border border-[#5a4335]/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#3e2f29] text-[#e8d5c4]">
                    <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold">{"Ingredient"}</th>
                    <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold">{"Quantity"}</th>
                    <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold">{"Cost"}</th>
                    <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold">{"Purchase notes"}</th>
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
                      {" 📊 Cost summary "}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-bold text-[#e8a96a]">
                      {moneyAmount(cost)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[#b29b8c]">
                      {item.skladniki.length} {" ingredients "}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Analiza zysku */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <div className="rounded-xl bg-[#f0ede8] border border-[#5a4335]/8 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#9a877c] font-semibold">{"Selling price"}</p>
                <p className="text-lg font-serif font-bold text-[#3e2f29] mt-0.5">{moneyAmount(item.cena)}</p>
              </div>
              <div className="rounded-xl bg-[#f0ede8] border border-[#5a4335]/8 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#9a877c] font-semibold">{"Profit per portion"}</p>
                <p className="text-lg font-serif font-bold text-[#6b8e6b] mt-0.5">{moneyAmount(profit)}</p>
              </div>
              <div className="rounded-xl bg-[#f0ede8] border border-[#5a4335]/8 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#9a877c] font-semibold">{"Gross margin"}</p>
                <p className="text-lg font-serif font-bold mt-0.5" style={{ color: margin >= 70 ? '#6b8e6b' : margin >= 50 ? '#b87333' : '#c0392b' }}>
                  {margin.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Struktura kosztów */}
            <div className="mt-3 rounded-xl bg-[#f0ede8] border border-[#5a4335]/8 p-3">
              <p className="text-[10px] uppercase tracking-wider text-[#9a877c] font-semibold mb-2">{"Cost breakdown"}</p>
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
