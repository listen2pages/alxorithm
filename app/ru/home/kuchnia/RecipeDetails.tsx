import {formatMoney,getCurrency} from '@/utils/global-settings';
import {dishMetrics,type Dish,type Ingredient} from '@/utils/kitchen/math';
const money=(n:number|null)=>n===null?"Нет данных":formatMoney(n,getCurrency(),"ru-RU");
const unitLabel=(unit:string)=>unit==='szt'?"шт.":unit;
export default function RecipeDetails({dish,ingredients}:{dish:Dish;ingredients:Ingredient[]}){
 const metrics=dishMetrics(dish,ingredients);
 const lines=dish.recipe.map((line,index)=>({...line,ingredient:ingredients.find(item=>item.id===line.ingredient_id),cost:metrics.lines[index]}));
 const total=metrics.portionCost===null?null:metrics.portionCost*dish.portions;
 return <div className="recipe-details">
  <div className="recipe-metrics">{[["Стоимость порции",money(metrics.portionCost)],["Цена продажи",money(dish.sale_price)],["Валовая маржа",metrics.margin===null?"Нет данных":metrics.margin.toFixed(1)+'%']].map(([label,value])=><div key={label}><span>{label}</span><output>{value}</output></div>)}</div>
  {dish.estimated_fields.length>0&&<p className="recipe-estimate-note">{"Содержит оценки или поля для проверки"}</p>}
  <div className="recipe-section-heading"><h3>{"Ингредиенты"}</h3><span>{lines.length}</span></div>
  {!lines.length?<div className="demo-empty">{"У этого блюда пока нет рецептуры. Добавьте ингредиенты в редакторе."}</div>:<div className="recipe-ingredients"><table><thead><tr><th>{"Ингредиент"}</th><th>{"Количество"}</th><th>{"Стоимость"}</th></tr></thead><tbody>{lines.map((line,index)=><tr key={line.ingredient_id+'-'+index}><td><strong>{line.ingredient?.name||"Ингредиент недоступен"}</strong><small>{money(line.ingredient?.price??null)} / {unitLabel(line.ingredient?.unit||line.unit)}{line.ingredient?.price_origin==='estimate'&&<span className="recipe-estimated-price"> {" · Рыночная оценка"}</span>}</small>{line.ingredient?.source_url&&<a href={line.ingredient.source_url} target="_blank" rel="noreferrer">{"Источник · "}{line.ingredient.checked_at?.slice(0,10)}</a>}</td><td>{line.quantity} {unitLabel(line.unit)}</td><td>{money(line.cost)}</td></tr>)}</tbody><tfoot><tr><th colSpan={2}>{"Себестоимость рецептуры"}</th><td>{money(total)}</td></tr></tfoot></table></div>}
  <div className="recipe-profit"><span>{"Прибыль с порции"}</span><strong>{money(metrics.profit)}</strong></div>
  <details className="recipe-cost-breakdown"><summary>{"Структура затрат"}</summary>{total!==null&&total>0?[...lines].sort((a,b)=>(b.cost??0)-(a.cost??0)).slice(0,5).map((line,index)=>{const share=(line.cost??0)/total*100;return <div key={line.ingredient_id+'-'+index} className="recipe-cost-row"><span>{line.ingredient?.name||"Ингредиент недоступен"}</span><div><span style={{width:share+'%'}}/></div><strong>{share.toFixed(0)}%</strong></div>;}):<p className="demo-muted">{"Укажите цены ингредиентов для структуры затрат."}</p>}<p className="demo-muted">{"Валовая маржа = (цена с НДС − стоимость ингредиентов с НДС) / цена с НДС. Без труда и постоянных расходов."}</p></details>
 </div>;
}
