import type {DraftDish,Dish,Ingredient,RecipeLine} from './math';
import {baseQuantity} from './math';
export function text(value:unknown,label:string,max=300){if(typeof value!=='string'||value.length>max)throw new Error('Nieprawidłowe pole: '+label);return value.trim();}
export function numeric(value:unknown,label:string,nullable=true,max=1000000){if(value===null&&nullable)return null;if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>max)throw new Error('Nieprawidłowa liczba: '+label);return value;}
export function validateDish(input:unknown){
  if(!input||typeof input!=='object')throw new Error('Nieprawidłowa pozycja menu.');
  const d=input as Dish;
  const name=text(d.name,'Nazwa');if(!name)throw new Error('Podaj nazwę dania.');
  const portions=numeric(d.portions,'Porcje',false,10000)!;if(portions<=0)throw new Error('Liczba porcji musi być większa od zera.');
  if(!Array.isArray(d.allergens)||d.allergens.length>40||!Array.isArray(d.estimated_fields)||d.estimated_fields.length>30)throw new Error('Nieprawidłowa lista oznaczeń.');
  return {name,category:text(d.category,'Kategoria')||'Inne',sale_price:numeric(d.sale_price,'Cena'),vat:numeric(d.vat,'VAT',true,100),prep_minutes:numeric(d.prep_minutes,'Czas',true,10000),status:text(d.status,'Status'),diet:text(d.diet,'Dieta'),allergens:d.allergens.map(v=>text(v,'Alergen')),description:text(d.description,'Opis',4000),portions,estimated_fields:d.estimated_fields.map(v=>text(v,'Szacunek'))};
}
export function validateIngredient(input:unknown){
  const i=input as Ingredient;if(!i||!['kg','l','szt','m'].includes(i.unit))throw new Error('Jednostka ceny: kg, l lub szt.');
  const name=text(i.name,'Składnik');if(!name)throw new Error('Podaj nazwę składnika.');
  return {name,unit:i.unit,price:numeric(i.price,'Cena składnika')};
}
export function validateRecipe(input:unknown):RecipeLine[]{
  if(!Array.isArray(input)||input.length>100)throw new Error('Receptura może mieć do 100 składników.');
  return input.map(line=>{if(!line||!['mg','g','kg','ml','cl','dl','l','szt','cm','m'].includes(line.unit)||typeof line.ingredient_id!=='string'||!/^[0-9a-f-]{36}$/i.test(line.ingredient_id))throw new Error('Nieprawidłowy składnik receptury.');return {ingredient_id:line.ingredient_id,quantity:numeric(line.quantity,'Ilość',false)!,unit:line.unit};});
}
export function validateDraft(input:unknown):DraftDish[]{
  if(!Array.isArray(input)||!input.length||input.length>60)throw new Error('Import musi zawierać od 1 do 60 dań.');
  return input.map((d:DraftDish)=>{
    const dish=validateDish(d);
    if(!Array.isArray(d.recipe)||d.recipe.length>100)throw new Error('Nieprawidłowa receptura.');
    return {...dish,recipe:d.recipe.map(line=>{
      const ing=validateIngredient({name:line.name,price:line.price,unit:line.price_unit});
      if(!['mg','g','kg','ml','cl','dl','l','szt','cm','m'].includes(line.unit))throw new Error('Nieprawidłowa jednostka receptury.');
      const quantity=numeric(line.quantity,'Ilość',false)!;
      baseQuantity(quantity,line.unit,ing.unit);
      return {name:ing.name,price:ing.price,price_unit:ing.unit,quantity,unit:line.unit,price_origin:['manual','import','estimate'].includes(line.price_origin)?line.price_origin:'import',source_url:typeof line.source_url==='string'&&line.source_url.startsWith('https://')?line.source_url:null,checked_at:typeof line.checked_at==='string'&&Number.isFinite(Date.parse(line.checked_at))?new Date(line.checked_at).toISOString():null};
    })};
  });
}
