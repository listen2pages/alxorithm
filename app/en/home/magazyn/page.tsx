import { languageAlternates } from '@/i18n/routing';
import InventoryClient from './InventoryClient';
import {today} from '@/utils/workspace/dates';
export const metadata={
 alternates: { canonical: "/home/magazyn", languages: languageAlternates("/home/magazyn") },title:"Inventory — products and purchase history",robots:{index:false,follow:false}};
export default function Page(){return <InventoryClient referenceDate={today()}/>;}
