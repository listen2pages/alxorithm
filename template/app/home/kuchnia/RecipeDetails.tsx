import {formatMoney,getCurrency} from '@/utils/global-settings';
import {dishMetrics,type Dish,type Ingredient} from '@/utils/kitchen/math';
const money=(n:number|null)=>n===null?'Brak danych':formatMoney(n,getCurrency(),'pl-PL');
const unitLabel=(unit:string)=>unit==='szt'?'szt.':unit;
export default function RecipeDetails({dish,ingredients}:{dish:Dish;ingredients:Ingredient[]}){
 const metrics=dishMetrics(dish,ingredients);
 const lines=dish.recipe.map((line,index)=>({...line,ingredient:ingredients.find(item=>item.id===line.ingredient_id),cost:metrics.lines[index]}));
 const total=metrics.portionCost===null?null:metrics.portionCost*dish.portions;
 return <div className="recipe-details">
  <div className="recipe-metrics">{[['Koszt jednej porcji',money(metrics.portionCost)],['Cena sprzedaży',money(dish.sale_price)],['Marża brutto',metrics.margin===null?'Brak danych':metrics.margin.toFixed(1)+'%']].map(([label,value])=><div key={label}><span>{label}</span><output>{value}</output></div>)}</div>
  {dish.estimated_fields.length>0&&<p className="recipe-estimate-note">Zawiera szacunki lub pola do weryfikacji</p>}
  <div className="recipe-section-heading"><h3>Składniki</h3><span>{lines.length}</span></div>
  {!lines.length?<div className="demo-empty">To danie nie ma jeszcze receptury. Dodaj składniki w edytorze.</div>:<div className="recipe-ingredients"><table><thead><tr><th>Składnik</th><th>Ilość</th><th>Koszt</th></tr></thead><tbody>{lines.map((line,index)=><tr key={line.ingredient_id+'-'+index}><td><strong>{line.ingredient?.name||'Składnik niedostępny'}</strong><small>{money(line.ingredient?.price??null)} / {unitLabel(line.ingredient?.unit||line.unit)}{line.ingredient?.price_origin==='estimate'&&<span className="recipe-estimated-price"> · Szacunek rynkowy</span>}</small>{line.ingredient?.source_url&&<a href={line.ingredient.source_url} target="_blank" rel="noreferrer">Źródło · {line.ingredient.checked_at?.slice(0,10)}</a>}</td><td>{line.quantity} {unitLabel(line.unit)}</td><td>{money(line.cost)}</td></tr>)}</tbody><tfoot><tr><th colSpan={2}>Koszt receptury</th><td>{money(total)}</td></tr></tfoot></table></div>}
  <div className="recipe-profit"><span>Zysk na porcji</span><strong>{money(metrics.profit)}</strong></div>
  <details className="recipe-cost-breakdown"><summary>Struktura kosztów</summary>{total!==null&&total>0?[...lines].sort((a,b)=>(b.cost??0)-(a.cost??0)).slice(0,5).map((line,index)=>{const share=(line.cost??0)/total*100;return <div key={line.ingredient_id+'-'+index} className="recipe-cost-row"><span>{line.ingredient?.name||'Składnik niedostępny'}</span><div><span style={{width:share+'%'}}/></div><strong>{share.toFixed(0)}%</strong></div>;}):<p className="demo-muted">Uzupełnij ceny składników, aby zobaczyć udział w kosztach.</p>}<p className="demo-muted">Marża brutto = (cena brutto − koszt składników brutto) / cena brutto. Bez pracy i kosztów stałych.</p></details>
 </div>;
}
