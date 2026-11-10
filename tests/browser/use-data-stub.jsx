import {useEffect,useState} from 'react';
export function useData(url){const [data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[version,setVersion]=useState(0);useEffect(()=>{fetch(url).then(r=>r.json()).then(setData).finally(()=>setLoading(false));},[url,version]);return {data,error,setError,loading,refresh:()=>setVersion(n=>n+1)};}
