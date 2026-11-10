import {datesBetween} from '@/utils/workspace/dates';
export type Member={id:string;revision:string;name:string;position:string;category:string;employed_on:string;image_path:string|null;image_url?:string|null;notes:string};
export type PayRate={id?:string;member_id:string;effective_on:string;pay_type:'hourly'|'monthly';rate:number};
export type Shift={id?:string;member_id:string;date:string;start_time:string;end_time:string;break_minutes:number;notes:string};
export function shiftHours(shift:Pick<Shift,'start_time'|'end_time'|'break_minutes'>){
  const minute=(v:string)=>{if(!/^([01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(v))throw new Error('Godzina musi mieć format GG:MM.');return Number(v.slice(0,2))*60+Number(v.slice(3,5));};
  const start=minute(shift.start_time),end=minute(shift.end_time);const length=end-start+(end<start?1440:0);
  if(!Number.isInteger(shift.break_minutes)||shift.break_minutes<0||shift.break_minutes>=length||!length)throw new Error('Przerwa musi być krótsza niż zmiana.');return (length-shift.break_minutes)/60;
}
export function rateOn(rates:PayRate[],memberId:string,date:string){return rates.filter(r=>r.member_id===memberId&&r.effective_on<=date).sort((a,b)=>b.effective_on.localeCompare(a.effective_on))[0]||null;}
export function payroll(member:Member,shifts:Shift[],rates:PayRate[],start:string,end:string){
  const selected=shifts.filter(s=>s.member_id===member.id&&s.date>=start&&s.date<=end),hours=selected.reduce((sum,s)=>sum+shiftHours(s),0);let pay=0,missing=false;
  for(const day of datesBetween(start,end)){
    if(day<member.employed_on)continue;const rate=rateOn(rates,member.id,day);if(!rate){missing=true;continue;}
    if(rate.pay_type==='monthly'){const [y,m]=day.split('-').map(Number);pay+=rate.rate/new Date(Date.UTC(y,m,0)).getUTCDate();}
    else pay+=selected.filter(s=>s.date===day).reduce((sum,s)=>sum+shiftHours(s)*rate.rate,0);
  }
  return {hours,days:selected.length,pay:missing?null:Math.round((pay+Number.EPSILON)*100)/100};
}
