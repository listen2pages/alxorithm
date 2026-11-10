import {formatMoney,getCurrency} from '@/utils/global-settings';
import {dishMetrics,type Dish,type Ingredient} from '@/utils/kitchen/math';
const money=(n:number|null)=>n===null?"No data":formatMoney(n,getCurrency(),"en-GB");
const unitLabel=(unit:string)=>unit==='szt'?"pcs":unit;
export default function RecipeDetails({dish,ingredients}:{dish:Dish;ingredients:Ingredient[]}){
 const metrics=dishMetrics(dish,ingredients);
 const lines=dish.recipe.map((line,index)=>({...line,ingredient:ingredients.find(item=>item.id===line.ingredient_id),cost:metrics.lines[index]}));
 const total=metrics.portionCost===null?null:metrics.portionCost*dish.portions;
 return <div className="recipe-details">
  <div className="recipe-metrics">{[["Cost per portion",money(metrics.portionCost)],["Selling price",money(dish.sale_price)],["Gross margin",metrics.margin===null?"No data":metrics.margin.toFixed(1)+'%']].map(([label,value])=><div key={label}><span>{label}</span><output>{value}</output></div>)}</div>
  {dish.estimated_fields.length>0&&<p className="recipe-estimate-note">{"Contains estimates or fields to verify"}</p>}
  <div className="recipe-section-heading"><h3>{"Ingredients"}</h3><span>{lines.length}</span></div>
  {!lines.length?<div className="demo-empty">{"This dish has no recipe yet. Add ingredients in the editor."}</div>:<div className="recipe-ingredients"><table><thead><tr><th>{"Ingredient"}</th><th>{"Quantity"}</th><th>{"Cost"}</th></tr></thead><tbody>{lines.map((line,index)=><tr key={line.ingredient_id+'-'+index}><td><strong>{line.ingredient?.name||"Ingredient unavailable"}</strong><small>{money(line.ingredient?.price??null)} / {unitLabel(line.ingredient?.unit||line.unit)}{line.ingredient?.price_origin==='estimate'&&<span className="recipe-estimated-price"> {" · Market estimate"}</span>}</small>{line.ingredient?.source_url&&<a href={line.ingredient.source_url} target="_blank" rel="noreferrer">{"Source · "}{line.ingredient.checked_at?.slice(0,10)}</a>}</td><td>{line.quantity} {unitLabel(line.unit)}</td><td>{money(line.cost)}</td></tr>)}</tbody><tfoot><tr><th colSpan={2}>{"Recipe cost"}</th><td>{money(total)}</td></tr></tfoot></table></div>}
  <div className="recipe-profit"><span>{"Profit per portion"}</span><strong>{money(metrics.profit)}</strong></div>
  <details className="recipe-cost-breakdown"><summary>{"Cost breakdown"}</summary>{total!==null&&total>0?[...lines].sort((a,b)=>(b.cost??0)-(a.cost??0)).slice(0,5).map((line,index)=>{const share=(line.cost??0)/total*100;return <div key={line.ingredient_id+'-'+index} className="recipe-cost-row"><span>{line.ingredient?.name||"Ingredient unavailable"}</span><div><span style={{width:share+'%'}}/></div><strong>{share.toFixed(0)}%</strong></div>;}):<p className="demo-muted">{"Enter ingredient prices to see the cost breakdown."}</p>}<p className="demo-muted">{"Gross margin = (gross price − gross ingredient cost) / gross price. Excludes labour and fixed costs."}</p></details>
 </div>;
}
