import { NextRequest } from 'next/server';
import { kitchenContext,kitchenFailure,kitchenJson,KitchenError } from '@/utils/kitchen/server';
import { validateDish,validateRecipe } from '@/utils/kitchen/validate';
import { dishMetrics,type Ingredient } from '@/utils/kitchen/math';
import {readAll} from '@/utils/kitchen/read-all';
export async function GET(){
  try{const {supabase,userId}=await kitchenContext();
    const [items,ingredients,lines,imports]=await Promise.all([
      readAll((from,to)=>supabase.from('kitchen_items').select('*').eq('user_id',userId).order('id').range(from,to)),
      readAll((from,to)=>supabase.from('inventory_items').select('*').eq('user_id',userId).order('id').range(from,to)),
      readAll((from,to)=>supabase.from('kitchen_recipe_lines').select('dish_id,ingredient_id,quantity,unit').eq('user_id',userId).order('id').range(from,to)),
      readAll((from,to)=>supabase.from('kitchen_imports').select('id,files,status,error,draft,sources,notes,search_suggestions,created_at,lease_until').eq('user_id',userId).order('created_at',{ascending:false}).order('id').range(from,to)),
    ]);
    return kitchenJson({userId,items:items.map(item=>({...item,recipe:lines.filter(l=>l.dish_id===item.id).map(({ingredient_id,quantity,unit})=>({ingredient_id,quantity,unit}))})),ingredients,imports});
  }catch(error){return kitchenFailure(error);}
}
export async function POST(request:NextRequest){
  try{const {supabase,userId}=await kitchenContext();const body=await request.json();
    if(body.kind==='ingredient')throw new KitchenError('Składniki edytujesz teraz w magazynie.',409);
    if(body.kind==='dish'){
      const dish=validateDish(body.dish),recipe=validateRecipe(body.dish.recipe);
      const {data:ingredients,error}=await supabase.from('inventory_items').select('*').eq('user_id',userId).in('id',recipe.map(l=>l.ingredient_id));
      if(error)throw new KitchenError('Nie udało się sprawdzić składników.',503);
      if(recipe.some(l=>!ingredients?.some(i=>i.id===l.ingredient_id)))throw new KitchenError('Wybierz składniki ze swojej bazy.');
      dishMetrics({...dish,recipe},ingredients as Ingredient[]);
      const {data,error:saveError}=await supabase.rpc('kitchen_save_dish',{p_id:body.id||null,p_revision:body.revision||null,p_dish:dish,p_recipe:recipe});
      if(saveError)throw new KitchenError('Nie zapisano dania. Sprawdź jednostki, duplikaty składników lub odśwież widok.',409);
      return kitchenJson({id:data});
    }
    throw new KitchenError('Nieprawidłowa operacja.');
  }catch(error){return kitchenFailure(error);}
}
export async function DELETE(request:NextRequest){
  try{const {supabase,userId}=await kitchenContext();const body=await request.json();
    if(body.confirm!==true)throw new KitchenError('Potwierdź trwałe usunięcie dania i jego receptury.');
    const {data,error}=await supabase.from('kitchen_items').delete().eq('id',body.id).eq('revision',body.revision).eq('user_id',userId).select('id').maybeSingle();
    if(error||!data)throw new KitchenError('Nie usunięto pozycji. Odśwież dane i spróbuj ponownie.',409);
    return kitchenJson({success:true});
  }catch(error){return kitchenFailure(error);}
}
