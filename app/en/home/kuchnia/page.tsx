import { languageAlternates } from '@/i18n/routing';
import KitchenClient from './KitchenClient';
export const metadata={
 alternates: { canonical: "/home/kuchnia", languages: languageAlternates("/home/kuchnia") },title:"Kitchen — menu and recipes",robots:{index:false,follow:false}};
export default function KitchenPage(){return <KitchenClient/>;}
