import { languageAlternates } from '@/i18n/routing';
import KitchenClient from './KitchenClient';
export const metadata={
 alternates: { canonical: "/pl/home/kuchnia", languages: languageAlternates("/home/kuchnia") },title:'Kuchnia — menu i receptury',robots:{index:false,follow:false}};
export default function KitchenPage(){return <KitchenClient/>;}
