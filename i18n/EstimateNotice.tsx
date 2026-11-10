'use client';

import { useLocale } from './navigation';
import { formatMoney } from '@/utils/global-settings';
import type { Report } from '@/utils/panel/types';

const words = {
  en: {
    title: 'Estimated product analysis',
    note: 'Product charts below cover unique catalogue-price matches only. Quantity assumes one unit per matched receipt. Net and tax estimates use catalogue rates. These do not replace recorded receipt totals or establish tax obligations.',
    matched: 'Matched receipts',
    ambiguous: 'Ambiguous',
    unmatched: 'Unmatched',
    revenue: 'Attributed revenue',
    net: 'Estimated net',
    tax: 'Estimated tax',
  },
  pl: {
    title: 'Szacunkowa analiza produktów',
    note: 'Wykresy produktów obejmują tylko jednoznaczne dopasowania cen katalogowych. Ilość zakłada jedną sztukę na dopasowany paragon. Szacunki netto i podatku wykorzystują stawki katalogowe. Nie zastępują rzeczywistych sum paragonów ani nie ustalają zobowiązań podatkowych.',
    matched: 'Dopasowane paragony',
    ambiguous: 'Niejednoznaczne',
    unmatched: 'Niedopasowane',
    revenue: 'Przypisany przychód',
    net: 'Szacowane netto',
    tax: 'Szacowany podatek',
  },
  ru: {
    title: 'Оценочный анализ товаров',
    note: 'Графики товаров включают только однозначные совпадения каталожных цен. Количество предполагает одну единицу на сопоставленный чек. Оценки сумм без налога и налога используют ставки каталога. Они не заменяют фактические итоги чеков и не устанавливают налоговые обязательства.',
    matched: 'Сопоставленные чеки',
    ambiguous: 'Неоднозначные',
    unmatched: 'Несопоставленные',
    revenue: 'Распределённая выручка',
    net: 'Оценка без налога',
    tax: 'Оценка налога',
  },
};

export default function EstimateNotice({ report: r }: { report: Report }) {
  const language = useLocale();
  const p = r.productEstimates;
  if (!p) return null;
  const w = words[language];
  const money = (v: number | null) => (v === null ? '—' : formatMoney(v, r.currency || ''));
  return (
    <div className="demo-stock-note mb-4">
      <strong>{w.title}</strong>
      <p>{w.note}</p>
      <p>
        {w.matched}: {p.matchedReceipts} · {w.ambiguous}: {p.ambiguousReceipts} · {w.unmatched}:{' '}
        {p.unmatchedReceipts}
      </p>
      <p>
        {w.revenue}: {money(p.revenue)} · {w.net}: {money(p.net)} · {w.tax}: {money(p.tax)}
      </p>
    </div>
  );
}
