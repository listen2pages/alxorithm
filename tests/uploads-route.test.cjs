const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { NextRequest } = require('next/server');
function load(file, mocks = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('exports', 'require', source)(exports, name => mocks[name] || require(name));
  return exports;
}
test('upload routes enforce access and persist, list, download and delete files', async () => {
  let user = null;
  let subscribed = false;
  const objects = new Map();
  const storage = {
    async list(folder) { return { data: [...objects].filter(([path]) => path.startsWith(folder + '/')).map(([path, file]) => ({ id: path, name: path.split('/')[1], metadata: { size: file.size }, created_at: '2026-09-13T12:00:00Z' })), error: null }; },
    async upload(path, file, options) { assert.equal(options.upsert, false); objects.set(path, file); return { error: null }; },
    async remove(paths) { paths.forEach(path => objects.delete(path)); return { error: null }; },
    async createSignedUrl(path, ttl) { assert.equal(ttl, 60); return { data: { signedUrl: 'https://example.test/' + path }, error: null }; },
  };
  const api = load('app/api/uploads/route.ts', {
    '@/utils/supabase/server': { createClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) }, from: () => { const query={select:()=>query,eq:()=>query,contains:()=>query,limit:()=>query,then:resolve=>Promise.resolve({data:[],error:null}).then(resolve)};return query; }, storage: { from: bucket => { assert.equal(bucket, 'user-uploads'); return storage; } } }) },
    '@/utils/supabase/subscription': { isSubscriber: async () => subscribed },
    '@/utils/uploads': load('utils/uploads.ts'),
  });
  const get = () => new NextRequest('http://localhost/api/uploads');
  assert.equal((await api.GET(get())).status, 401);
  user = { id: 'owner' };
  assert.equal((await api.GET(get())).status, 403);
  subscribed = true;
  for (let i = 0; i < 2; i++) {
    const form = new FormData(); form.append('file', new File(['item,price\nSoup,12'], 'report.csv', { type: 'text/csv' }));
    const response = await api.POST(new NextRequest('http://localhost/api/uploads', { method: 'POST', body: form }));
    assert.equal(response.status, 201);
  }
  const { files } = await (await api.GET(get())).json();
  assert.equal(files.length, 2);
  assert.notEqual(files[0].path, files[1].path);
  assert.equal(files[0].name, 'report.csv');
  assert.equal((await api.GET(new NextRequest('http://localhost/api/uploads?path=other/report.csv'))).status, 400);
  assert.equal((await api.GET(new NextRequest('http://localhost/api/uploads?path=' + encodeURIComponent(files[0].path)))).status, 200);
  assert.equal((await api.DELETE(new NextRequest('http://localhost/api/uploads', { method: 'DELETE', body: JSON.stringify({ path: files[0].path }) }))).status, 200);
  assert.equal((await (await api.GET(get())).json()).files.length, 1);
});
test('middleware preserves visitors and directs subscribers without redirect loops', async () => {
  let user = null; let subscribed = false; let unavailable = false;
  const { middleware } = load('middleware.ts', {
    '@/i18n/routing': require('./helpers/ts-loader.cjs').load('i18n/routing.ts'),
    '@supabase/ssr': { createServerClient: () => ({ auth: { getUser: async () => ({ data: { user } }) } }) },
    '@/utils/supabase/subscription': { isSubscriber: async () => { if (unavailable) throw new Error('offline'); return subscribed; } },
  });
  const previousUrl=process.env.NEXT_PUBLIC_SUPABASE_URL,previousKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL='https://test.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='test-public-key';
  const visit = path => middleware(new NextRequest('http://localhost' + path));
  assert.equal((await visit('/')).status, 200);
  assert.equal((await visit('/home')).headers.get('location'), 'http://localhost/login');
  user = { id: 'owner' };
  assert.equal((await visit('/demo')).status, 200);
  assert.equal((await visit('/home/panel')).headers.get('location'), 'http://localhost/cennik');
  subscribed = true;
  assert.equal((await visit('/')).headers.get('location'), 'http://localhost/home');
  assert.equal((await visit('/login')).headers.get('location'), 'http://localhost/home');
  assert.equal((await visit('/home')).status, 200);
  unavailable = true;
  assert.equal((await visit('/home')).status, 503);
  assert.equal((await visit('/')).status, 200);
  for(const locale of ['pl','ru']){
    subscribed=true;unavailable=false;
    assert.equal((await visit('/'+locale+'/login')).headers.get('location'),'http://localhost/'+locale+'/home');
    assert.equal((await visit('/'+locale+'/home')).status,200);
    user=null;
    assert.equal((await visit('/'+locale+'/home/panel')).headers.get('location'),'http://localhost/'+locale+'/login');
    user={id:'owner'};
  }
  if(previousUrl===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=previousUrl;
  if(previousKey===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY=previousKey;
});
