'use client';
import {CalendarDays,ChevronLeft,ChevronRight} from 'lucide-react';
import {useLocale} from '@/i18n/navigation';
import {useWorkspacePeriod} from '@/i18n/WorkspacePeriod';
const words={en:{label:'Selected month',previous:'Previous month',next:'Next month'},pl:{label:'Wybrany miesiąc',previous:'Poprzedni miesiąc',next:'Następny miesiąc'},ru:{label:'Выбранный месяц',previous:'Предыдущий месяц',next:'Следующий месяц'}};
export default function WorkspaceMonthSelector({mobile=false}:{mobile?:boolean}){
 const {period,setPeriod,ready}=useWorkspacePeriod(),locale=useLocale(),w=words[locale];
 function offset(amount:number){const date=new Date(period+'-01T12:00:00Z');date.setUTCMonth(date.getUTCMonth()+amount);setPeriod(date.toISOString().slice(0,7));}
 const id=mobile?'workspace-mobile-month':'workspace-month';
 return <div className={'workspace-month-picker'+(mobile?' workspace-month-mobile':'')}><label htmlFor={id}><CalendarDays size={13}/>{w.label}</label><div><button type="button" aria-label={w.previous} disabled={!ready||period==='2025-01'} onClick={()=>offset(-1)}><ChevronLeft size={15}/></button><select id={id} aria-label={w.label} disabled={!ready} value={period} onChange={event=>setPeriod(event.target.value)}>{Array.from({length:36},(_,i)=>{const value=`${2025+Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`;return <option key={value} value={value}>{new Intl.DateTimeFormat(locale,{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'-01T12:00:00Z'))}</option>;})}</select><button type="button" aria-label={w.next} disabled={!ready||period==='2027-12'} onClick={()=>offset(1)}><ChevronRight size={15}/></button></div></div>;
}
