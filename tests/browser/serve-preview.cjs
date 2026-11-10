// Build the isolated fixture described in PHASE_7_10_NOTES.md first.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const bundle=path.resolve('.next-demo-check/kitchen-preview.js');
const cssDir=path.resolve('.next-demo-check/static/css');
const css=fs.readdirSync(cssDir).filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync(path.join(cssDir,f))).join('\n');
http.createServer((req,res)=>{
  if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');return res.end(fs.readFileSync(bundle));}
  if(req.url==='/style.css'){res.setHeader('Content-Type','text/css');return res.end(css);}
  res.setHeader('Content-Type','text/html; charset=utf-8');
  if(req.url==='/mobile')return res.end('<iframe title="Mobile kitchen test" src="/" style="width:390px;height:850px;border:1px solid #ddd"></iframe>');
  res.end('<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"><title>Kitchen test fixture</title><body><div id="root"></div><script src="/bundle.js"></script></body></html>');
}).listen(4318,'127.0.0.1',()=>console.log('Synthetic kitchen fixture: http://127.0.0.1:4318'));
