const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader.cjs');
const {localizedPath,stripLocale,languageAlternates}=load('i18n/routing.ts');
test('locale switching preserves canonical English URLs, private routes and API endpoints',()=>{
  assert.equal(localizedPath('/home/panel?month=2026-03','ru'),'/ru/home/panel?month=2026-03');
  assert.equal(localizedPath('/','pl'),'/pl');
  assert.equal(localizedPath('/home','en'),'/home');
  assert.equal(localizedPath('/api/uploads','ru'),'/api/uploads');
  assert.equal(localizedPath('https://buy.stripe.com/example','pl'),'https://buy.stripe.com/example');
  assert.equal(stripLocale('/ru/home/panel'),'/home/panel');
  assert.deepEqual(languageAlternates('https://alxorithm.com/pl/demo'),{en:'https://alxorithm.com/demo',pl:'https://alxorithm.com/pl/demo',ru:'https://alxorithm.com/ru/demo','x-default':'https://alxorithm.com/demo'});
});
test('retired public features stay absent from source, localized output and navigation',()=>{
  for(const locale of ['en','pl','ru']){
    for(const directory of ['blog','[id]','kuchnia','dlafirm']){
      const target=`app/${locale}/${directory}`;
      assert.ok(!fs.existsSync(target)||fs.readdirSync(target).length===0,target);
    }
    for(const file of [`app/${locale}/B2BLandingClient.tsx`,`app/${locale}/cennik/page.tsx`])assert.ok(!fs.readFileSync(file,'utf8').includes('href="/blog"'));
    assert.ok(fs.existsSync(`app/${locale}/home/kuchnia/page.tsx`));
  }
});
test('all extracted presentation messages have English, Polish and Russian translations',()=>{
  const extracted=JSON.parse(fs.readFileSync('i18n/extracted.json'));
  const en=JSON.parse(fs.readFileSync('i18n/en.json')),pl=JSON.parse(fs.readFileSync('i18n/pl.json')),ru=JSON.parse(fs.readFileSync('i18n/ru.json'));
  assert.deepEqual(Object.keys(en).sort(),Object.keys(pl).sort());assert.deepEqual(Object.keys(ru).sort(),Object.keys(pl).sort());
  for(const {id,text} of extracted){if(id===1105)continue;assert.ok(en[text],text);assert.equal(pl[text],text);assert.ok(ru[text],text);}
});
test('all language variants preserve prices, shared payment links, database API paths and original CSS',()=>{
  const original=fs.readFileSync('template/app/cennik/page.tsx','utf8');
  const payment=original.match(/https:\/\/buy\.stripe\.com\/\w+/)[0];
  for(const locale of ['en','pl','ru']){
    assert.ok(fs.readFileSync(`app/${locale}/cennik/page.tsx`,'utf8').includes(payment));
    assert.ok(fs.readFileSync(`app/${locale}/home/HomeClient.tsx`,'utf8').includes("'/api/uploads'"));
    assert.equal(fs.readFileSync(`app/${locale}/landing.css`,'utf8'),fs.readFileSync('template/app/landing.css','utf8'));
  }
});
