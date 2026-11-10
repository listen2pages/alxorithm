'use client';
import {useRegionalSettings} from '@/i18n/useRegionalSettings';
import {categoryKind} from '@/utils/panel/categories';
import {formatMoney,getCurrency} from '@/utils/global-settings';


import Link from 'next/link';
import { DemoNavigation, DemoFooter } from '@/components/demo/DemoExperience';
import { ArrowLeft, BarChart3, PieChart as PieChartIcon, Info } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts';
import { useState } from 'react';

export interface SourceStat {
  source: string;
  revenue: number;
  orders: number;
  aov: number;
}
export interface HourlyTrendItem {
  hour: string;
  revenue: number;
  orders: number;
}
export interface DayOfWeekTrendItem {
  day: string;
  revenue: number;
  orders: number;
}

export interface EmployeeStat {
  employee: string;
  revenue: number;
  tips: number;
  orders: number;
  tipRate: number;
}
export interface PaymentStat {
  payment: string;
  revenue: number;
  orders: number;
}
export interface BasketStat {
  avgItemsPerReceipt: number;
  soloPercentage: number;
  groupPercentage: number;
  attachmentRate: number;
  sushiAlcoholRate: number;
}

export interface PosDataItem {
  id: number;
  kategoria: string;
  nazwa: string;
  vat: number;
  iloscSprzedana: number;
  cenaBrutto: number;
  wartoscNetto: number;
  kwotaVAT: number;
  wartoscBrutto: number;
}

export interface DailyTrendItem {
  date: string;
  revenue: number;
  orders: number;
}

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
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 text-[11px] leading-relaxed bg-[#3e2f29] text-[#e8d5c4] rounded-lg px-3 py-2 shadow-xl border border-[#5a4335]/20 pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-[#3e2f29]" />
        </span>
      )}
    </span>
  );
}

// ─── KPI Card Component ───────────────────────────────────────────────
function KPICard({ emoji, label, value, sub, color, tip }: { emoji: string; label: string; value: string; sub: string; color: string; tip: string }) {useRegionalSettings();
  return (
    <div className={`rounded-2xl border border-[#5a4335]/10 ${color} p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <span className="text-2xl">{emoji}</span>
        <InfoTip text={tip} />
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-[#9a877c] leading-tight">{label}</p>
      <p className="mt-1 font-serif text-2xl text-[#3e2f29] leading-tight">{value}</p>
      <p className="mt-1 text-[11px] text-[#b29b8c] leading-tight">{sub}</p>
    </div>
  );
}

// ─── Insight Card Component ───────────────────────────────────────────
function InsightCard({ emoji, title, text, accent }: { emoji: string; title: string; text: string; accent: string }) {useRegionalSettings();
  return (
    <div className={`rounded-xl bg-[#faf7f3] border border-[#5a4335]/8 border-l-4 ${accent} p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{emoji}</span>
        <h4 className="text-sm font-semibold text-[#3e2f29]">{title}</h4>
      </div>
      <p className="text-xs text-[#6d594d] leading-relaxed">{text}</p>
    </div>
  );
}

const moneyAmount = (v: number) => formatMoney(v,getCurrency(), 'pl-PL');

// ─── Custom Tooltip Components ────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#3e2f29] text-white rounded-xl px-4 py-3 shadow-xl border border-[#5a4335]/30 text-sm">
      <p className="font-semibold text-[#e8d5c4] mb-1">{payload[0]?.payload?.fullName || label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: p.color }} />
          {p.name}: {moneyAmount(p.value)}
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload; // Access full data object
  return (
    <div className="bg-[#3e2f29] text-white rounded-xl px-4 py-3 shadow-xl border border-[#5a4335]/30 text-sm">
      <p className="font-semibold text-[#e8d5c4]">{d.name}</p>
      <p className="text-xs mt-1">Przychód: {moneyAmount(d.value)}</p>
      {d.orders !== undefined && <p className="text-xs">Zamówienia: {d.orders}</p>}
      {d.aov !== undefined && <p className="text-xs text-[#a0917f]">Śr. Wartość: {moneyAmount(d.aov)}</p>}
      {d.tipRate !== undefined && <p className="text-xs text-[#b87333]">Tip Rate: {d.tipRate.toFixed(1)}%</p>}
    </div>
  );
};

const EmployeeTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-[#3e2f29] text-white rounded-xl px-4 py-3 shadow-xl border border-[#5a4335]/30 text-sm">
      <p className="font-semibold text-[#e8d5c4] mb-1">{data?.employee || label}</p>
      <p className="text-xs">Przychód: {moneyAmount(data?.revenue || 0)}</p>
      <p className="text-xs">Napiwki: {moneyAmount(data?.tips || 0)}</p>
      <p className="text-xs text-[#a0917f]">Napiwek %: {(data?.tipRate || 0).toFixed(1)}%</p>
      <p className="text-xs text-[#a0917f]">Zamówienia: {data?.orders || 0}</p>
    </div>
  );
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#3e2f29] text-white rounded-xl px-4 py-3 shadow-xl border border-[#5a4335]/30 text-sm">
      <p className="font-semibold text-[#e8d5c4] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: p.color }} />
          {p.name}: {p.name === 'revenue' ? moneyAmount(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardClient({ 
  posData, 
  dailyTrend,
  sourceStats,
  hourlyTrend,
  dayOfWeekTrend,
  employeeStats,
  paymentStats,
  basketStats
}: { 
  posData: PosDataItem[], 
  dailyTrend: DailyTrendItem[],
  sourceStats: SourceStat[],
  hourlyTrend: HourlyTrendItem[],
  dayOfWeekTrend: DayOfWeekTrendItem[],
  employeeStats: EmployeeStat[],
  paymentStats: PaymentStat[],
  basketStats: BasketStat
}) {useRegionalSettings();
  const totalBrutto = posData.reduce((s, d) => s + d.wartoscBrutto, 0);
  const totalNetto = posData.reduce((s, d) => s + d.wartoscNetto, 0);
  const totalVAT = posData.reduce((s, d) => s + d.kwotaVAT, 0);
  const totalItems = posData.reduce((s, d) => s + d.iloscSprzedana, 0);
  const avgOrderValue = totalItems > 0 ? totalBrutto / totalItems : 0;

  // Category breakdown
  const categoryMap = posData.reduce((acc, d) => {
    if (!acc[d.kategoria]) acc[d.kategoria] = { brutto: 0, netto: 0, vat: 0, qty: 0, items: 0 };
    acc[d.kategoria].brutto += d.wartoscBrutto;
    acc[d.kategoria].netto += d.wartoscNetto;
    acc[d.kategoria].vat += d.kwotaVAT;
    acc[d.kategoria].qty += d.iloscSprzedana;
    acc[d.kategoria].items += 1;
    return acc;
  }, {} as Record<string, { brutto: number; netto: number; vat: number; qty: number; items: number }>);

  const categoryData = Object.entries(categoryMap).map(([name, data]) => ({
    name,
    brutto: Math.round(data.brutto),
    netto: Math.round(data.netto),
    vat: Math.round(data.vat),
    qty: data.qty,
    items: data.items,
  }));

  // VAT breakdown
  const taxes=new Map<number,number>();
  posData.forEach(p=>taxes.set(p.vat,(taxes.get(p.vat)||0)+p.kwotaVAT));
  const vatPieData=[...taxes].map(([rate,value],i)=>({name:rate+'%',value,color:['#b87333','#6b8e6b','#4a7c7c'][i%3]}));

  // Revenue share pie
  const pieCategoryData = categoryData.map((c, i) => ({
    name: c.name,
    value: c.brutto,
    color: ['#b87333', '#8b5e3c', '#6b8e6b', '#4a7c7c'][i] || '#999',
  }));

  // Product ranking by revenue
  const productRanking = [...posData].sort((a, b) => b.wartoscBrutto - a.wartoscBrutto);

  // Product ranking by quantity
  const qtyRanking = [...posData].sort((a, b) => b.iloscSprzedana - a.iloscSprzedana);

  // Food vs Drinks split
  const foodRevenue = posData.filter(d => ['food','main','starter'].includes(categoryKind(d.kategoria))).reduce((s, d) => s + d.wartoscBrutto, 0);
  const drinksRevenue = posData.filter(d => ['drink','alcohol'].includes(categoryKind(d.kategoria))).reduce((s, d) => s + d.wartoscBrutto, 0);
  const foodPercent = totalBrutto > 0 ? ((foodRevenue / totalBrutto) * 100).toFixed(1) : '0.0';
  const drinksPercent = totalBrutto > 0 ? ((drinksRevenue / totalBrutto) * 100).toFixed(1) : '0.0';

  // Bar chart data for individual products
  const productBarData = posData.map(d => ({
    name: d.nazwa.length > 20 ? d.nazwa.substring(0, 20) + '…' : d.nazwa,
    fullName: d.nazwa,
    brutto: d.wartoscBrutto,
    netto: d.wartoscNetto,
    qty: d.iloscSprzedana,
  }));

  // Emoji helpers
  const categoryEmoji: Record<string, string> = {
    'Przystawki': '🥗',
    'Dania Glowne': '🍝',
    'Napoje': '🥤',
    'Alkohol': '🍸',
  };



  // Source pie data
  const sourceColors: Record<string, string> = {
    'POS': '#b87333',
    'Uber Eats': '#6b8e6b',
    'Wolt': '#4a7c7c',
    'Inne': '#999'
  };
  const sourcePieData = sourceStats.map((s) => ({
    name: s.source,
    value: s.revenue,
    orders: s.orders,
    aov: s.aov,
    color: sourceColors[s.source] || '#999'
  }));

  // Payment pie data
  const paymentColors: Record<string, string> = {
    'Card': '#b87333',
    'Cash': '#6b8e6b',
    'BLIK': '#4a7c7c',
    'Online': '#8b5e3c',
    'Inne': '#999'
  };
  const paymentPieData = paymentStats.map((p) => ({
    name: p.payment,
    value: p.revenue,
    orders: p.orders,
    color: paymentColors[p.payment] || '#999'
  }));

  return (
    <main className="demo-shell"><div className="demo-container"><DemoNavigation current="panel" /><DemoFooter /></div>
      <section className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-2">
          <Link href="/demo" className="w-10 h-10 rounded-full border border-[#8f7362]/30 bg-[#efe8df] flex items-center justify-center hover:bg-[#e6ddd3] transition-colors">
            <ArrowLeft className="w-4 h-4 text-[#8f7362]" />
          </Link>
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-[#3e2f29]">📊 Panel: Marzec</h1>
            <p className="text-sm text-[#9a877c] mt-1">Analiza sprzedaży POS · Marzec 2026 · Przykładowe dane restauracji</p>
          </div>
        </div>

        {/* ═══════════════ KPI CARDS ═══════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          <KPICard emoji="💰" label="Przychód całkowity (Brutto)" value={moneyAmount(totalBrutto)} sub={`Netto: ${moneyAmount(totalNetto)}`} color="bg-gradient-to-br from-[#b87333]/10 to-[#b87333]/5" tip="Gross revenue including VAT for all items sold in March" />
          <KPICard emoji="🧾" label="Suma pobranego VAT" value={moneyAmount(totalVAT)} sub={vatPieData.map(p=>p.name+': '+moneyAmount(p.value)).join(' · ')} color="bg-gradient-to-br from-[#6b8e6b]/10 to-[#6b8e6b]/5" tip="Recorded tax amounts grouped by the rates in the sample data" />
          <KPICard emoji="📦" label="Sprzedany wolumen" value={totalItems.toLocaleString()} sub={`${posData.length} unikalne produkty`} color="bg-gradient-to-br from-[#4a7c7c]/10 to-[#4a7c7c]/5" tip="Total quantity of all products sold during March" />
          <KPICard emoji="🧮" label="Średnia cena pozycji" value={moneyAmount(avgOrderValue)} sub="Na sprzedaną sztukę" color="bg-gradient-to-br from-[#8b5e3c]/10 to-[#8b5e3c]/5" tip="Average gross price per item (Total Revenue / Items Sold)" />
          <KPICard emoji="🍽️" label="Struktura: Jedzenie vs Napoje" value={`${foodPercent}% / ${drinksPercent}%`} sub={`${moneyAmount(foodRevenue)} · ${moneyAmount(drinksRevenue)}`} color="bg-gradient-to-br from-[#a0522d]/10 to-[#a0522d]/5" tip="Revenue split by product category; tax rates do not determine food or drinks" />
        </div>

        {/* ═══════════════ TOP SELLERS ═══════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2">
              🏆 Bestsellery według przychodu <InfoTip text="Products ranked by total gross revenue (Wartość Brutto) in March" />
            </h3>
            <div className="mt-4 space-y-3">
              {productRanking.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-[#b87333] text-white' : i === 1 ? 'bg-[#8b7355] text-white' : i === 2 ? 'bg-[#a0917f] text-white' : 'bg-[#e6ddd3] text-[#6d594d]'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3e2f29] truncate">{categoryEmoji[p.kategoria] || '📦'} {p.nazwa}</p>
                    <p className="text-[11px] text-[#9a877c]">{p.iloscSprzedana} sprzedano · {moneyAmount(p.cenaBrutto)}/szt.</p>
                  </div>
                  <span className="text-sm font-semibold text-[#3e2f29]">{moneyAmount(p.wartoscBrutto)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2">
              📈 Bestsellery według ilości <InfoTip text="Products ranked by total units sold (Ilość Sprzedana) in March" />
            </h3>
            <div className="mt-4 space-y-3">
              {qtyRanking.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-[#6b8e6b] text-white' : i === 1 ? 'bg-[#7a9e7a] text-white' : i === 2 ? 'bg-[#8fae8f] text-white' : 'bg-[#e6ddd3] text-[#6d594d]'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3e2f29] truncate">{categoryEmoji[p.kategoria] || '📦'} {p.nazwa}</p>
                    <p className="text-[11px] text-[#9a877c]">{moneyAmount(p.cenaBrutto)}/szt. · {moneyAmount(p.wartoscBrutto)} razem</p>
                  </div>
                  <span className="text-sm font-semibold text-[#3e2f29]">{p.iloscSprzedana} szt.</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════ CHARTS ROW 1 ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Przychód według produktu <InfoTip text="Przychód Brutto vs Netto for each menu item" />
            </h3>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d4c8bb" opacity={0.4} />
                  <XAxis type="number" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9a877c' }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: '#6d594d' }} />
                  <RechartsTooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="netto" name="Netto" fill="#b87333" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="brutto" name="Brutto" fill="#8b5e3c" radius={[0, 4, 4, 0]} barSize={12} opacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" /> Udział kategorii w przychodzie <InfoTip text="How total gross revenue is split across food & beverage categories" />
            </h3>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={100} paddingAngle={3} strokeWidth={2} stroke="#f7f4ef">
                    {pieCategoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                  <Legend iconType="circle" iconSize={10} formatter={(value) => <span className="text-xs text-[#6d594d]">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ═══════════════ CHARTS ROW 2 ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2">
              📅 Dzienny trend przychodów <InfoTip text="Real daily distribution calculated from POS dates" />
            </h3>
            <div className="mt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b87333" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#b87333" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d4c8bb" opacity={0.4} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 9, fill: '#9a877c' }} 
                    interval="preserveStartEnd"
                    tickFormatter={(val) => val.split('-').slice(2).join('')} // Show only the day number
                  />
                  <YAxis tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} tick={{ fontSize: 11, fill: '#9a877c' }} />
                  <RechartsTooltip content={<CustomLineTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="revenue" stroke="#b87333" strokeWidth={2} fill="url(#colorRevenue)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2">
              🧾 Rozliczenie podatku VAT <InfoTip text="Tax amounts grouped by the rates supplied in the sample data" />
            </h3>
            <div className="mt-4 h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vatPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={5} strokeWidth={3} stroke="#f7f4ef">
                    {vatPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                  <Legend iconType="circle" iconSize={10} formatter={(value) => <span className="text-xs text-[#6d594d]">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2 text-sm">
              {vatPieData.map(p=><span key={p.name} className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{background:p.color}} />{p.name}: {moneyAmount(p.value)}</span>)}
            </div>
          </div>
        </div>

        {/* ═══════════════ CATEGORY SUMMARY ═══════════════ */}
        <div className="mt-6">
          <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] mb-3 flex items-center gap-2">
            📋 Podsumowanie wyników kategorii <InfoTip text="Zbiorcze wskaźniki efektywności for each product category" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categoryData.map((cat) => (
              <div key={cat.name} className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{categoryEmoji[cat.name] || '📦'}</span>
                  <div>
                    <h4 className="font-serif text-lg text-[#3e2f29]">{cat.name}</h4>
                    <p className="text-[11px] text-[#9a877c]">{cat.items} produkty · {cat.qty} sprzedano</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9a877c]">Brutto</span>
                    <span className="font-semibold text-[#3e2f29]">{moneyAmount(cat.brutto)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9a877c]">Netto</span>
                    <span className="text-[#6d594d]">{moneyAmount(cat.netto)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9a877c]">VAT</span>
                    <span className="text-[#b87333]">{moneyAmount(cat.vat)}</span>
                  </div>
                  <div className="w-full bg-[#e6ddd3] rounded-full h-1.5 mt-2">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-[#b87333] to-[#8b5e3c]" style={{ width: `${(cat.brutto / totalBrutto) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════ CHANNEL ANALYSIS ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" /> Kanały Sprzedaży (Źródła) <InfoTip text="Revenue split by delivery apps vs POS" />
            </h3>
            <div className="mt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourcePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} strokeWidth={2} stroke="#f7f4ef">
                    {sourcePieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                  <Legend iconType="circle" iconSize={10} formatter={(value) => <span className="text-xs text-[#6d594d]">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
             <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2 mb-4">
              📈 Efektywność kanałów
            </h3>
            <div className="flex flex-col gap-4">
              {sourceStats.map(s => (
                <div key={s.source} className="bg-[#efe8df] p-4 rounded-xl flex justify-between items-center border border-[#5a4335]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sourceColors[s.source] || '#999' }} />
                    <div>
                      <p className="font-semibold text-[#3e2f29] text-sm">{s.source}</p>
                      <p className="text-[11px] text-[#7a6254]">{s.orders} zamówień</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#3e2f29] text-sm">{moneyAmount(s.revenue)}</p>
                    <p className="text-[11px] text-[#7a6254]">AOV: {moneyAmount(s.aov)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════ TEMPORAL PATTERNS ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2">
              ⏱️ Analiza Godzinowa (Pełne godziny) <InfoTip text="Revenue distribution throughout the day to identify peak hours" />
            </h3>
            <div className="mt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyTrend} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d4c8bb" opacity={0.4} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9a877c', angle: -45, textAnchor: 'end' }} />
                  <YAxis tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} tick={{ fontSize: 11, fill: '#9a877c' }} />
                  <RechartsTooltip content={<CustomLineTooltip />} />
                  <Bar dataKey="revenue" name="Przychód" fill="#8b5e3c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2">
              📅 Dni Tygodnia <InfoTip text="Revenue distribution across days of the week" />
            </h3>
            <div className="mt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekTrend} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d4c8bb" opacity={0.4} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9a877c' }} />
                  <YAxis tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} tick={{ fontSize: 11, fill: '#9a877c' }} />
                  <RechartsTooltip content={<CustomLineTooltip />} />
                  <Bar dataKey="revenue" name="Przychód" fill="#6b8e6b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ═══════════════ STAFF PERFORMANCE ═══════════════ */}
        <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5 mt-6">
          <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2">
            🧑‍🍳 Wyniki Personelu & Napiwki <InfoTip text="Revenue generation and gratuity % per employee" />
          </h3>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeStats} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d4c8bb" opacity={0.4} />
                <XAxis type="number" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9a877c' }} />
                <YAxis type="category" dataKey="employee" width={100} tick={{ fontSize: 11, fill: '#6d594d', fontWeight: 600 }} />
                <RechartsTooltip content={<EmployeeTooltip />} cursor={{fill: '#efe8df', opacity: 0.6}} />
                <Bar dataKey="revenue" fill="#4a7c7c" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ═══════════════ BASKET & FINANCIAL ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {/* BASKET ANALYSIS */}
          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2 mb-4">
              🛒 Analiza Koszyka (Basket Analysis) <InfoTip text="Behavioral insights based on entire orders/receipts" />
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              <InsightCard
                emoji="🍱"
                title={`Attachment Rate: ${basketStats.attachmentRate.toFixed(1)}%`}
                text="Z taką częstotliwością klienci dobierają Napój lub Przystawkę do Dania Głównego."
                accent="border-l-[#8b5e3c]"
              />
              <InsightCard
                emoji="🙋‍♂️"
                title={`Klienci Solo: ${basketStats.soloPercentage.toFixed(1)}%`}
                text={`Klienci zamawiający tylko 1 pozycję. Średnio w zamówieniu: ${basketStats.avgItemsPerReceipt.toFixed(1)} pozycji.`}
                accent="border-l-[#4a7c7c]"
              />
              <InsightCard
                emoji="🍶"
                title={`Sushi + Alkohol: ${basketStats.sushiAlcoholRate.toFixed(1)}%`}
                text="Odsetek zamówień z zestawem Sushi, do których dobrano Alkohol."
                accent="border-l-[#b87333]"
              />
            </div>
          </div>

          {/* FINANCIALS (PAYMENT METHODS) */}
          <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2 mb-4">
              💳 Logistyka Płatności
            </h3>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} strokeWidth={2} stroke="#f7f4ef">
                    {paymentPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                  <Legend iconType="circle" iconSize={10} formatter={(value) => <span className="text-xs text-[#6d594d]">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ═══════════════ DATA TABLE ═══════════════ */}
        <div className="rounded-2xl border border-[#5a4335]/10 bg-[#f7f4ef] p-5 mt-6 mb-8">
          <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#7a6254] flex items-center gap-2 mb-4">
            🗂️ Pełne dane z systemu POS <InfoTip text="Full point-of-sale transaction data for all products sold in March" />
          </h3>
          <div className="overflow-x-auto rounded-xl border border-[#5a4335]/10">
            <table className="w-full text-sm">
              <thead className="bg-[#3e2f29] text-[#e8d5c4]">
                <tr>
                  <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wider font-semibold">Kategoria</th>
                  <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wider font-semibold">Produkt</th>
                  <th className="px-3 py-3 text-right text-[11px] uppercase tracking-wider font-semibold">Ilość</th>
                  <th className="px-3 py-3 text-right text-[11px] uppercase tracking-wider font-semibold">Brutto</th>
                </tr>
              </thead>
              <tbody>
                {posData.map((row, i) => (
                  <tr key={row.id} className={`border-t border-[#5a4335]/8 ${i % 2 === 0 ? 'bg-[#faf7f3]' : 'bg-[#f7f4ef]'} hover:bg-[#efe8df] transition-colors`}>
                    <td className="px-3 py-2.5 text-xs">{categoryEmoji[row.kategoria] || '📦'} {row.kategoria}</td>
                    <td className="px-3 py-2.5 text-[#3e2f29] font-medium">{row.nazwa}</td>
                    <td className="px-3 py-2.5 text-right">{row.iloscSprzedana}</td>
                    <td className="px-3 py-2.5 text-right font-bold">{moneyAmount(row.wartoscBrutto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
