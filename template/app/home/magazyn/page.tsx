import InventoryClient from './InventoryClient';
import {today} from '@/utils/workspace/dates';
export const metadata={title:'Magazyn — produkty i historia zakupów',robots:{index:false,follow:false}};
export default function Page(){return <InventoryClient referenceDate={today()}/>;}
