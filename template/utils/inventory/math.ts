export const measures={mg:{label:'mg',base:'kg',factor:.000001},g:{label:'gram',base:'kg',factor:.001},kg:{label:'kilogram',base:'kg',factor:1},ml:{label:'mililitr',base:'l',factor:.001},cl:{label:'centylitr',base:'l',factor:.01},dl:{label:'decylitr',base:'l',factor:.1},l:{label:'litr',base:'l',factor:1},szt:{label:'sztuka',base:'szt',factor:1},cm:{label:'centymetr',base:'m',factor:.01},m:{label:'metr',base:'m',factor:1}} as const;
export type Measure=keyof typeof measures;
export type InventoryItem={id:string;revision:string;name:string;kind:'food'|'drink'|'cleaning'|'other';purchase_price:number|null;purchase_quantity:number;purchase_unit:Measure|'opak';units_per_pack:number;content_quantity:number;content_unit:Measure;purchase_base_quantity:number;unit:string;price:number|null;description:string;notes:string;supplier_name:string;supplier_contact:string;image_path:string|null;image_url?:string|null;price_origin?:string};
export type Movement={id:string;item_id:string;kind:'order'|'use'|'waste'|'adjustment';occurred_on:string;quantity:number;base_quantity:number;base_unit:string;cost:number;package_label:string;notes:string;created_at:string};
export function normalizePurchase(item:Pick<InventoryItem,'purchase_price'|'purchase_quantity'|'purchase_unit'|'units_per_pack'|'content_quantity'|'content_unit'>){
  const unit=item.purchase_unit==='opak'?item.content_unit:item.purchase_unit;
  const measure=measures[unit];if(!measure)throw new Error('Wybierz poprawną jednostkę.');
  const quantities=[item.purchase_quantity,...(item.purchase_unit==='opak'?[item.units_per_pack,item.content_quantity]:[])];
  if(quantities.some(n=>!Number.isFinite(n)||n<=0||n>1000000))throw new Error('Ilości muszą być dodatnie, maksymalnie 1 000 000.');
  if(item.purchase_price!==null&&(!Number.isFinite(item.purchase_price)||item.purchase_price<0||item.purchase_price>1000000))throw new Error('Nieprawidłowa cena zakupu.');
  const amount=quantities.reduce((a,b)=>a*b,1)*measure.factor;
  return {unit:measure.base,purchase_base_quantity:amount,price:item.purchase_price===null?null:Math.round(item.purchase_price/amount*10000)/10000};
}
export function inventoryStats(movements:Movement[],itemId:string,start:string,end:string){
  const all=movements.filter(m=>m.item_id===itemId&&m.occurred_on<=end),selected=all.filter(m=>m.occurred_on>=start);
  return {stock:all.reduce((s,m)=>s+(m.kind==='use'||m.kind==='waste'?-m.base_quantity:m.base_quantity),0),orders:selected.filter(m=>m.kind==='order').length,purchased:selected.filter(m=>m.kind==='order').reduce((s,m)=>s+m.base_quantity,0),spend:selected.filter(m=>m.kind==='order').reduce((s,m)=>s+m.cost,0),waste:selected.filter(m=>m.kind==='waste').reduce((s,m)=>s+m.cost,0)};
}
