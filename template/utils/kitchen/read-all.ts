// Supabase defaults to 1,000 rows per response. A partial recipe would understate its cost.
export async function readAll<T>(page:(from:number,to:number)=>PromiseLike<{data:T[]|null;error:unknown}>):Promise<T[]>{
  const rows:T[]=[];
  for(let from=0;from<100000;from+=1000){
    const result=await page(from,from+999);
    if(result.error||!result.data)throw new Error('Nie udało się odczytać kompletnej bazy kuchni.');
    rows.push(...result.data);
    if(result.data.length<1000)return rows;
  }
  throw new Error('Baza przekracza limit odczytu. Skontaktuj się z obsługą.');
}
