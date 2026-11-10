import { localeFromPath } from './routing';
import { translate } from './translate';
import {getSettings} from '@/utils/global-settings';
// Translate service messages only. Names, recipes, notes and account data stay exactly as stored.
function messages(value: unknown, key=''): unknown {
  const locale=localeFromPath(window.location.pathname);
  if(typeof value==='string'&&['error','warning','warnings','message','day'].includes(key))return translate(value,locale);
  if(Array.isArray(value))return value.map(item=>messages(item,key));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([name,item])=>[name,messages(item,name)]));
  return value;
}
export async function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  const local=new URL(url,window.location.origin).origin===window.location.origin;
  if(local){const headers=new Headers(init?.headers||(input instanceof Request?input.headers:undefined));headers.set('x-alxorithm-region',JSON.stringify(getSettings()));init={...init,headers};}
  const response=await globalThis.fetch(input,init);
  const original=response.json.bind(response);
  response.json=async()=>messages(await original());
  return response;
}
