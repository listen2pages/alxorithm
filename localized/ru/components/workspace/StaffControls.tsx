'use client';
import {useRef,type KeyboardEvent} from 'react';
import {Users,CalendarDays,Search,SlidersHorizontal,ChevronLeft,ChevronRight,Calculator,Info,X} from 'lucide-react';
import {validPeriod} from "@/localized/ru/utils/panel/types";
import {monthEnd,validDate} from '@/utils/workspace/dates';

type Props={tab:string;onTab:(tab:string)=>void;count:number;query:string;onQuery:(query:string)=>void;start:string;end:string;onRange:(start:string,end:string)=>void;onMonth:(period:string)=>void};
function closeOnEscape(event:KeyboardEvent<HTMLDetailsElement>){if(event.key==='Escape'){event.preventDefault();event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus();}}
export default function StaffControls({tab,onTab,count,query,onQuery,start,end,onRange,onMonth}:Props){
 const range=useRef<HTMLDetailsElement>(null),period=start.slice(0,7);
 const fullMonth=validPeriod(period)&&start===period+'-01'&&end===monthEnd(period);
 return <div className="staff-controls">
  <div className="demo-tabs staff-view-tabs" role="tablist" aria-label="Экран персонала">{[['team',"Команда"],['schedule',"График и оплата"]].map(([key,label])=><button key={key} id={key+'-tab'} role="tab" aria-selected={tab===key} aria-controls={key+'-panel'} tabIndex={tab===key?0:-1} onClick={()=>onTab(key)} onKeyDown={event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?'team':event.key==='End'?'schedule':key==='team'?'schedule':'team';onTab(next);document.getElementById(next+'-tab')?.focus();}}}>{key==='team'?<Users size={16}/>:<CalendarDays size={16}/>}<span>{label}</span>{key==='team'&&<small>{count}</small>}</button>)}</div>
  <div className="staff-period-controls">
   <details ref={range} className="staff-range-menu" onKeyDown={closeOnEscape}><summary title="Изменить период"><SlidersHorizontal size={15}/><span>{fullMonth?"Даты":"Свои даты"}</span></summary><div className="staff-range-popover"><div className="staff-popover-head"><strong>{"Период"}</strong><button type="button" className="demo-icon-button" aria-label="Закрыть" onClick={()=>{if(range.current)range.current.open=false;}}><X size={16}/></button></div><div className="staff-range-fields"><label>{"С"}<input className="demo-input" type="date" min="2025-01-01" max="2027-12-31" value={start} onChange={event=>onRange(event.target.value,end)}/></label><label>{"До (включительно)"}<input className="demo-input" type="date" min={start} max="2027-12-31" value={end} onChange={event=>onRange(start,event.target.value)}/></label></div><p className="demo-muted">{"Диапазон применяется к карточкам, графику и калькулятору."}</p><button type="button" className="demo-button demo-button-secondary" onClick={()=>{onMonth(validPeriod(period)?period:'2026-01');if(range.current)range.current.open=false;}}>{"Полный месяц"}</button></div></details>
  </div>
  <label className="staff-search"><Search size={15}/><span className="sr-only">{"Поиск сотрудника"}</span><input type="search" placeholder="Сотрудник или отдел…" value={query} onChange={event=>onQuery(event.target.value)}/></label>
 </div>;
}

export function ScheduleNavigator({start,end,page,totalDays,onPage}:{start:string;end:string;page:number;totalDays:number;onPage:(page:number)=>void}){
 const label=validDate(start)&&validDate(end)?new Intl.DateTimeFormat("ru-RU",{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).formatRange(new Date(start+'T12:00:00Z'),new Date(end+'T12:00:00Z')).replace(/[\u00a0\u202f]/g,' ').replace(/\s*[–−]\s*/g,'–'):'—';
 return <div className="staff-schedule-toolbar"><h2 className="sr-only">{"Рабочий график"}</h2><div className="staff-week-nav" aria-label="Неделя графика"><button type="button" className="demo-icon-button" aria-label="Предыдущие 7 дней" title="Предыдущие 7 дней" disabled={!page} onClick={()=>onPage(page-1)}><ChevronLeft size={18}/></button><span aria-live="polite">{label}</span><button type="button" className="demo-icon-button" aria-label="Следующие 7 дней" title="Следующие 7 дней" disabled={(page+1)*7>=totalDays} onClick={()=>onPage(page+1)}><ChevronRight size={18}/></button></div><div className="staff-schedule-tools"><a href="#payroll-title" className="staff-payroll-link"><Calculator size={15}/><span>{"Калькулятор зарплаты"}</span></a><details className="staff-schedule-help" onKeyDown={closeOnEscape}><summary aria-label="О графике" title="О графике"><Info size={17}/></summary><div className="staff-help-popover"><strong>{"О графике"}</strong><p>{"Ночные смены относятся ко дню начала."}</p><p>{"Диапазон применяется к карточкам, графику и калькулятору."}</p></div></details></div></div>;
}
