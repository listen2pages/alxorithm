export function validWorkspaceMonth(value:unknown):value is string{return typeof value==='string'&&/^202[567]-(0[1-9]|1[0-2])$/.test(value);}
export function isWorkspacePath(path:string){return /^\/(?:(?:en|pl|ru)\/)?home(?:[/?#]|$)/.test(path);}
export function withWorkspaceMonth(href:string,period:string|null){
 if(!validWorkspaceMonth(period)||!isWorkspacePath(href))return href;
 const url=new URL(href,'https://workspace.invalid');
 if(!url.searchParams.has('month'))url.searchParams.set('month',period);
 return url.pathname+url.search+url.hash;
}
