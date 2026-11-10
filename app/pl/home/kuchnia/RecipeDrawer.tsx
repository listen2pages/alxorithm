'use client';
import {useEffect,useId,useRef} from 'react';
import {ArrowUpRight,ChefHat,Clock,X} from 'lucide-react';
import type {Dish,Ingredient} from '@/utils/kitchen/math';
import RecipeDetails from './RecipeDetails';

export default function RecipeDrawer({dish,ingredients,onClose,onEdit,busy=false}:{dish:Dish;ingredients:Ingredient[];onClose:()=>void;onEdit:()=>void;busy?:boolean}){
 const ref=useRef<HTMLDialogElement>(null),title=useId();
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow,dialog=ref.current;dialog?.showModal();document.body.style.overflow='hidden';return()=>{dialog?.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus();};},[]);
 return <dialog ref={ref} className="recipe-drawer" aria-labelledby={title} onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
  <div className="recipe-drawer-frame">
   <header className="recipe-drawer-header"><div className="recipe-drawer-eyebrow"><ChefHat size={16}/><span>{"Receptura"}</span><span className="recipe-drawer-category">{dish.category}</span></div><button type="button" className="recipe-drawer-close" aria-label="Zamknij recepturę" onClick={onClose}><X size={20}/></button><h2 id={title}>{dish.name}</h2>{dish.description&&<p>{dish.description}</p>}<div className="recipe-drawer-meta"><span>{"Receptura na "}{dish.portions} {" porcji"}</span>{dish.prep_minutes!==null&&<span><Clock size={13}/>{dish.prep_minutes} {" min"}</span>}{dish.diet&&<span>{dish.diet}</span>}</div>{dish.allergens.length>0&&<p className="recipe-drawer-allergens"><strong>{"Alergeny:"}</strong> {dish.allergens.join(', ')}</p>}</header>
   <div className="recipe-drawer-body"><RecipeDetails dish={dish} ingredients={ingredients}/></div>
   <footer className="recipe-drawer-footer"><button type="button" className="demo-button demo-button-secondary" onClick={onClose}>{"Wróć do menu"}</button><button type="button" className="demo-button" disabled={busy} onClick={onEdit}>{"Edytuj recepturę "}<ArrowUpRight size={16}/></button></footer>
  </div>
 </dialog>;
}
