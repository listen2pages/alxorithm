import {NextRequest} from 'next/server';
import sharp from 'sharp';
import {context,json,failure,HttpError} from '@/utils/workspace/server';
export const runtime='nodejs';
export async function POST(request:NextRequest){try{
  const {supabase,userId}=await context(),form=await request.formData(),file=form.get('file');
  if(!(file instanceof File)||file.size<=0||file.size>5*1024*1024)throw new HttpError('Wybierz zdjęcie PNG, JPG lub WEBP, do 5 MB.');
  const original=Buffer.from(await file.arrayBuffer());const image=sharp(original,{limitInputPixels:20000000});const metadata=await image.metadata();
  if(!['png','jpeg','webp'].includes(metadata.format||''))throw new HttpError('Dozwolone formaty: PNG, JPG, WEBP.');
  const bytes=await image.rotate().resize(1200,1200,{fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer();
  const path=userId+'/'+crypto.randomUUID()+'.webp';const {error}=await supabase.storage.from('workspace-images').upload(path,bytes,{contentType:'image/webp',upsert:false});if(error)throw new HttpError('Nie udało się zapisać zdjęcia.',503);
  const {data}=await supabase.storage.from('workspace-images').createSignedUrl(path,3600);return json({path,url:data?.signedUrl||null});
}catch(error){return failure(error);}}
