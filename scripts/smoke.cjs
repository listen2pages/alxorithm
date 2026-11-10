const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://localhost:3001';
const paths=['','/demo','/cennik','/login','/regulamin','/polityka-prywatnosci','/demo/panel_demo','/demo/kuchnia_demo','/demo/personel_demo','/demo/magazyn_demo'];
const tasks=['en','pl','ru'].flatMap(locale=>paths.map(path=>({locale,path:(locale==='en'?'':'/'+locale)+path||'/'})));
async function check({locale,path}){
 const r=await fetch(base+path),html=await r.text();assert.equal(r.status,200,path);
 assert.match(html,new RegExp(`<html[^>]*lang="${locale}"`),path+' language');
 assert.ok(html.includes('https://alxorithm.com'+(path==='/'?'':path)),path+' metadata');
 assert.ok(!html.includes('https://www.jedzeniewarszawa.pl'),path+' old domain');
 assert.equal(r.headers.get('Content-Language'),locale,path+' header');
}
(async()=>{for(let i=0;i<tasks.length;i+=4)await Promise.all(tasks.slice(i,i+4).map(check));
 const sitemap=await(await fetch(base+'/sitemap.xml')).text();assert.ok(sitemap.includes('hreflang="ru"'));assert.ok(sitemap.includes('/pl/demo'));assert.ok(!sitemap.includes('/home'));
 const removed=['/blog','/blog/terminal-platniczy','/blog/kategoria/sprzet','/blog/terminal-patniczy-mbank','/amici','/kuchnia/restauracja-wloska','/dlafirm'];
 for(const locale of ['en','pl','ru'])for(const path of removed){const prefix=locale==='en'?'':'/'+locale;const response=await fetch(base+prefix+path,{redirect:'manual'});assert.equal(response.status,404,prefix+path);assert.ok(!sitemap.includes('https://alxorithm.com'+prefix+path));}
 const robots=await(await fetch(base+'/robots.txt')).text();assert.ok(robots.includes('Disallow: /ru/home'));assert.ok(robots.includes('https://alxorithm.com/sitemap.xml'));
 for(const [url,destination] of [['/en/demo','/demo'],['/pl/menu','/pl/demo/kuchnia_demo'],['/ru/menu','/ru/demo/kuchnia_demo']]){const r=await fetch(base+url,{redirect:'manual'});assert.ok([307,308].includes(r.status),url);assert.equal(new URL(r.headers.get('location'),base).pathname,destination);}
 for(const locale of ['en','pl','ru']){const prefix=locale==='en'?'':'/'+locale,r=await fetch(base+prefix+'/home/panel',{redirect:'manual'});assert.equal(r.status,307);assert.equal(new URL(r.headers.get('location'),base).pathname,prefix+'/login');}
 console.log(`Passed: ${tasks.length} localized pages, sitemap, robots, legacy redirects and private-route guards.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
