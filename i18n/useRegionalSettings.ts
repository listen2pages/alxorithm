'use client';
import {useEffect,useSyncExternalStore} from 'react';
import {getSettings,setDisplayCurrency,subscribeCurrency,currencySnapshot} from '@/utils/global-settings';
export function useRegionalSettings(){
  const currency=useSyncExternalStore(subscribeCurrency,currencySnapshot,()=> '');
  useEffect(()=>setDisplayCurrency(getSettings().currency),[]);
  return currency;
}
