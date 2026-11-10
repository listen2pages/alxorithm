import { languageAlternates } from '@/i18n/routing';
import fs from 'fs/promises';
import path from 'path';
import DashboardClient, { PosDataItem, DailyTrendItem, SourceStat, HourlyTrendItem, DayOfWeekTrendItem } from './DashboardClient';

function parseCSVLine(line: string) {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const parseNumber = (str: string) => {
  if (!str) return 0;
  return parseFloat(str.replace(/"/g, '').replace(',', '.'));
};

const mapCategory = (english: string) => {
  switch (english || '') {
    case 'Starter': return "Starters";
    case 'Ramen':
    case 'Sushi': return "Main courses";
    case 'Beverage': return "Drinks";
    case 'Alcohol': return "Alcohol";
    default: return "Other";
  }
};

export default async function RestaurantServerPage() {
  const filePath = path.join(process.cwd(), 'data', 'unified_sales.csv');
  let fileContents = '';
  
  try {
    fileContents = await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    console.error('Failed to read unified_sales.csv', err);
    return <div className="p-8 text-red-500 font-bold">{"Error: Cannot load unified_sales.csv data source."}</div>;
  }
  
  const lines = fileContents.split('\n').filter(line => line.trim() !== '');
  
  const productMap = new Map<number, PosDataItem>();
  const dailyMap = new Map<string, { date: string, revenue: number, orders: Set<string> }>();
  const sourceMap = new Map<string, { source: string, revenue: number, orders: Set<string> }>();
  const hourlyMap = new Map<string, { hour: string, revenue: number, orders: Set<string> }>();
  const dayOfWeekMap = new Map<number, { dayIdx: number, revenue: number, orders: Set<string> }>();
  const employeeMap = new Map<string, { employee: string, revenue: number, tips: number, orders: Set<string> }>();
  const paymentMap = new Map<string, { payment: string, revenue: number, orders: Set<string> }>();
  const receiptMap = new Map<string, { categories: Set<string>, rawCategories: Set<string>, items: number, employee: string, payment: string, source: string, gross: number, tip: number }>();

  // Skip header line (i=0)
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 10) continue; 
    
    const receiptId = values[0]?.trim();
    const dateStr = values[1]?.trim(); // 2026-03-01
    const timeStr = values[2]?.trim(); // 12:15
    const employeeStr = values[3]?.trim() || "Unknown";
    const productName = values[4]?.trim();
    const categoryEnum = values[5]?.trim();
    const plu = parseInt(values[6], 10);
    const netPrice = parseNumber(values[7]);
    const vat = parseInt(values[8]?.replace('%', ''), 10) || 0;
    const gross = parseNumber(values[9]);
    const paymentStr = values[10]?.trim() || "Other";
    const tipVal = parseNumber(values[11]);
    const sourceStr = values[12]?.trim() || 'POS';

    if (!isNaN(plu)) {
      const categoryEnumMapped = mapCategory(categoryEnum);
      // Aggregate by product
      if (!productMap.has(plu)) {
        productMap.set(plu, {
          id: plu,
          kategoria: mapCategory(categoryEnum),
          nazwa: productName,
          vat: vat,
          iloscSprzedana: 1,
          cenaBrutto: gross,
          wartoscNetto: netPrice,
          kwotaVAT: gross - netPrice,
          wartoscBrutto: gross
        });
      } else {
        const p = productMap.get(plu)!;
        p.iloscSprzedana += 1;
        p.wartoscNetto += netPrice;
        p.wartoscBrutto += gross;
        p.kwotaVAT += (gross - netPrice);
      }

      // Aggregate by day
      if (dateStr) {
        if (!dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, { date: dateStr, revenue: 0, orders: new Set() });
        }
        const d = dailyMap.get(dateStr)!;
        d.revenue += gross;
        if (receiptId) d.orders.add(receiptId);
      }

      // Aggregate by source
      if (!sourceMap.has(sourceStr)) {
          sourceMap.set(sourceStr, { source: sourceStr, revenue: 0, orders: new Set() });
      }
      const s = sourceMap.get(sourceStr)!;
      s.revenue += gross;
      if (receiptId) s.orders.add(receiptId);
      
      // Aggregate by hour
      if (timeStr) {
          const hourParts = timeStr.split(':');
          const hour = (hourParts[0].length === 1 ? '0' + hourParts[0] : hourParts[0]) + ':00'; // "12:00"
          if (!hourlyMap.has(hour)) {
              hourlyMap.set(hour, { hour, revenue: 0, orders: new Set() });
          }
          const h = hourlyMap.get(hour)!;
          h.revenue += gross;
          if (receiptId) h.orders.add(receiptId);
      }
      
      // Aggregate by day of week
      if (dateStr) {
          const dateObj = new Date(dateStr);
          if (!isNaN(dateObj.getTime())) {
              let dayIdx = dateObj.getDay(); 
              dayIdx = dayIdx === 0 ? 7 : dayIdx; // 1: Mon, ..., 7: Sun
              
              if (!dayOfWeekMap.has(dayIdx)) {
                  dayOfWeekMap.set(dayIdx, { dayIdx, revenue: 0, orders: new Set() });
              }
              const dw = dayOfWeekMap.get(dayIdx)!;
              dw.revenue += gross;
              if (receiptId) dw.orders.add(receiptId);
          }
      }
      
      // Aggregate Receipt level stats
      if (receiptId) {
          if (!receiptMap.has(receiptId)) {
            receiptMap.set(receiptId, { categories: new Set(), rawCategories: new Set(), items: 0, employee: employeeStr, payment: paymentStr, source: sourceStr, gross: 0, tip: 0 });
          }
          const r = receiptMap.get(receiptId)!;
          r.categories.add(categoryEnumMapped);
          if (categoryEnum) r.rawCategories.add(categoryEnum);
          r.items += 1;
          r.gross += gross;
          r.tip += tipVal;
      }
      
      // Aggregate Employee stats
      if (!employeeMap.has(employeeStr)) {
          employeeMap.set(employeeStr, { employee: employeeStr, revenue: 0, tips: 0, orders: new Set() });
      }
      const emp = employeeMap.get(employeeStr)!;
      emp.revenue += gross;
      emp.tips += tipVal;
      if (receiptId) emp.orders.add(receiptId);
      
      // Aggregate Payment stats
      if (!paymentMap.has(paymentStr)) {
          paymentMap.set(paymentStr, { payment: paymentStr, revenue: 0, orders: new Set() });
      }
      const pay = paymentMap.get(paymentStr)!;
      pay.revenue += gross;
      if (receiptId) pay.orders.add(receiptId);
    }
  }

  // Basket Analysis logic
  let attachmentsCount = 0; 
  let daniaGlowneCount = 0; 
  let soloConfigCount = 0; 
  let groupConfigCount = 0; 
  const receiptsArr = Array.from(receiptMap.values());
  const totalReceipts = receiptsArr.length;
  let crossCategorySushiAlcohol = 0;
  let sushiCount = 0;
  let totalItemsInAllReceipts = 0;

  for (const r of receiptsArr) {
      totalItemsInAllReceipts += r.items;
      if (r.categories.has("Main courses")) {
          daniaGlowneCount++;
          if (r.categories.has("Starters") || r.categories.has("Drinks")) {
              attachmentsCount++;
          }
      }
      if (r.rawCategories.has('Sushi')) {
          sushiCount++;
          if (r.rawCategories.has('Alcohol')) {
              crossCategorySushiAlcohol++;
          }
      }
      if (r.items === 1) soloConfigCount++;
      if (r.items >= 3) groupConfigCount++;
  }

  const posData = Array.from(productMap.values());
  const dailyTrend = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({ date: d.date, revenue: d.revenue, orders: d.orders.size }));
  
  const sourceStats = Array.from(sourceMap.values()).map(s => ({
      source: s.source, 
      revenue: s.revenue, 
      orders: s.orders.size, 
      aov: s.orders.size > 0 ? s.revenue / s.orders.size : 0 
  })).sort((a,b) => b.revenue - a.revenue);
  
  const hourlyTrend = Array.from(hourlyMap.values()).sort((a, b) => a.hour.localeCompare(b.hour)).map(h => ({
      hour: h.hour,
      revenue: h.revenue,
      orders: h.orders.size
  }));
  
  const daysPolish = ['', "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayOfWeekTrend = Array.from(dayOfWeekMap.values()).sort((a, b) => a.dayIdx - b.dayIdx).map(dw => ({
      day: daysPolish[dw.dayIdx],
      revenue: dw.revenue,
      orders: dw.orders.size
  }));
  
  const employeeStats = Array.from(employeeMap.values()).map(e => ({
      employee: e.employee,
      revenue: e.revenue,
      tips: e.tips, // Assuming 1 tip per line gives total tip. If tip was only recorded once per receipt, receiptMap approach would be used. But earlier analysis showed we can sum. 
      // Wait, let's calculate tips safely from receiptMap to avoid multiplying tip if it was entered on multiple lines (though usually it's tied).
      // Let's rely on employeeMap for revenue, but tip from receipt. Actually, let's just sum tipVal as we did.
      orders: e.orders.size,
      tipRate: e.revenue > 0 ? (e.tips / e.revenue) * 100 : 0
  })).sort((a,b) => b.revenue - a.revenue);

  const paymentStats = Array.from(paymentMap.values()).map(p => ({
      payment: p.payment,
      revenue: p.revenue,
      orders: p.orders.size
  })).sort((a,b) => b.revenue - a.revenue);

  const basketStats = {
      avgItemsPerReceipt: totalReceipts > 0 ? totalItemsInAllReceipts / totalReceipts : 0,
      soloPercentage: totalReceipts > 0 ? (soloConfigCount / totalReceipts) * 100 : 0,
      groupPercentage: totalReceipts > 0 ? (groupConfigCount / totalReceipts) * 100 : 0,
      attachmentRate: daniaGlowneCount > 0 ? (attachmentsCount / daniaGlowneCount) * 100 : 0,
      sushiAlcoholRate: sushiCount > 0 ? (crossCategorySushiAlcohol / sushiCount) * 100 : 0
  };

  return <DashboardClient 
    posData={posData} 
    dailyTrend={dailyTrend} 
    sourceStats={sourceStats} 
    hourlyTrend={hourlyTrend} 
    dayOfWeekTrend={dayOfWeekTrend} 
    employeeStats={employeeStats}
    paymentStats={paymentStats}
    basketStats={basketStats}
  />;
}
