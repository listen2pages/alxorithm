import type {Csv,Mapping,Product,Report} from './types';
import {parseDate,parseNumber} from './csv';
import {minorUnits} from '../global-settings';
// Receipt-price attribution is a user-confirmed estimate, never an identifier join.
export function estimateProducts(csv:Record<string,Csv>,m:Mapping,period:string):{posData:Product[];productEstimates:NonNullable<Report['productEstimates']>}|null {
  const p=m.priceMatch;if(!p?.enabled)return null;
  const factor=minorUnits(m.currency),round=(v:number)=>Math.round(v*factor),lookup=m.lineFile==='transactions'?'products':'transactions';
  const prices=new Map<number,Record<string,string>[]>();
  for(const row of csv[lookup].rows){
    try{
      const gross=p.gross?parseNumber(row[p.gross],m.numberFormat):null,net=p.net?parseNumber(row[p.net],m.numberFormat):null,rawTax=p.vat?parseNumber(row[p.vat],m.numberFormat):null,tax=rawTax===null?null:rawTax*(m.taxMode==='fraction'?100:1);
      const price=gross??(net!==null&&tax!==null?net*(1+tax/100):null);
      if(price===null||price<=0||!row[p.name]?.trim()||tax!==null&&(tax<0||tax>100))continue;
      const k=round(price);prices.set(k,[...(prices.get(k)||[]),row]);
    }catch{/* Malformed catalogue prices cannot support an estimate. */}
  }
  const products=new Map<string,Product>();let matchedReceipts=0,ambiguousReceipts=0,unmatchedReceipts=0,revenue=0,netTotal=0,netAvailable=true;
  for(const row of csv[m.lineFile].rows){
    const get=(field:keyof Mapping['fields'])=>{const c=m.fields[field];return c?.file===m.lineFile?row[c.column]:'';};
    if(m.fields.date&&parseDate(get('date'),m.dateFormat).slice(0,7)!==period)continue;
    const gross=parseNumber(get('gross'),m.numberFormat);
    if(gross===null||gross<=0){unmatchedReceipts++;continue;}
    const matches=prices.get(round(gross))||[];
    if(matches.length!==1){if(matches.length>1)ambiguousReceipts++;else unmatchedReceipts++;continue;}
    const other=matches[0],rawTax=p.vat?parseNumber(other[p.vat],m.numberFormat):null,tax=rawTax===null?null:rawTax*(m.taxMode==='fraction'?100:1);
    const net=tax===null?null:round(gross/(1+tax/100))/factor,name=other[p.name].trim(),category=p.category?other[p.category]:'Unknown category';
    const key=JSON.stringify([p.code?other[p.code]:name,category,tax]);
    const product=products.get(key)||{id:products.size+1,nazwa:name,kategoria:category,vat:tax,iloscSprzedana:0,cenaBrutto:0,wartoscNetto:0,kwotaVAT:0,wartoscBrutto:0};
    product.iloscSprzedana++;product.wartoscBrutto+=round(gross);product.wartoscNetto=product.wartoscNetto===null||net===null?null:product.wartoscNetto+round(net);product.kwotaVAT=product.kwotaVAT===null||net===null?null:product.kwotaVAT+round(gross)-round(net);products.set(key,product);
    matchedReceipts++;revenue+=round(gross);if(net===null)netAvailable=false;else netTotal+=round(net);
  }
  return {posData:[...products.values()].map(p=>({...p,cenaBrutto:p.wartoscBrutto/p.iloscSprzedana/factor,wartoscBrutto:p.wartoscBrutto/factor,wartoscNetto:p.wartoscNetto===null?null:p.wartoscNetto/factor,kwotaVAT:p.kwotaVAT===null?null:p.kwotaVAT/factor})),productEstimates:{matchedReceipts,ambiguousReceipts,unmatchedReceipts,revenue:revenue/factor,net:netAvailable&&matchedReceipts?netTotal/factor:null,tax:netAvailable&&matchedReceipts?(revenue-netTotal)/factor:null}};
}
