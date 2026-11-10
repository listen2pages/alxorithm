import { languageAlternates } from '@/i18n/routing';
import KitchenClient from './KitchenClient';
export const metadata={
 alternates: { canonical: "/ru/home/kuchnia", languages: languageAlternates("/home/kuchnia") },title:"Кухня — меню и рецептуры",robots:{index:false,follow:false}};
export default function KitchenPage(){return <KitchenClient/>;}
