const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const out={};cache.set(file,out);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;new Function('exports','require',code)(out,name=>{if(!name.startsWith('.')&&!name.startsWith('@/'))return require(name);const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name);return load(fs.existsSync(base+'.tsx')?base+'.tsx':base+'.ts');});return out;}
test('flexible upload and report guidance render with one-file support and only missing-data requests',()=>{
 const ImportFiles=load('i18n/ImportFiles.tsx').default,Editor=load('i18n/FlexibleMappingEditor.tsx').default,Coverage=load('i18n/DataCoverage.tsx').default;
 const empty=renderToStaticMarkup(React.createElement(ImportFiles,{files:{},mapping:null,existing:[],disabled:false,onAdd:()=>{},onRemove:()=>{}}));assert.match(empty,/multiple=""/);assert.match(empty,/single detailed sales CSV/);
 const {fields}=load('utils/panel/types.ts');const mapping={version:2,lineFile:'one',fileKinds:{one:'items'},granularity:'items',joins:[],fields:Object.fromEntries(fields.map(f=>[f,null])),moneyMode:'line',tipMode:'line',dateFormat:'iso'};
 const editor=renderToStaticMarkup(React.createElement(Editor,{value:mapping,files:{one:{name:'sales.csv',headers:['Name','Amount']}},onChange:()=>{},disabled:false}));assert.match(editor,/sales.csv/);assert.match(editor,/Separate payment file/);assert.ok(!editor.includes('Estimate products by price'));
 const full={posData:[{kategoria:'Food'}],totals:{gross:10,net:9,vat:1,quantity:1,receipts:1},dailyTrend:[{}],hourlyTrend:[{}],paymentStats:[{}],employeeStats:[{tips:0}],sourceStats:[{}]};
 assert.match(renderToStaticMarkup(React.createElement(Coverage,{report:full})),/No additional upload is required/);
 const partial={...full,granularity:'receipts',posData:[],totals:{...full.totals,net:null,vat:null,quantity:null}};
 const html=renderToStaticMarkup(React.createElement(Coverage,{report:partial}));assert.match(html,/actual sold-item rows/);assert.match(html,/Tax and net totals/);assert.ok(!html.includes('Payment methods:'));assert.ok(!html.includes('Daily trends:'));assert.ok(!html.includes('Receipt count and baskets:'));
});
