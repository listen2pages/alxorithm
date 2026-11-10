export const DEMO_START = '2026-09-07';
export const DEMO_END = '2026-09-13';
export const dates = Array.from({ length: 7 }, (_, i) => `2026-09-${String(7 + i).padStart(2, '0')}`);
export const dateLabel = (date: string) => new Intl.DateTimeFormat('pl-PL', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
export const weekday = (date: string) => new Intl.DateTimeFormat('pl-PL', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
export const money = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
export const number = (value: number) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 }).format(value);
export type DemoEmployee = { id: number; name: string; role: string; department: string; rate: number; avatar: string; joined: string };
export const employees: DemoEmployee[] = [
  { id: 1, name: 'Aleksandra Mazur', role: 'Managerka', department: 'Zarządzanie', rate: 48, avatar: '/staff/alex-morgan.avif', joined: '02.01.2026' },
  { id: 2, name: 'Piotr Lis', role: 'Szef kuchni', department: 'Kuchnia', rate: 52, avatar: '/staff/jordan-blake.avif', joined: '01.09.2025' },
  { id: 3, name: 'Katarzyna Nowak', role: 'Kucharka', department: 'Kuchnia', rate: 38, avatar: '/staff/casey-nguyen.avif', joined: '15.01.2026' },
  { id: 4, name: 'Michał Wójcik', role: 'Kelner', department: 'Sala', rate: 32, avatar: '/staff/sam-carter.avif', joined: '28.12.2025' },
  { id: 5, name: 'Julia Wiśniewska', role: 'Kasjerka', department: 'Sala', rate: 33, avatar: '/staff/quinn-thompson.avif', joined: '05.02.2026' },
  { id: 6, name: 'Tomasz Zieliński', role: 'Dostawca', department: 'Dostawy', rate: 34, avatar: '/staff/dakota-hall.avif', joined: '23.12.2025' },
];
export type Shift = { date: string; start: string; end: string; breakMinutes: number };
const patterns = [
  ['08:00-16:00','08:00-16:00','08:00-16:00','12:00-20:00','08:00-16:00','',''],
  ['09:00-17:00','09:00-17:00','','12:00-20:00','14:00-22:00','14:00-22:00',''],
  ['14:00-22:00','','09:00-17:00','14:00-22:00','14:00-22:00','','09:00-17:00'],
  ['16:00-23:00','16:00-23:00','12:00-20:00','','16:00-00:00','18:00-02:00',''],
  ['','12:00-20:00','12:00-20:00','16:00-23:00','','12:00-22:00','12:00-20:00'],
  ['11:00-19:00','11:00-19:00','','11:00-19:00','16:00-23:00','16:00-23:00',''],
];
export const shifts: Record<number, Shift[]> = Object.fromEntries(employees.map((e, i) => [e.id, patterns[i].flatMap((time, d) => time ? [{ date: dates[d], start: time.split('-')[0], end: time.split('-')[1], breakMinutes: 0 }] : [])]));
export function shiftHours(shift: Shift): number {
  const minutes = (time: string) => time.split(':').reduce((sum, n, i) => sum + Number(n) * (i === 0 ? 60 : 1), 0);
  const start = minutes(shift.start);
  let end = minutes(shift.end);
  if (end < start) end += 24 * 60;
  return Math.max(0, end - start - shift.breakMinutes) / 60;
}
export function payroll(id: number, start: string, end: string, rate: number) {
  const selected = (shifts[id] || []).filter(s => s.date >= start && s.date <= end);
  const hours = selected.reduce((sum, s) => sum + shiftHours(s), 0);
  return { hours, days: selected.length, pay: Math.round(hours * rate * 100) / 100 };
}
export function validRange(start: string, end: string) { return dates.includes(start) && dates.includes(end) && start <= end; }
