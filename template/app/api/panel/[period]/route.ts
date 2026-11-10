import {MAX_FILES} from '@/utils/panel/flexible';
import {requestSettings} from '@/utils/global-settings';
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { createClient } from '@/utils/supabase/server';
import { isSubscriber } from '@/utils/supabase/subscription';
import { ownsUpload } from '@/utils/uploads';
import { parseCsv } from '@/utils/panel/csv';
import { calculate, validateMapping, NoSalesInPeriodError } from '@/utils/panel/calculate';
import { mapWithGemini } from '@/utils/panel/gemini';
import { consumeAiQuota } from '@/utils/ai-quota';
import { validPeriod, type Month, type FileRole, type Csv } from '@/utils/panel/types';

export const runtime='nodejs';
export const maxDuration=120;
type RouteContext={params:Promise<{period:string}>};
class HttpError extends Error { constructor(message:string,public status=400){super(message);} }
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
async function context(route:RouteContext) {
  const {period}=await route.params;
  if(!validPeriod(period))throw new HttpError('Dozwolone są miesiące od stycznia 2025 do grudnia 2027.');
  const supabase=await createClient();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user)throw new HttpError('Zaloguj się ponownie.',401);
  if(!await isSubscriber(supabase,user.id))throw new HttpError('Wymagana aktywna subskrypcja.',403);
  return {supabase,userId:user.id,period};
}
type Context=Awaited<ReturnType<typeof context>>;
async function read(ctx:Context):Promise<Month|null>{
  const {data,error}=await ctx.supabase.from('panel_months').select('*').eq('user_id',ctx.userId).eq('period',ctx.period).maybeSingle();
  if(error)throw new HttpError('Nie udało się odczytać danych miesiąca.',503);
  return data as Month|null;
}
function fail(error:unknown){return json({error:error instanceof Error?error.message:'Operacja nie powiodła się.',...(error instanceof NoSalesInPeriodError?{code:error.code,availablePeriods:error.availablePeriods,dateColumn:error.dateColumn,dateFormat:error.dateFormat}:{})},error instanceof HttpError?error.status:422);}
async function download(ctx:Context,month:Month):Promise<Record<FileRole,Csv>> {
  const result={} as Record<FileRole,Csv>;
  const entries=Object.entries(month.files).filter((entry):entry is [string,NonNullable<typeof entry[1]>]=>Boolean(entry[1]));
  if(!entries.length||entries.length>MAX_FILES)throw new HttpError('Upload between one and eight CSV files.');
  for(const [role,file] of entries){
    if(!ownsUpload(file.path,ctx.userId))throw new HttpError('Wybierz CSV ze swojego konta.');
    const {data,error}=await ctx.supabase.storage.from('user-uploads').download(file.path);
    if(error||!data)throw new HttpError('Nie udało się pobrać zapisanego CSV. Dodaj plik ponownie.',503);
    const bytes=Buffer.from(await data.arrayBuffer());
    if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw new HttpError('Plik został zmieniony w magazynie. Dodaj go ponownie.',409);
    result[role]=parseCsv(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
  }
  return result;
}
export async function GET(_request:NextRequest,route:RouteContext){
  try{
    const ctx=await context(route);
    const [month,calendar]=await Promise.all([read(ctx),ctx.supabase.from('panel_months').select('period,revision,report_revision,status').eq('user_id',ctx.userId).order('period')]);
    if(calendar.error)throw new HttpError('Nie udało się odczytać kalendarza.',503);
    return json({month,calendar:calendar.data});
  }catch(error){return fail(error);}
}
export async function PUT(request:NextRequest,route:RouteContext){
  const uploadedPaths:string[]=[];let ctx:Context|undefined;
  try{
    ctx=await context(route);const form=await request.formData();const current=await read(ctx);
    if(current?.lease_until&&Date.parse(current.lease_until)>Date.now())throw new HttpError('Analiza jest w toku. Poczekaj na zakończenie.',409);
    if((form.get('revision')||null)!==(current?.revision||null))throw new HttpError('Dane miesiąca zmieniły się. Odśwież widok.',409);
    let uploads=form.getAll('files');if(!uploads.length&&form.get('file'))uploads=[form.get('file')!];
    if(!uploads.length&&form.get('path')){
      const source=form.get('path');if(!ownsUpload(source,ctx.userId)||!source.toLowerCase().endsWith('.csv'))throw new HttpError('Wybierz CSV ze swojego konta.');
      const {data,error}=await ctx.supabase.storage.from('user-uploads').download(source);if(error||!data)throw new HttpError('Nie udało się pobrać pliku.',503);
      uploads=[new File([data],source.split('/')[1].replace(/^[0-9a-f-]{36}--/,''),{type:'text/csv'})];
    }
    if(!uploads.length||uploads.length>MAX_FILES||uploads.some(f=>!(f instanceof File)))throw new HttpError('Upload between one and eight CSV files.');
    const chosen=uploads as File[];const role=form.get('role');
    if(role&&!(typeof role==='string'&&/^(transactions|products|file_[a-zA-Z0-9-]+)$/.test(role)))throw new HttpError('Wybierz typ pliku.');
    if(role&&chosen.length!==1)throw new HttpError('Replace one file at a time.');
    const files={...current?.files};
    if(Object.keys(files).length+chosen.length-(role&&files[String(role)]?1:0)>MAX_FILES)throw new HttpError('Maximum eight files per month. Remove an unused file first.');
    if(chosen.reduce((n,f)=>n+f.size,0)>60*1024*1024)throw new HttpError('Maximum 60 MB per upload batch.');
    for(const file of chosen){
      if(!file.name.toLowerCase().endsWith('.csv')||!file.size||file.size>20*1024*1024)throw new HttpError('Wybierz niepusty CSV UTF-8, maksymalnie 20 MB.');
      const bytes=Buffer.from(await file.arrayBuffer()),parsed=parseCsv(new TextDecoder('utf-8',{fatal:true}).decode(bytes)),sha256=createHash('sha256').update(bytes).digest('hex');
      if(Object.entries(files).some(([id,f])=>id!==role&&f?.sha256===sha256))throw new HttpError('This file is already included in this month.');
      const name=file.name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]/g,'_');
      const path=ctx.userId+'/'+crypto.randomUUID()+'--'+name;
      const {error}=await ctx.supabase.storage.from('user-uploads').upload(path,bytes,{contentType:'text/csv',upsert:false});if(error)throw new HttpError('Nie udało się zapisać CSV.',503);
      uploadedPaths.push(path);files[typeof role==='string'?role:'file_'+crypto.randomUUID()]={name:file.name,path,size:file.size,uploaded_at:new Date().toISOString(),sha256,headers:parsed.headers};
    }
    const patch={files,revision:crypto.randomUUID(),mapping:null,report_revision:null,status:'idle',error:null,lease_id:null,lease_until:null,updated_at:new Date().toISOString()};
    const query=current?ctx.supabase.from('panel_months').update(patch).eq('user_id',ctx.userId).eq('period',ctx.period).eq('revision',current.revision).or(`lease_until.is.null,lease_until.lt.${new Date().toISOString()}`):ctx.supabase.from('panel_months').insert({...patch,user_id:ctx.userId,period:ctx.period});
    const {data,error}=await query.select('period').maybeSingle();if(error||!data)throw new HttpError('Dane zmieniły się podczas zapisu. Odśwież widok i spróbuj ponownie.',409);
    uploadedPaths.length=0;return json({success:true});
  }catch(error){if(uploadedPaths.length&&ctx)await ctx.supabase.storage.from('user-uploads').remove(uploadedPaths);return fail(error);}
}
export async function DELETE(request:NextRequest,route:RouteContext){
  try{
    const ctx=await context(route),body=await request.json(),month=await read(ctx);
    if(!month||body.revision!==month.revision)throw new HttpError('Pliki zmieniły się. Odśwież widok.',409);
    if(typeof body.fileId!=='string'||!Object.hasOwn(month.files,body.fileId))throw new HttpError('File not found.',404);
    const files={...month.files};delete files[body.fileId];
    const {data,error}=await ctx.supabase.from('panel_months').update({files,revision:crypto.randomUUID(),mapping:null,report_revision:null,status:'idle',error:null,updated_at:new Date().toISOString()}).eq('user_id',ctx.userId).eq('period',ctx.period).eq('revision',month.revision).or(`lease_until.is.null,lease_until.lt.${new Date().toISOString()}`).select('period').maybeSingle();
    if(error||!data)throw new HttpError('Dane miesiąca zmieniły się. Odśwież widok.',409);
    // Detach only: original source files remain in the user's private uploads.
    return json({success:true});
  }catch(error){return fail(error);}
}
export async function POST(request:NextRequest,route:RouteContext){
  let ctx:Context|undefined, lease:string|undefined;
  try{
    ctx=await context(route); const body=await request.json(); const month=await read(ctx);
    if(!month||!Object.values(month.files).some(Boolean))throw new HttpError('Upload at least one sales CSV file.');
    if(body.revision!==month.revision)throw new HttpError('Pliki zmieniły się. Odśwież widok.',409);
    if(!['map','remap','calculate'].includes(body.action))throw new HttpError('Nieprawidłowa operacja.');
    if(month.report&&month.report_revision===month.revision&&(body.action==='map'||body.action==='calculate'&&isDeepStrictEqual({...body.mapping,granularity:body.mapping?.granularity||'items'},{...month.mapping,granularity:month.mapping?.granularity||'items'})))return json({success:true,cached:true});
    if(body.action==='map'&&month.mapping)return json({success:true,cached:true});
    if(body.action!=='calculate'){const quota=await consumeAiQuota(ctx.supabase,ctx.userId,'panel_map');if(!quota.allowed)throw new HttpError(quota.message,429);}
    lease=crypto.randomUUID();
    const {data:claimed,error:claimError}=await ctx.supabase.from('panel_months').update({lease_id:lease,lease_until:new Date(Date.now()+180000).toISOString(),status:body.action!=='calculate'?'mapping':'analyzing',error:null})
      .eq('user_id',ctx.userId).eq('period',ctx.period).eq('revision',month.revision).or(`lease_until.is.null,lease_until.lt.${new Date().toISOString()}`).select('period').maybeSingle();
    if(claimError||!claimed){lease=undefined;throw new HttpError('Ten miesiąc jest już przetwarzany. Spróbuj ponownie za chwilę.',409);}
    const csv=await download(ctx,month);
    const mapping=body.action!=='calculate'?await mapWithGemini(csv,requestSettings(request)):validateMapping(body.mapping,csv);
    const report=body.action==='calculate'?calculate(csv,mapping,ctx.period):null;
    const patch={mapping,...(report?{report,report_revision:month.revision}:body.action==='remap'?{report_revision:null}:{}),status:report?'ready':'mapped',error:null,lease_id:null,lease_until:null,updated_at:new Date().toISOString()};
    const {data:saved,error:saveError}=await ctx.supabase.from('panel_months').update(patch).eq('user_id',ctx.userId).eq('period',ctx.period).eq('revision',month.revision).eq('lease_id',lease).select('period').maybeSingle();
    if(saveError||!saved)throw new HttpError('Nie zapisano wyniku. Odśwież widok i spróbuj ponownie.',503);
    lease=undefined; return json({success:true});
  }catch(error){
    if(ctx&&lease)await ctx.supabase.from('panel_months').update({status:'error',error:error instanceof Error?error.message:'Błąd analizy',lease_id:null,lease_until:null}).eq('user_id',ctx.userId).eq('period',ctx.period).eq('lease_id',lease);
    return fail(error);
  }
}
