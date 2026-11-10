import {fields,type Csv,type Mapping,type Report,type Column} from './types';
import {parseNumber,parseDate} from './csv';
import {minorUnits} from '../global-settings';

export const MAX_FILES=8;
export function prepareFiles(csv:Record<string,Csv>,m:Mapping){
  const ids=Object.keys(csv);
  if(!ids.length||ids.length>MAX_FILES)throw new Error('Upload between one and eight CSV files.');
  if(!csv[m.lineFile]||!['items','receipts'].includes(m.granularity||''))throw new Error('Choose a sales file and its row structure.');
  if(m.fileKinds?.[m.lineFile]&&m.fileKinds[m.lineFile]!==m.granularity)throw new Error('The sales file must contain actual sold items or receipts, not a catalogue.');
  if(!m.fields||typeof m.fields!=='object')throw new Error('Missing field mapping.');
  if(m.additionalSalesFiles?.length){
    if(!Array.isArray(m.additionalSalesFiles)||new Set(m.additionalSalesFiles).size!==m.additionalSalesFiles.length||m.additionalSalesFiles.includes(m.lineFile))throw new Error('Invalid additional sales files.');
    const base=csv[m.lineFile],receipt=m.fields.receipt_id,date=m.fields.date;
    if(!receipt||receipt.file!==m.lineFile)throw new Error('Multiple sales exports require receipt IDs to check for overlapping data.');
    const seen=new Map<string,string>(),rows:Record<string,string>[]=[];
    for(const id of [m.lineFile,...m.additionalSalesFiles]){
      if(!csv[id]||csv[id].headers.length!==base.headers.length||base.headers.some(h=>!csv[id].headers.includes(h)))throw new Error('Additional sales exports must have the same columns.');
      for(const row of csv[id].rows){
        const key=JSON.stringify([row[receipt.column],date?.file===m.lineFile?row[date.column]:null]);
        if(!row[receipt.column]?.trim())throw new Error('Multiple sales exports require receipt IDs to check for overlapping data.');
        if(seen.has(key)&&seen.get(key)!==id)throw new Error('Sales exports overlap. Upload non-overlapping periods or a single consolidated sales export.');
        seen.set(key,id);rows.push(row);
      }
    }
    csv={...csv,[m.lineFile]:{...base,rows}};
  }
  const joins=m.joins||[];
  if(!Array.isArray(joins)||joins.length>MAX_FILES-1)throw new Error('Invalid file links.');
  const linked=new Map<string,{index:Map<string,Record<string,string>>;lineColumns:string[]}>();
  const key=(row:Record<string,string>,cols:string[])=>JSON.stringify(cols.map(c=>(row[c]||'').trim().normalize('NFKC')));
  const numeric=/gross|net.?price|netto|brutto|price|amount|cena|kwota|vat|quantity|ilość|prix|precio|цена|сумма|税/i;
  for(const join of joins){
    if(!csv[join.file]||join.file===m.lineFile||linked.has(join.file)||!Array.isArray(join.lineColumns)||!Array.isArray(join.lookupColumns)||!join.lineColumns.length||join.lineColumns.length>3||join.lineColumns.length!==join.lookupColumns.length||join.lineColumns.some(c=>!csv[m.lineFile].headers.includes(c))||join.lookupColumns.some(c=>!csv[join.file].headers.includes(c)))throw new Error('Invalid file links.');
    const amounts=['gross','net_price','tax_amount','vat','quantity'] as const;
    if([...join.lineColumns,...join.lookupColumns].some(c=>numeric.test(c))||amounts.some(f=>{const col=m.fields[f];return col&&(col.file===m.lineFile&&join.lineColumns.includes(col.column)||col.file===join.file&&join.lookupColumns.includes(col.column));}))throw new Error('Link files by product or receipt identifiers, never by prices or amounts.');
    if(m.fileKinds?.[join.file]==='payments')throw new Error('Payment rows must be analyzed separately to avoid multiplying sales.');
    const index=new Map<string,Record<string,string>>();
    for(const row of csv[join.file].rows){
      if(join.lookupColumns.some(c=>!row[c]?.trim()))continue;
      const k=key(row,join.lookupColumns);if(index.has(k))throw new Error('Lookup identifiers are not unique. Review the file links.');index.set(k,row);
    }
    linked.set(join.file,{index,lineColumns:join.lineColumns});
  }
  for(const field of fields){
    const col=m.fields[field];
    if(col==null){m.fields[field]=null;continue;}
    if(!csv[col.file]?.headers.includes(col.column)||col.file!==m.lineFile&&!linked.has(col.file))throw new Error('Review the column mapping: '+field);
    if(['gross','net_price','tax_amount','quantity'].includes(field)&&col.file!==m.lineFile)throw new Error('Sales amounts and quantities must come from actual sales rows. Catalogue prices are not recorded sales.');
    if(m.granularity==='receipts'&&field==='vat'&&col.file!==m.lineFile)throw new Error('Receipt tax data must come from actual receipt rows.');
    if(m.granularity==='items'&&field==='vat'&&col.file!==m.lineFile&&m.fileKinds?.[col.file]==='receipts')throw new Error('A receipt tax rate cannot be applied to every sold item.');
  }
  if(m.granularity==='receipts'&&['product_name','plu','category','quantity'].some(f=>m.fields[f as keyof Mapping['fields']]))throw new Error('Receipt totals cannot be treated as sold product rows.');
  const currency=m.currencyColumn;
  if(currency&&(currency.file!==m.lineFile||!csv[currency.file]?.headers.includes(currency.column)))throw new Error('Currency column must belong to sales rows.');
  const normalizedFields=Object.fromEntries(fields.map(f=>[f,m.fields[f]?{file:'transactions',column:f}:null])) as Mapping['fields'];
  let unmatched=0;
  if(m.rowFilter&&(!csv[m.lineFile].headers.includes(m.rowFilter.column)||!Array.isArray(m.rowFilter.excludeValues)||m.rowFilter.excludeValues.some(v=>typeof v!=='string')))throw new Error('Review the sales status filter.');
  const excluded=new Set(m.rowFilter?.excludeValues.map(v=>v.trim().toLowerCase())||[]);
  const rows:Record<string,string>[]=csv[m.lineFile].rows.filter(line=>!m.rowFilter||!excluded.has(line[m.rowFilter.column].trim().toLowerCase())).map(line=>{
    const others=new Map<string,Record<string,string>>();
    for(const [id,join] of linked){const other=join.index.get(key(line,join.lineColumns));if(other)others.set(id,other);else unmatched++;}
    const value=(col:Column|null|undefined)=>col?(col.file===m.lineFile?line:others.get(col.file))?.[col.column]||'':'';
    const row:Record<string,string>={...Object.fromEntries(fields.map(f=>[f,value(m.fields[f])])),currency:value(currency)};
    if(row.time&&/[ T]\d{1,2}:\d{2}/.test(row.time))row.time=/[ T](\d{1,2}:\d{2}(?::\d{2})?)/.exec(row.time)![1];
    return row;
  });
  const mapping:Mapping={...m,version:undefined,lineFile:'transactions',join:null,priceMatch:null,fields:normalizedFields,currencyColumn:currency?{file:'transactions',column:'currency'}:null};
  if(m.payments){
    const p=m.payments,headers=csv[p.file]?.headers;
    if(!headers||p.file===m.lineFile||!['receipt_id','amount','method'].every(f=>headers.includes(p[f as 'receipt_id'|'amount'|'method']))||[p.tip,p.employee,p.date,p.currency].some(c=>c!=null&&!headers.includes(c)))throw new Error('Review the payment file columns.');
  }
  return {csv:{transactions:{headers:[...fields,'currency'],rows},products:{headers:[],rows:[]}},mapping,unmatched,sourceRows:csv[m.lineFile].rows.length};
}

export function enrichReport(report:Report,csv:Record<string,Csv>,m:Mapping,normalized:ReturnType<typeof prepareFiles>):Report{
  report.importedFiles=Object.entries(csv).map(([id,file])=>({id,kind:m.fileKinds?.[id]||'other',rows:file.rows.length}));
  report.audit.lineRows=normalized.sourceRows;report.audit.lookupRows=Object.entries(csv).filter(([id])=>id!==m.lineFile&&!m.additionalSalesFiles?.includes(id)).reduce((n,[,file])=>n+file.rows.length,0);
  report.audit.warnings=report.audit.warnings.filter(w=>!w.startsWith('Drugi plik nie jest łączony:'));
  if(normalized.unmatched){report.audit.warnings.push('Unmatched lookup rows: '+normalized.unmatched);report.audit.warnings.push('Recorded sales remain included; missing lookup values stay unknown.');}
  if(m.payments){
    const p=m.payments,factor=minorUnits(m.currency),groups=new Map<string,{amount:number;receipts:Set<string>}>();
    const selected=normalized.csv.transactions.rows.filter(r=>!m.fields.date||!r.date||parseDate(r.date,m.dateFormat).slice(0,7)===report.period);
    const datesById=new Map<string,Set<string>>();for(const row of selected){if(row.receipt_id){const dates=datesById.get(row.receipt_id)||new Set<string>();dates.add(row.date?parseDate(row.date,m.dateFormat):'');datesById.set(row.receipt_id,dates);}}
    if(!p.date&&[...datesById.values()].some(d=>d.size>1))throw new Error('Payment receipt IDs repeat on different dates. Map payment dates or use globally unique receipt IDs.');
    const receiptIds=new Set(selected.filter(r=>r.receipt_id).map(r=>JSON.stringify([p.date&&r.date?parseDate(r.date,m.dateFormat):'',r.receipt_id])));
    const receiptEmployees=new Map<string,Set<string>>();
    for(const row of selected){const k=JSON.stringify([p.date&&row.date?parseDate(row.date,m.dateFormat):'',row.receipt_id]);const employees=receiptEmployees.get(k)||new Set<string>();if(row.employee)employees.add(row.employee);receiptEmployees.set(k,employees);}
    const tipsByEmployee=new Map<string,number>(),paidReceipts=new Set<string>();let tipsComplete=true;
    if(!m.fields.receipt_id)throw new Error('Link payments using receipt identifiers in the sales file.');
    let ignored=0;
    for(const row of csv[p.file].rows){
      const receiptKey=JSON.stringify([p.date&&row[p.date]?parseDate(row[p.date],m.dateFormat):'',row[p.receipt_id]?.trim()]);
      if(!receiptIds.has(receiptKey)){ignored++;continue;}
      if(p.currency&&(!m.currency||row[p.currency]?.trim().toUpperCase()!==m.currency))throw new Error('Mixed or unknown currencies. Analyze each currency separately; amounts are never converted.');
      const amount=parseNumber(row[p.amount],m.numberFormat);if(amount===null)throw new Error('Payment amount is missing.');
      paidReceipts.add(receiptKey);
      if(p.tip&&!m.fields.tip){
        const tip=parseNumber(row[p.tip],m.numberFormat),employees=receiptEmployees.get(receiptKey)||new Set<string>(),employee=p.employee?row[p.employee]?.trim():employees.size===1?[...employees][0]:null;
        if(tip===null||!employee||!report.employeeStats.some(e=>e.employee===employee))tipsComplete=false;
        else tipsByEmployee.set(employee,(tipsByEmployee.get(employee)||0)+Math.round(tip*factor));
      }
      const method=row[p.method]?.trim()||'Unknown payment',group=groups.get(method)||{amount:0,receipts:new Set<string>()};group.amount+=Math.round(amount*factor);group.receipts.add(receiptKey);groups.set(method,group);
    }
    report.paymentStats=[...groups].map(([payment,g])=>({payment,revenue:g.amount/factor,orders:g.receipts.size}));
    if(p.tip&&!m.fields.tip){
      if(tipsComplete&&[...receiptIds].every(id=>paidReceipts.has(id)))for(const employee of report.employeeStats){employee.tips=(tipsByEmployee.get(employee.employee)||0)/factor;employee.tipRate=employee.revenue>0?employee.tips/employee.revenue*100:null;}
      else report.audit.warnings.push('Payment tips are incomplete or cannot be attributed to sales staff.');
    }
    report.audit.warnings.push('Payment charts use recorded tender amounts; split payments are counted separately without duplicating sales.');
    if(ignored)report.audit.warnings.push('Payment rows outside the selected sales receipts: '+ignored);
  }
  return report;
}
