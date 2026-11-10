import { languageAlternates } from '@/i18n/routing';
import StaffClient from './StaffClient';
export const metadata={
 alternates: { canonical: "/ru/home/personel", languages: languageAlternates("/home/personel") },title:"Персонал — команда, график и зарплаты",robots:{index:false,follow:false}};
export default function Page(){return <StaffClient/>;}
