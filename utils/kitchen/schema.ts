const string={type:'string'};
const number={type:['number','null']};
const strings={type:'array',items:string};
const object=(properties:Record<string,unknown>)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
export const kitchenSchema=object({complete:{type:'boolean'},items:{type:'array',items:object({
  name:string,category:string,sale_price:number,vat:number,prep_minutes:number,status:string,diet:string,
  allergens:strings,description:string,portions:{type:'number'},estimated_fields:strings,
  recipe:{type:'array',items:object({
    name:string,quantity:{type:'number'},unit:{type:'string',enum:['g','kg','ml','l','szt']},
    price:number,price_unit:{type:'string',enum:['kg','l','szt']},price_origin:{type:'string',enum:['import']},
    source_url:{type:'null'},checked_at:{type:'null'},
  })},
})}});
