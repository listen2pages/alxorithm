import { languageAlternates } from '@/i18n/routing';
import StaffClient from './StaffClient';
export const metadata={
 alternates: { canonical: "/home/personel", languages: languageAlternates("/home/personel") },title:"Staff — team, schedule and pay",robots:{index:false,follow:false}};
export default function Page(){return <StaffClient/>;}
