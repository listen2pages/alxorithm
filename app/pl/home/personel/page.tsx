import { languageAlternates } from '@/i18n/routing';
import StaffClient from './StaffClient';
export const metadata={
 alternates: { canonical: "/pl/home/personel", languages: languageAlternates("/home/personel") },title:'Personel — zespół, grafik i wynagrodzenia',robots:{index:false,follow:false}};
export default function Page(){return <StaffClient/>;}
