export type CategoryKind='main'|'starter'|'food'|'drink'|'alcohol'|'other';
export function categoryKind(value:string,groups?:Record<string,CategoryKind>):CategoryKind {
  if(groups?.[value])return groups[value];
  const s=value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ł/g,'l').trim();
  if(/^(alcohol|alkohol|алкоголь|beer|wine|cocktails?|spirits|biere|vin|cerveza)$/.test(s))return 'alcohol';
  if(/^(beverages?|drinks?|napoje|напитки|boissons|bebidas|tea|coffee|soft drinks)$/.test(s))return 'drink';
  if(/^(starters?|appetizers?|przystawki|закуски|entradas|entrees)$/.test(s))return 'starter';
  if(/^(main( courses?|s| dishes)?|dania glowne|основные блюда|ramen|sushi|plats principaux)$/.test(s))return 'main';
  if(/^(food|jedzenie|еда|desserts?|desserts|десерты|salads?|soups?|pizza|pasta|burgers?)$/.test(s))return 'food';
  return 'other';
}
