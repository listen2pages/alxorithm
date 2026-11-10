const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
exports.load=function load(file,mocks={}){
  const out={};const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  new Function('exports','require',source)(out,name=>mocks[name]||(name.startsWith('.')?load(path.resolve(path.dirname(file),name+'.ts'),mocks):name.startsWith('@/')?load(path.resolve(name.slice(2)+'.ts'),mocks):require(name)));
  return out;
};
exports.database=function database(tables){
  return {from(table){
    tables[table]||=[];const predicates=[];let action='select',values,maximum=Infinity;
    const q={select(){return q;},eq(k,v){predicates.push(r=>r[k]===v);return q;},neq(k,v){predicates.push(r=>r[k]!==v);return q;},order(){return q;},limit(n){maximum=n;return q;},
      or(){predicates.push(r=>!r.lease_until||Date.parse(r.lease_until)<Date.now());return q;},
      update(v){action='update';values=v;return q;},insert(v){action='insert';values=v;return q;},
      async run(single=false){let rows=tables[table].filter(r=>predicates.every(p=>p(r))).slice(0,maximum);
        if(action==='insert'){const row={id:crypto.randomUUID(),...values};tables[table].push(row);rows=[row];}
        if(action==='update')rows.forEach(r=>Object.assign(r,values));
        return {data:structuredClone(single?rows[0]||null:rows),error:null};
      },maybeSingle(){return q.run(true);},single(){return q.run(true);},then(resolve,reject){return q.run().then(resolve,reject);}};
    return q;
  }};
};
