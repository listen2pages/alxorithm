import { fields, validPeriod, type Csv, type Mapping, type FileRole, type Field, type Report, type Product } from './types';
import { parseDate, parseNumber } from './csv';
import { validCurrency, minorUnits } from '../global-settings';
import { estimateProducts } from './estimate-products';
import { categoryKind } from './categories';
import {prepareFiles,enrichReport} from './flexible';

export function validateMapping(input: unknown, csv: Record<FileRole, Csv>): Mapping {
  if (!input || typeof input !== 'object') throw new Error('Brak mapowania kolumn.');
  const m = input as Mapping;
  if(m.version===2){const prepared=prepareFiles(csv,m);validateMapping(prepared.mapping,prepared.csv);return m;}
  m.fields ??= {} as Mapping['fields'];
  m.fields.tax_amount ??= null;
  if(m.currency!=null&&!validCurrency(m.currency))throw new Error('Choose a valid ISO currency code.');
  if(m.allowUnmatched!==undefined&&typeof m.allowUnmatched!=='boolean')throw new Error('Invalid unmatched-row option.');
  if(m.categoryGroups&&Object.values(m.categoryGroups).some(v=>!['main','starter','food','drink','alcohol','other'].includes(v)))throw new Error('Invalid category classification.');
  if(m.currencyColumn&&(m.currencyColumn.file!==m.lineFile||!csv[m.lineFile]?.headers.includes(m.currencyColumn.column)))throw new Error('Currency column must belong to sales rows.');
  if(m.numberFormat&&!['auto','decimal-comma','decimal-point'].includes(m.numberFormat))throw new Error('Invalid number format.');
  if(m.taxMode&&!['percent','fraction'].includes(m.taxMode))throw new Error('Invalid tax format.');
  if(m.netMoneyMode&&!['line','unit'].includes(m.netMoneyMode))throw new Error('Invalid net amount mode.');
  // Apply safe defaults for fields that may be absent in older stored mappings
  if (!m.moneyMode) m.moneyMode = 'line';
  if (!m.tipMode) m.tipMode = 'line';
  if (!m.dateFormat) m.dateFormat = 'iso';
  if (!['transactions','products'].includes(m.lineFile)) throw new Error('Nieprawidłowe ustawienie lineFile: ' + JSON.stringify(m.lineFile));
  if (!['line','unit'].includes(m.moneyMode)) throw new Error('Nieprawidłowe ustawienie moneyMode: ' + JSON.stringify(m.moneyMode));
  if (!['line','receipt'].includes(m.tipMode)) throw new Error('Nieprawidłowe ustawienie tipMode: ' + JSON.stringify(m.tipMode));
  if (!['iso','dmy','mdy'].includes(m.dateFormat)) throw new Error('Nieprawidłowe ustawienie dateFormat: ' + JSON.stringify(m.dateFormat));
  if (!m.fields) throw new Error('Brak obiektu pól mapowania (fields).');
  m.granularity ??= !m.fields.product_name&&!m.fields.plu&&m.fields.receipt_id?'receipts':'items';
  if(!['items','receipts'].includes(m.granularity))throw new Error('Nieprawidłowy poziom szczegółowości danych.');
  const lookupFile = m.lineFile === 'transactions' ? 'products' : 'transactions';
  for (const field of fields) {
    const col = m.fields[field];
    if (col !== null && (!col || !['transactions','products'].includes(col.file) || !csv[col.file].headers.includes(col.column))) throw new Error(`Sprawdź kolumnę: ${field}.`);
    if (col && col.file !== m.lineFile && !m.join) throw new Error('Kolumny z drugiego pliku wymagają klucza łączenia.');
  }
  if (m.join && (!Array.isArray(m.join.lineColumns) || !Array.isArray(m.join.lookupColumns) || !m.join.lineColumns.length || m.join.lineColumns.length > 3 || m.join.lineColumns.length !== m.join.lookupColumns.length || m.join.lineColumns.some(c => !csv[m.lineFile].headers.includes(c)) || m.join.lookupColumns.some(c => !csv[lookupFile].headers.includes(c)))) throw new Error('Nieprawidłowe kolumny łączenia.');
  if(m.join){
    const amountColumn=(name:string)=>/gross|net price|netto|brutto|price|amount|cena|kwota|vat|quantity|ilość/i.test(name);
    if([...m.join.lineColumns,...m.join.lookupColumns].some(amountColumn))throw new Error('Cena lub kwota nie jest kluczem produktu. Połącz pliki kodem produktu albo identyfikatorem paragonu; dla samych sum paragonów wybierz analizę paragonów.');
  }
  if (!m.fields.gross && !(m.fields.net_price?.file===m.lineFile&&(m.fields.vat||m.fields.tax_amount))) throw new Error('Wskaż kwotę brutto sprzedaży. Cena netto z katalogu nie jest przychodem ze sprzedaży.');
  if(m.granularity==='receipts'){
    if(!m.fields.receipt_id||m.join||m.moneyMode!=='line'||['product_name','plu','quantity','category'].some(field=>m.fields[field as Field]))throw new Error('Analiza paragonów wymaga ID i kwoty całego paragonu, bez łączenia z katalogiem i bez pól pozycji.');
  }else if(!m.fields.product_name&&!m.fields.plu)throw new Error('Brak pozycji sprzedanych produktów. Wybierz analizę paragonów albo dodaj eksport pozycji z ID paragonu, PLU, ilością i kwotą pozycji.');
  for (const field of ['gross','net_price'] as const) {
    const col = m.fields[field];
    if (col && col.file !== m.lineFile && ((field==='net_price'?(m.netMoneyMode||m.moneyMode):m.moneyMode) !== 'unit' || !m.join)) throw new Error('Kwoty paragonów nie mogą być powielane na pozycjach. Wskaż kwotę pozycji lub cenę jednostkową z katalogu łączonego kodem produktu.');
  }
  if(m.fields.tax_amount?.file!==m.lineFile&&m.fields.tax_amount)throw new Error('Tax amounts must come from actual sales rows.');
  if(m.priceMatch){
    const p=m.priceMatch,headers=csv[lookupFile].headers;
    // Optional AI proposals must never prevent a factual receipt report.
    // Keep enabled estimates strict; only an explicit user opt-in may execute them.
    const enabled=p.enabled===true;
    const column=(value:unknown):string|null=>{
      if(typeof value!=='string'||!value.trim())return null;
      if(headers.includes(value))return value;
      const matches=headers.filter(h=>h.trim().toLowerCase()===value.trim().toLowerCase());
      return matches.length===1?matches[0]:null;
    };
    const normalized={enabled,name:column(p.name)||'',code:column(p.code),category:column(p.category),gross:column(p.gross),net:column(p.net),vat:column(p.vat)};
    const invalidColumn=[p.name,p.code,p.category,p.gross,p.net,p.vat].some(c=>c!=null&&c!==''&&!column(c));
    if(m.granularity!=='receipts')m.priceMatch=null;
    else if(!normalized.name||!(normalized.gross||(normalized.net&&normalized.vat))||enabled&&invalidColumn){
      if(enabled)throw new Error('Select valid catalogue columns: product name and either gross unit price or both net unit price and tax rate.');
      m.priceMatch=null;
    }else m.priceMatch=normalized;
  }
  if (m.tipMode === 'receipt' && m.fields.tip && !m.fields.receipt_id) throw new Error('Napiwek na paragon wymaga identyfikatora paragonu.');
  return m;
}

const category = (s: string) => s || 'Brak kategorii';
type Group = { revenue: number; orders: Set<string>; tips: number };

export class NoSalesInPeriodError extends Error {
  readonly code='NO_SALES_IN_PERIOD';
  constructor(public period:string,public availablePeriods:{period:string;rows:number}[],public firstDate:string|null,public lastDate:string|null,public dateColumn:string|null,public dateFormat:Mapping['dateFormat']){
    super(`Brak sprzedaży z datą w miesiącu ${period}. ${firstDate?`Daty w pliku: ${firstDate} — ${lastDate}. Miesiące: ${availablePeriods.map(p=>`${p.period} (${p.rows} wierszy)`).join(', ')}.`:'Plik nie zawiera pozycji sprzedaży.'} Wybierz miesiąc zgodny z datami sprzedaży albo sprawdź kolumnę i format dat w mapowaniu. Miesiąc przesłania pliku nie zmienia dat sprzedaży.`);
    this.name='NoSalesInPeriodError';
  }
}

export function calculate(csv: Record<FileRole, Csv>, input: Mapping, period: string): Report {
  if(input.version===2){const prepared=prepareFiles(csv,input);return enrichReport(calculate(prepared.csv,prepared.mapping,period),csv,input,prepared);}
  if (!validPeriod(period)) throw new Error('Dozwolone są miesiące z lat 2025–2027.');
  const m = validateMapping(input, csv), f = m.fields, receiptOnly=m.granularity==='receipts';
  const factor=minorUnits(m.currency), cents=(n:number)=>Math.round((n+Math.sign(n)*Number.EPSILON)*factor);
  const lines = csv[m.lineFile].rows;
  const lookupFile = m.lineFile === 'transactions' ? 'products' : 'transactions';
  const lookup = csv[lookupFile].rows;
  const index = new Map<string, Record<string,string>>(), used = new Set<string>();
  const key = (row: Record<string,string>, columns: string[]) => {
    const values = columns.map(c => {const nameColumn=m.fields.product_name?.column;const v=row[c].trim().normalize('NFKC');return c===nameColumn?v.replace(/\s+/g,' ').toLowerCase():v;});
    if (values.some(v => !v)) throw new Error('Pusty klucz łączenia plików.');
    return JSON.stringify(values);
  };
  if (m.join) for (const row of lookup) {
    const k = key(row, m.join.lookupColumns);
    if (index.has(k)) throw new Error('Klucz w drugim pliku nie jest unikalny. Wybierz poprawny klucz lub kilka kolumn łączenia.');
    index.set(k,row);
  }
  const products = new Map<string, Product>();
  const taxes=new Map<number|null,{gross:number;net:number;tax:number}>();
  const daily = new Map<string, Group>(), sources = new Map<string,Group>(), hours = new Map<string,Group>(), weekdays = new Map<string,Group>(), employees = new Map<string,Group>(), payments = new Map<string,Group>();
  const receipts = new Map<string,{ items: number; categories: Set<string>; raw: Set<string>; tip: number | null; employee: string; gross: number }>();
  let included=0, outside=0, grossTotal=0, netTotal=0, qtyTotal=0, netAvailable=true;
  let receiptAvailable=Boolean(f.receipt_id), tipsAvailable=Boolean(f.tip);
  const warnings = new Set<string>();
  const datePeriods=new Map<string,number>();let firstDate:string|null=null,lastDate:string|null=null;
  if(receiptOnly)warnings.add('Eksport zawiera sumy paragonów, bez sprzedanych produktów. Rankingi produktów, kategorie, liczba sztuk i skład koszyka są niedostępne. Katalog produktów nie określa, co sprzedano.');
  else if (!f.quantity) warnings.add('Brak kolumny ilości: zgodnie z zatwierdzonym mapowaniem każdy wiersz pozycji oznacza jedną sztukę.');
  if (!f.date) warnings.add('Brak dat: wszystkie wiersze przypisano do wybranego miesiąca. Trend dzienny i dni tygodnia są niedostępne.');
  if (!m.join) warnings.add('Drugi plik nie jest łączony: wszystkie potrzebne pola pochodzą z pliku pozycji.');
  const add = (map: Map<string,Group>, name: string, gross: number, receipt: string | null, tips=0) => {
    if (!map.has(name)) map.set(name,{ revenue:0, orders:new Set(), tips:0 });
    const g=map.get(name)!; g.revenue+=gross; g.tips+=tips; if(receipt)g.orders.add(receipt);
  };
  for (let i=0; i<lines.length; i++) {
    const line = lines[i];
    let other: Record<string,string> = {};
    if (m.join) {
      const k=key(line,m.join.lineColumns); const matched=index.get(k);
      if (!matched&&!m.allowUnmatched) throw new Error(`Wiersz ${i+2}: brak odpowiadającego rekordu w drugim pliku.`);
      if(matched){other=matched;used.add(k);}else warnings.add('Some sales have no catalogue match. Their recorded amounts are included; unavailable catalogue fields remain unknown.');
    }
    const value = (field: Field) => { const c=f[field]; return c ? ((c.file===m.lineFile?line:other)[c.column]||'').trim() : ''; };
    const num = (field: Field) => parseNumber(value(field),m.numberFormat);
    const date = f.date&&value('date') ? parseDate(value('date'),m.dateFormat) : null;
    if(f.date&&!value('date'))warnings.add('Some sales rows have no date. They are included in selected-month totals but excluded from date trends.');
    if(date){const datePeriod=date.slice(0,7);datePeriods.set(datePeriod,(datePeriods.get(datePeriod)||0)+1);if(!firstDate||date<firstDate)firstDate=date;if(!lastDate||date>lastDate)lastDate=date;}
    if (date && date.slice(0,7)!==period) { outside++; continue; }
    if(m.currencyColumn){const currency=line[m.currencyColumn.column].trim().toUpperCase();if(!validCurrency(currency)||!m.currency||currency!==m.currency)throw new Error('Mixed or unknown currencies. Analyze each currency separately; amounts are never converted.');}
    const qty = f.quantity ? num('quantity') : 1;
    if (qty===null || qty===0) throw new Error(`Wiersz ${i+2}: brak lub zerowa ilość.`);
    const rawVat=num('vat'),vat=rawVat===null?null:rawVat*(m.taxMode==='fraction'?100:1);
    if (vat!==null && (vat<0 || vat>100)) throw new Error('Stawka VAT musi być procentem od 0 do 100 (np. 23).');
    const rawNet=num('net_price');
    const catalogueNetWithActualGross=f.net_price?.file!==m.lineFile&&Boolean(f.net_price)&&f.gross?.file===m.lineFile&&m.moneyMode==='line';
    if(catalogueNetWithActualGross)warnings.add('Catalogue net unit prices do not establish actual net sales after discounts. Net is derived from recorded gross and applicable tax data when available.');
    const suppliedNet=rawNet===null||catalogueNetWithActualGross?null:cents(rawNet*((m.netMoneyMode||m.moneyMode)==='unit'?qty:1));
    const taxAmount=num('tax_amount'),suppliedTax=taxAmount===null?null:cents(taxAmount*(m.moneyMode==='unit'?qty:1));
    const amount=num('gross');
    const gross=amount!==null?cents(amount*(m.moneyMode==='unit'?qty:1)):suppliedNet!==null?(suppliedTax!==null?suppliedNet+suppliedTax:vat!==null?Math.round(suppliedNet*(1+vat/100)):NaN):NaN;
    if(!Number.isFinite(gross))throw new Error(`Wiersz ${i+2}: brak kwoty brutto.`);
    const net=suppliedNet!==null?suppliedNet:suppliedTax!==null?gross-suppliedTax:vat!==null?Math.round(gross/(1+vat/100)):null;
    if(suppliedNet!==null&&suppliedTax!==null&&Math.abs(gross-suppliedNet-suppliedTax)>1)throw new Error('Gross, net and tax amounts do not reconcile. Check mapped columns and unit/line modes.');
    if(net!==null&&gross>=0&&(net<0||net>gross)||net!==null&&gross<0&&(net>0||net<gross))throw new Error('Net amount is inconsistent with gross. Check discounts and mapped amount columns.');
    if(net===null)netAvailable=false; else netTotal+=net;
    if(net!==null){const bucket=taxes.get(vat)||{gross:0,net:0,tax:0};bucket.gross+=gross;bucket.net+=net;bucket.tax+=gross-net;taxes.set(vat,bucket);}
    const rawCat=value('category'), cat=category(rawCat);
    const name=value('product_name') || value('plu');
    if (!name&&!receiptOnly) throw new Error(`Wiersz ${i+2}: brak nazwy i kodu produktu.`);
    if(!receiptOnly){
    const productKey=JSON.stringify([value('plu')||name,cat,vat]);
    if(!products.has(productKey)) products.set(productKey,{id:products.size+1,kategoria:cat,nazwa:name,vat,iloscSprzedana:0,cenaBrutto:0,wartoscNetto:0,kwotaVAT:0,wartoscBrutto:0});
    const p=products.get(productKey)!;
    p.iloscSprzedana+=qty; p.wartoscBrutto+=gross;
    p.wartoscNetto=p.wartoscNetto===null||net===null?null:p.wartoscNetto+net;
    p.kwotaVAT=p.kwotaVAT===null||net===null?null:p.kwotaVAT+(gross-net);
    }
    const receiptId=value('receipt_id');
    const receipt=receiptId?JSON.stringify([date,receiptId]):null;
    if(!receipt){if(receiptOnly)throw new Error(`Wiersz ${i+2}: brak identyfikatora paragonu.`);receiptAvailable=false;}
    if(receiptOnly&&receipt&&receipts.has(receipt))throw new Error('Powtarzający się paragon. Eksport sum paragonów musi zawierać jeden wiersz na paragon; nie sumujemy powtórzeń.');
    const employee=value('employee')||'Brak pracownika';
    const tip=num('tip'); if(tip===null&&m.tipMode==='line')tipsAvailable=false;
    if(receipt) {
      if(!receipts.has(receipt))receipts.set(receipt,{items:0,categories:new Set(),raw:new Set(),tip:null,employee,gross:0});
      const r=receipts.get(receipt)!; r.items+=qty; r.gross+=gross; r.categories.add(categoryKind(cat,m.categoryGroups)); r.raw.add(rawCat);
      if(m.tipMode==='receipt' && tip!==null) {
        if(r.tip!==null && r.tip!==cents(tip))throw new Error('Różne kwoty napiwku na tym samym paragonie. Sprawdź tryb napiwków.');
        if(r.employee!==employee)throw new Error('Paragon ma kilku pracowników. Nie można przypisać napiwku bez dodatkowych danych.');
        r.tip=cents(tip);
      }
    }
    if(date) {
      add(daily,date,gross,receipt);
      const day=new Date(date+'T00:00:00Z').getUTCDay(); add(weekdays,String(day===0?7:day),gross,receipt);
    }
    if(f.source)add(sources,value('source')||'Brak źródła',gross,receipt);
    if(f.time) {
      const time=value('time');
      if(time) { const match=/^(\d{1,2}):([0-5]\d)(?::[0-5]\d)?$/.exec(time); if(!match || +match[1]>23)throw new Error('Nieprawidłowa godzina; wymagany format HH:MM.'); add(hours,match[1].padStart(2,'0')+':00',gross,receipt); }
      else warnings.add('Niektóre pozycje nie mają godziny; nie są ujęte na wykresie godzinowym.');
    }
    if(f.employee)add(employees,employee,gross,receipt,m.tipMode==='line'&&tip!==null?cents(tip):0);
    if(f.payment)add(payments,value('payment')||'Brak płatności',gross,receipt);
    grossTotal+=gross; qtyTotal+=qty; included++;
  }
  if(!included)throw new NoSalesInPeriodError(period,[...datePeriods].sort(([a],[b])=>a.localeCompare(b)).map(([period,rows])=>({period,rows})),firstDate,lastDate,f.date?.column||null,m.dateFormat);
  if(m.tipMode==='receipt')for(const r of receipts.values()){if(r.tip===null)tipsAvailable=false;else if(employees.has(r.employee))employees.get(r.employee)!.tips+=r.tip;}
  if(!netAvailable)warnings.add('Brak netto lub stawki VAT dla części pozycji: sumy netto i podatku są niedostępne.');
  if(!receiptAvailable)warnings.add('Brak identyfikatorów paragonów: liczba zamówień, AOV i analiza koszyka są niedostępne.');
  if(!tipsAvailable)warnings.add('Brak kompletnych napiwków: wskaźniki napiwków są niedostępne.');
  if(outside)warnings.add(`${outside} wierszy ma daty poza wybranym miesiącem; nie wliczono ich do tego raportu.`);
  const vals=(map:Map<string,Group>)=>[...map].map(([key,g])=>({key,revenue:g.revenue/factor,orders:receiptAvailable?g.orders.size:null,tips:tipsAvailable?g.tips/factor:null}));
  const baskets=[...receipts.values()], total=baskets.length;
  const rate=(n:number,d:number)=>d>0?n/d*100:null;
  const mains=baskets.filter(r=>r.categories.has('main'));
  const sushi=baskets.filter(r=>r.raw.has('Sushi'));
  const basket=!receiptOnly&&receiptAvailable&&total>0;
  return {
    version:1,period,granularity:m.granularity,...(m.currency!==undefined?{currency:m.currency}:{}),...(m.categoryGroups?{categoryGroups:m.categoryGroups}:{}),
    taxBreakdown:[...taxes].map(([rate,g])=>({rate,gross:g.gross/factor,net:g.net/factor,tax:g.tax/factor})),
    posData:[...products.values()].map(p=>({...p,cenaBrutto:p.iloscSprzedana?p.wartoscBrutto/p.iloscSprzedana/factor:0,wartoscBrutto:p.wartoscBrutto/factor,wartoscNetto:p.wartoscNetto===null?null:p.wartoscNetto/factor,kwotaVAT:p.kwotaVAT===null?null:p.kwotaVAT/factor})),
    dailyTrend:vals(daily).sort((a,b)=>a.key.localeCompare(b.key)).map(g=>({date:g.key,revenue:g.revenue,orders:g.orders})),
    sourceStats:vals(sources).map(g=>({source:g.key,revenue:g.revenue,orders:g.orders,aov:g.orders?g.revenue/g.orders:null})),
    hourlyTrend:vals(hours).sort((a,b)=>a.key.localeCompare(b.key)).map(g=>({hour:g.key,revenue:g.revenue,orders:g.orders})),
    dayOfWeekTrend:vals(weekdays).sort((a,b)=>a.key.localeCompare(b.key)).map(g=>({day:['','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'][+g.key],revenue:g.revenue,orders:g.orders})),
    employeeStats:vals(employees).map(g=>({employee:g.key,revenue:g.revenue,orders:g.orders,tips:g.tips,tipRate:g.tips!==null&&g.revenue>0?g.tips/g.revenue*100:null})),
    paymentStats:vals(payments).map(g=>({payment:g.key,revenue:g.revenue,orders:g.orders})),
    basketStats:{avgItemsPerReceipt:basket?qtyTotal/total:null,soloPercentage:basket?rate(baskets.filter(r=>r.items===1).length,total):null,groupPercentage:basket?rate(baskets.filter(r=>r.items>=3).length,total):null,attachmentRate:basket&&f.category?rate(mains.filter(r=>r.categories.has('starter')||r.categories.has('drink')||r.categories.has('alcohol')).length,mains.length):null,sushiAlcoholRate:basket&&f.category?rate(sushi.filter(r=>r.categories.has('alcohol')).length,sushi.length):null},
    totals:{gross:grossTotal/factor,net:netAvailable?netTotal/factor:null,vat:netAvailable?(grossTotal-netTotal)/factor:null,quantity:receiptOnly?null:qtyTotal,receipts:receiptAvailable?total:null},
    ...(receiptOnly?estimateProducts(csv,m,period):null),
    audit:{lineRows:lines.length,lookupRows:lookup.length,includedRows:included,outsideMonthRows:outside,unusedLookupRows:m.join?lookup.length-used.size:lookup.length,warnings:[...warnings]},
  };
}
