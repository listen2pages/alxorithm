export type Ingredient={id:string;name:string;unit:'kg'|'l'|'szt'|'m';price:number|null;price_origin:'manual'|'import'|'estimate';source_url:string|null;checked_at:string|null;revision:string};
export type RecipeLine={ingredient_id:string;quantity:number;unit:'mg'|'g'|'kg'|'ml'|'cl'|'dl'|'l'|'szt'|'cm'|'m'};
export type Dish={id:string;name:string;category:string;sale_price:number|null;vat:number|null;prep_minutes:number|null;status:string;diet:string;allergens:string[];description:string;portions:number;estimated_fields:string[];revision:string;recipe:RecipeLine[]};
export type DraftDish=Omit<Dish,'id'|'revision'|'recipe'> & {recipe:(Omit<RecipeLine,'ingredient_id'> & {name:string;price:number|null;price_unit:Ingredient['unit'];price_origin:Ingredient['price_origin'];source_url:string|null;checked_at:string|null})[]};
export function baseQuantity(quantity:number,unit:RecipeLine['unit'],base:Ingredient['unit']){
  if(!Number.isFinite(quantity)||quantity<0)throw new Error('Ilość musi być nieujemną liczbą.');
  if(unit===base)return quantity;
  if(unit==='g'&&base==='kg'||unit==='ml'&&base==='l')return quantity/1000;
  if(unit==='mg'&&base==='kg')return quantity/1000000;
  if(unit==='cl'&&base==='l'||unit==='cm'&&base==='m')return quantity/100;
  if(unit==='dl'&&base==='l')return quantity/10;
  throw new Error('Niezgodne jednostki składnika. Nie można automatycznie zamienić masy na objętość.');
}
export function dishMetrics(dish:Pick<Dish,'recipe'|'sale_price'|'portions'>,ingredients:Ingredient[]){
  const byId=new Map(ingredients.map(i=>[i.id,i]));
  if(!Number.isFinite(dish.portions)||dish.portions<=0)throw new Error('Liczba porcji musi być dodatnia.');
  let cost:number|null=dish.recipe.length?0:null;
  const lines=dish.recipe.map(line=>{
    const ingredient=byId.get(line.ingredient_id);
    const amount=ingredient?baseQuantity(line.quantity,line.unit,ingredient.unit):null;
    const value=amount!==null&&ingredient?.price!==null&&ingredient?.price!==undefined?amount*ingredient.price:null;
    cost=cost===null||value===null?null:cost+value;
    return value;
  });
  const portionCost=cost===null?null:cost/dish.portions;
  const profit=portionCost===null||dish.sale_price===null?null:dish.sale_price-portionCost;
  const margin=profit===null||dish.sale_price===null||dish.sale_price<=0?null:profit/dish.sale_price*100;
  return {lines,portionCost,profit,margin,foodCost:margin===null?null:100-margin};
}
export function kitchenSummary(dishes:Dish[],ingredients:Ingredient[]){
  const metrics=dishes.map(d=>dishMetrics(d,ingredients));
  const mean=(values:(number|null)[])=>values.length&&values.every(v=>v!==null)?values.reduce<number>((sum,v)=>sum+(v??0),0)/values.length:null;
  return {count:dishes.length,avgPrice:mean(dishes.map(d=>d.sale_price)),avgCost:mean(metrics.map(m=>m.portionCost)),avgMargin:mean(metrics.map(m=>m.margin)),avgPrep:mean(dishes.map(d=>d.prep_minutes))};
}
