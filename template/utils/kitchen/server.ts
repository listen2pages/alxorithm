import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isSubscriber } from '@/utils/supabase/subscription';
export class KitchenError extends Error {constructor(message:string,public status=400){super(message);}}
export const kitchenJson=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export function kitchenFailure(error:unknown){return kitchenJson({error:error instanceof Error?error.message:'Operacja nie powiodła się.'},error instanceof KitchenError?error.status:422);}
export async function kitchenContext(){
  const supabase=await createClient();const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user)throw new KitchenError('Zaloguj się ponownie.',401);
  if(!await isSubscriber(supabase,user.id))throw new KitchenError('Wymagana aktywna subskrypcja.',403);
  return {supabase,userId:user.id};
}
