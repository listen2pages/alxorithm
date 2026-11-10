'use client';
import {createContext,useContext,useEffect,useSyncExternalStore,type ReactNode} from 'react';
import {usePathname,useRouter,useSearchParams} from 'next/navigation';
import {getSettings} from '@/utils/global-settings';
import {validWorkspaceMonth} from '@/utils/workspace/period';
type PeriodState={period:string;setPeriod:(period:string)=>void;ready:boolean};
export const WorkspacePeriodContext=createContext<PeriodState|null>(null);
export function useWorkspacePeriod(){const value=useContext(WorkspacePeriodContext);if(!value)throw new Error('Workspace month provider is missing.');return value;}
const key='alxorithm-workspace-month';
const subscribe=(listener:()=>void)=>{window.addEventListener('storage',listener);return()=>window.removeEventListener('storage',listener);};
const serverMonth=()=>null;
function rememberedMonth(){let saved:string|null=null;try{saved=localStorage.getItem(key);}catch{/* Storage may be disabled. */}const current=new Intl.DateTimeFormat('sv-SE',{year:'numeric',month:'2-digit',timeZone:getSettings().timeZone}).format(new Date());return validWorkspaceMonth(saved)?saved:validWorkspaceMonth(current)?current:'2026-01';}
export function WorkspacePeriodProvider({children}:{children:ReactNode}){
 const search=useSearchParams(),pathname=usePathname(),router=useRouter(),remembered=useSyncExternalStore(subscribe,rememberedMonth,serverMonth);
 const requested=search.get('month'),selected=validWorkspaceMonth(requested)?requested:remembered;
 useEffect(()=>{if(!selected)return;try{localStorage.setItem(key,selected);}catch{/* URL remains the source of truth. */}if(requested!==selected){const params=new URLSearchParams(search.toString());params.set('month',selected);router.replace(pathname+'?'+params.toString()+window.location.hash,{scroll:false});}},[selected,requested,pathname,search,router]);
 function setPeriod(next:string){if(!validWorkspaceMonth(next))return;const params=new URLSearchParams(search.toString());params.set('month',next);router.replace(pathname+'?'+params.toString()+window.location.hash,{scroll:false});}
 return <WorkspacePeriodContext.Provider value={{period:selected||'2026-01',ready:!!selected,setPeriod}}>{children}</WorkspacePeriodContext.Provider>;
}
