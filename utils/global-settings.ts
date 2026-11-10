export type RegionalSettings = { currency: string; country: string; timeZone: string; language: 'en'|'pl'|'ru' };
export function validCurrency(value: unknown): value is string {
  return typeof value==='string' && /^[A-Z]{3}$/.test(value) && Intl.supportedValuesOf('currency').includes(value);
}
export function regionalSettings(input: Partial<RegionalSettings> = {}): RegionalSettings {
  let timeZone=input.timeZone||'UTC';
  try { new Intl.DateTimeFormat('en',{timeZone}); } catch { timeZone='UTC'; }
  return {currency:validCurrency(input.currency)?input.currency:'',country:typeof input.country==='string'&&/^[A-Z]{2}$/.test(input.country)?input.country:'',timeZone,language:['en','pl','ru'].includes(input.language||'')?input.language!:'en'};
}
export function getSettings(): RegionalSettings {
  if(typeof window==='undefined')return regionalSettings();
  try { return regionalSettings({timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,...JSON.parse(localStorage.getItem('alxorithm-region')||'{}'),language:document.documentElement.lang}); } catch { return regionalSettings(); }
}
let displayCurrency='';
const listeners=new Set<()=>void>();
export function getCurrency(){return typeof window==='undefined'?'':displayCurrency;}
export function currencySnapshot(){return displayCurrency;}
export function subscribeCurrency(listener:()=>void){listeners.add(listener);return ()=>{listeners.delete(listener);};}
export function setDisplayCurrency(value:string){if(displayCurrency!==value){displayCurrency=value;listeners.forEach(listener=>listener());}}
export function requestSettings(request:{headers:{get:(name:string)=>string|null}}){
  try{return regionalSettings(JSON.parse(request.headers.get('x-alxorithm-region')||'{}'));}catch{return regionalSettings();}
}
export function formatMoney(value:number,currency=getCurrency(),locale?:string){
  const language=locale||(typeof document==='undefined'?'en':document.documentElement.lang);
  return new Intl.NumberFormat(language,currency?{style:'currency',currency}:{maximumFractionDigits:3}).format(value);
}
export function minorUnits(currency?:string|null){return currency?10**(new Intl.NumberFormat('en',{style:'currency',currency}).resolvedOptions().maximumFractionDigits??2):100;}
