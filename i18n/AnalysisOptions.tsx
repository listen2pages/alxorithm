'use client';

import { useLocale } from './navigation';
import type { Mapping, MonthFiles } from '@/utils/panel/types';

const text = {
  en: {
    currency: 'Report currency',
    unknown: 'Unknown (amounts only)',
    numbers: 'Number format',
    auto: 'Auto',
    comma: 'Decimal comma: 1.234,56',
    point: 'Decimal point: 1,234.56',
    tax: 'Tax rate format',
    percent: 'Percent: 8 means 8%',
    fraction: 'Fraction: 0.08 means 8%',
    net: 'Net amount basis',
    line: 'Line total',
    unit: 'Unit price × quantity',
    estimate: 'Estimate products by price',
    note: 'I confirm that each receipt contains one unit at its catalogue price, without discounts. Only unique gross-price matches are attributed. These are estimates; ambiguous and unmatched receipts remain unclassified. Receipt totals stay factual.',
    name: 'Catalogue product name',
    code: 'Product code',
    category: 'Category',
    gross: 'Gross unit price',
    netprice: 'Net unit price',
    rate: 'Tax rate',
    missing: 'Not mapped',
  },
  pl: {
    currency: 'Waluta raportu',
    unknown: 'Nieznana (same kwoty)',
    numbers: 'Format liczb',
    auto: 'Automatycznie',
    comma: 'Przecinek dziesiętny: 1.234,56',
    point: 'Kropka dziesiętna: 1,234.56',
    tax: 'Format stawki podatku',
    percent: 'Procent: 8 oznacza 8%',
    fraction: 'Ułamek: 0.08 oznacza 8%',
    net: 'Znaczenie kwoty netto',
    line: 'Suma pozycji',
    unit: 'Cena jednostkowa × ilość',
    estimate: 'Szacuj produkty według ceny',
    note: 'Potwierdzam, że każdy paragon zawiera jedną sztukę w cenie katalogowej, bez rabatu. Przypisujemy tylko jednoznaczne dopasowania cen brutto. To szacunki; niejednoznaczne i niedopasowane paragony pozostają bez przypisania. Sumy paragonów pozostają rzeczywiste.',
    name: 'Nazwa produktu w katalogu',
    code: 'Kod produktu',
    category: 'Kategoria',
    gross: 'Cena jednostkowa brutto',
    netprice: 'Cena jednostkowa netto',
    rate: 'Stawka podatku',
    missing: 'Nie wskazano',
  },
  ru: {
    currency: 'Валюта отчёта',
    unknown: 'Неизвестна (только суммы)',
    numbers: 'Формат чисел',
    auto: 'Автоматически',
    comma: 'Десятичная запятая: 1.234,56',
    point: 'Десятичная точка: 1,234.56',
    tax: 'Формат ставки налога',
    percent: 'Процент: 8 означает 8%',
    fraction: 'Доля: 0.08 означает 8%',
    net: 'Основа суммы без налога',
    line: 'Сумма строки',
    unit: 'Цена единицы × количество',
    estimate: 'Оценить товары по цене',
    note: 'Подтверждаю, что каждый чек содержит одну единицу по каталожной цене без скидок. Учитываются только однозначные совпадения цен с налогом. Это оценки; неоднозначные и несопоставленные чеки остаются без товара. Итоги чеков остаются фактическими.',
    name: 'Название товара в каталоге',
    code: 'Код товара',
    category: 'Категория',
    gross: 'Цена единицы с налогом',
    netprice: 'Цена единицы без налога',
    rate: 'Ставка налога',
    missing: 'Не сопоставлено',
  },
};

export default function AnalysisOptions({
  value: v,
  onChange,
  files,
  disabled,
}: {
  value: Mapping;
  onChange: (v: Mapping) => void;
  files: MonthFiles;
  disabled: boolean;
}) {
  const language = useLocale();
  const w = text[language];
  const other = v.lineFile === 'transactions' ? 'products' : 'transactions';
  const headers = files[other]?.headers || [];
  const choose = (pattern: RegExp) => headers.find(h => pattern.test(h)) || null;
  const candidate = v.priceMatch || {
    enabled: false,
    name: choose(/name|nazwa|назв|description/i) || '',
    code: choose(/plu|sku|ean|barcode|code|kod/i),
    category: choose(/category|kategor|категор/i),
    gross: choose(/gross|brutto|price incl/i),
    net: choose(/net|netto/i),
    vat: choose(/vat|gst|tax rate|stawka/i),
  };

  return (
    <fieldset disabled={disabled} className="mt-4 grid gap-4 md:grid-cols-2">
      <label>
        {w.currency}
        <select
          className="demo-input w-full"
          value={v.currency || ''}
          onChange={e => onChange({ ...v, currency: e.target.value || null })}
        >
          <option value="">{w.unknown}</option>
          {Intl.supportedValuesOf('currency').map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label>
        {w.numbers}
        <select
          className="demo-input w-full"
          value={v.numberFormat || 'auto'}
          onChange={e =>
            onChange({ ...v, numberFormat: e.target.value as Mapping['numberFormat'] })
          }
        >
          <option value="auto">{w.auto}</option>
          <option value="decimal-comma">{w.comma}</option>
          <option value="decimal-point">{w.point}</option>
        </select>
      </label>
      <label>
        {w.tax}
        <select
          className="demo-input w-full"
          value={v.taxMode || 'percent'}
          onChange={e => onChange({ ...v, taxMode: e.target.value as Mapping['taxMode'] })}
        >
          <option value="percent">{w.percent}</option>
          <option value="fraction">{w.fraction}</option>
        </select>
      </label>
      <label>
        {w.net}
        <select
          className="demo-input w-full"
          value={v.netMoneyMode || v.moneyMode}
          onChange={e =>
            onChange({ ...v, netMoneyMode: e.target.value as Mapping['netMoneyMode'] })
          }
        >
          <option value="line">{w.line}</option>
          <option value="unit">{w.unit}</option>
        </select>
      </label>
      {v.version !== 2 && v.granularity === 'receipts' && (
        <div className="md:col-span-2 demo-stock-note">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={!!v.priceMatch?.enabled}
              onChange={e =>
                onChange({ ...v, priceMatch: { ...candidate, enabled: e.target.checked } })
              }
            />
            <span>
              <strong>{w.estimate}</strong>
              <br />
              {w.note}
            </span>
          </label>
          {v.priceMatch && (
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              {(['name', 'code', 'category', 'gross', 'net', 'vat'] as const).map(key => (
                <label key={key}>
                  {
                    ({
                      name: w.name,
                      code: w.code,
                      category: w.category,
                      gross: w.gross,
                      net: w.netprice,
                      vat: w.rate,
                    })[key]
                  }
                  <select
                    className="demo-input w-full"
                    value={v.priceMatch?.[key] || ''}
                    onChange={e =>
                      onChange({
                        ...v,
                        priceMatch: {
                          ...candidate,
                          [key]: e.target.value || (key === 'name' ? '' : null),
                        },
                      })
                    }
                  >
                    <option value="">{w.missing}</option>
                    {headers.map(h => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </fieldset>
  );
}
