'use client';

import { useLocale } from './navigation';
import { fields, type Mapping, type MonthFiles, type Field } from '@/utils/panel/types';
import AnalysisOptions from './AnalysisOptions';

const words = {
  en: {
    title: 'Review detected files and columns',
    sales: 'File containing actual sales',
    structure: 'Each sales row represents',
    items: 'Sold item / product sales',
    receipts: 'Receipt total',
    extra: 'Additional sales exports with the same columns',
    links: 'Link supporting files by identifiers',
    add: 'Add a file link',
    remove: 'Remove link',
    saleskey: 'Identifier columns in sales file',
    lookup: 'Matching columns in supporting file',
    missing: 'Not available',
    payments: 'Separate payment file (optional)',
    none: 'None',
    receipt: 'Receipt identifier',
    amount: 'Payment amount',
    method: 'Payment method',
    tip: 'Tips',
    line: 'Independent amounts per row',
    once: 'Receipt tip repeated on rows (count once)',
    status: 'Sales status column (optional)',
    exclude: 'Statuses to exclude (comma-separated)',
    dates: 'Date format',
  },
  pl: {
    title: 'Sprawdź rozpoznane pliki i kolumny',
    sales: 'Plik z rzeczywistą sprzedażą',
    structure: 'Każdy wiersz sprzedaży oznacza',
    items: 'Sprzedaną pozycję / sprzedaż produktu',
    receipts: 'Sumę paragonu',
    extra: 'Dodatkowe eksporty sprzedaży z tymi samymi kolumnami',
    links: 'Połącz pliki pomocnicze identyfikatorami',
    add: 'Dodaj połączenie pliku',
    remove: 'Usuń połączenie',
    saleskey: 'Kolumny identyfikatorów w sprzedaży',
    lookup: 'Odpowiadające kolumny pliku pomocniczego',
    missing: 'Niedostępne',
    payments: 'Oddzielny plik płatności (opcjonalnie)',
    none: 'Brak',
    receipt: 'Identyfikator paragonu',
    amount: 'Kwota płatności',
    method: 'Metoda płatności',
    tip: 'Napiwki',
    line: 'Niezależne kwoty na wiersz',
    once: 'Napiwek powtórzony na pozycjach (licz raz)',
    status: 'Kolumna statusu sprzedaży (opcjonalnie)',
    exclude: 'Statusy do pominięcia (oddziel przecinkami)',
    dates: 'Format dat',
  },
  ru: {
    title: 'Проверьте распознанные файлы и столбцы',
    sales: 'Файл фактических продаж',
    structure: 'Каждая строка продаж означает',
    items: 'Проданную позицию / продажи товара',
    receipts: 'Итог чека',
    extra: 'Дополнительные экспорты продаж с теми же столбцами',
    links: 'Свяжите вспомогательные файлы идентификаторами',
    add: 'Добавить связь файлов',
    remove: 'Удалить связь',
    saleskey: 'Столбцы идентификаторов в продажах',
    lookup: 'Соответствующие столбцы вспомогательного файла',
    missing: 'Недоступно',
    payments: 'Отдельный файл платежей (необязательно)',
    none: 'Нет',
    receipt: 'Идентификатор чека',
    amount: 'Сумма платежа',
    method: 'Способ оплаты',
    tip: 'Чаевые',
    line: 'Независимые суммы строк',
    once: 'Чаевые повторены в строках (считать один раз)',
    status: 'Столбец статуса продаж (необязательно)',
    exclude: 'Исключаемые статусы (через запятую)',
    dates: 'Формат дат',
  },
};

const labels: Record<'en' | 'pl' | 'ru', Record<Field, string>> = {
  en: {
    receipt_id: 'Receipt ID',
    date: 'Sale date',
    time: 'Sale time',
    employee: 'Employee',
    product_name: 'Product name',
    category: 'Category',
    plu: 'Product code',
    net_price: 'Net sales amount',
    vat: 'Tax rate',
    gross: 'Gross sales amount',
    payment: 'Payment method',
    tip: 'Tip',
    source: 'Sales channel',
    quantity: 'Quantity',
    tax_amount: 'Tax amount',
  },
  pl: {
    receipt_id: 'ID paragonu',
    date: 'Data sprzedaży',
    time: 'Godzina sprzedaży',
    employee: 'Pracownik',
    product_name: 'Nazwa produktu',
    category: 'Kategoria',
    plu: 'Kod produktu',
    net_price: 'Kwota sprzedaży netto',
    vat: 'Stawka podatku',
    gross: 'Kwota sprzedaży brutto',
    payment: 'Metoda płatności',
    tip: 'Napiwek',
    source: 'Kanał sprzedaży',
    quantity: 'Ilość',
    tax_amount: 'Kwota podatku',
  },
  ru: {
    receipt_id: 'ID чека',
    date: 'Дата продажи',
    time: 'Время продажи',
    employee: 'Сотрудник',
    product_name: 'Название товара',
    category: 'Категория',
    plu: 'Код товара',
    net_price: 'Сумма продаж без налога',
    vat: 'Ставка налога',
    gross: 'Сумма продаж с налогом',
    payment: 'Способ оплаты',
    tip: 'Чаевые',
    source: 'Канал продаж',
    quantity: 'Количество',
    tax_amount: 'Сумма налога',
  },
};

export default function FlexibleMappingEditor({
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
  const lang = useLocale();
  const w = words[lang];
  const joins = v.joins || [];
  const ids = Object.keys(files);
  const keySelect = (value: string[], headers: string[], change: (value: string[]) => void) => (
    <select
      multiple
      className="demo-input w-full"
      value={value}
      onChange={e => change(Array.from(e.target.selectedOptions).map(o => o.value))}
    >
      {headers.map(h => (
        <option key={h} value={h}>
          {h}
        </option>
      ))}
    </select>
  );

  return (
    <div className="demo-card mt-4">
      <h2 className="text-xl font-bold">{w.title}</h2>
      <fieldset disabled={disabled}>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <label>
            {w.sales}
            <select
              className="demo-input w-full"
              value={v.lineFile}
              onChange={e =>
                onChange({
                  ...v,
                  lineFile: e.target.value,
                  joins: [],
                  payments: null,
                  additionalSalesFiles: [],
                })
              }
            >
              {ids.map(id => (
                <option key={id} value={id}>
                  {files[id]?.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {w.structure}
            <select
              className="demo-input w-full"
              value={v.granularity}
              onChange={e => {
                const granularity = e.target.value as Mapping['granularity'];
                onChange({
                  ...v,
                  granularity,
                  fileKinds: { ...v.fileKinds, [v.lineFile]: granularity! },
                  fields:
                    granularity === 'receipts'
                      ? {
                          ...v.fields,
                          product_name: null,
                          plu: null,
                          category: null,
                          quantity: null,
                        }
                      : v.fields,
                });
              }}
            >
              <option value="items">{w.items}</option>
              <option value="receipts">{w.receipts}</option>
            </select>
          </label>
          <label>
            {w.dates}
            <select
              className="demo-input w-full"
              value={v.dateFormat}
              onChange={e => onChange({ ...v, dateFormat: e.target.value as Mapping['dateFormat'] })}
            >
              <option value="iso">YYYY-MM-DD</option>
              <option value="dmy">DD-MM-YYYY</option>
              <option value="mdy">MM-DD-YYYY</option>
            </select>
          </label>
          <label>
            {w.tip}
            <select
              className="demo-input w-full"
              value={v.tipMode}
              onChange={e => onChange({ ...v, tipMode: e.target.value as Mapping['tipMode'] })}
            >
              <option value="line">{w.line}</option>
              <option value="receipt">{w.once}</option>
            </select>
          </label>
          <label>
            {w.amount}
            <select
              className="demo-input w-full"
              value={v.moneyMode}
              onChange={e => onChange({ ...v, moneyMode: e.target.value as Mapping['moneyMode'] })}
            >
              <option value="line">{w.line}</option>
              <option value="unit">
                {lang === 'pl'
                  ? 'Cena × ilość'
                  : lang === 'ru'
                    ? 'Цена × количество'
                    : 'Unit price × quantity'}
              </option>
            </select>
          </label>
        </div>
        <label className="block mt-4">
          {w.extra}
          <select
            multiple
            className="demo-input w-full"
            value={v.additionalSalesFiles || []}
            onChange={e =>
              onChange({
                ...v,
                additionalSalesFiles: Array.from(e.target.selectedOptions).map(o => o.value),
              })
            }
          >
            {ids
              .filter(
                id =>
                  id !== v.lineFile &&
                  id !== v.payments?.file &&
                  !joins.some(j => j.file === id) &&
                  files[id]?.headers.length === files[v.lineFile]?.headers.length &&
                  files[v.lineFile]?.headers.every(h => files[id]?.headers.includes(h)),
              )
              .map(id => (
                <option key={id} value={id}>
                  {files[id]?.name}
                </option>
              ))}
          </select>
        </label>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <label>
            {w.status}
            <select
              className="demo-input w-full"
              value={v.rowFilter?.column || ''}
              onChange={e =>
                onChange({
                  ...v,
                  rowFilter: e.target.value
                    ? { column: e.target.value, excludeValues: v.rowFilter?.excludeValues || [] }
                    : null,
                })
              }
            >
              <option value="">{w.none}</option>
              {files[v.lineFile]?.headers.map(h => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </label>
          {v.rowFilter && (
            <label>
              {w.exclude}
              <input
                className="demo-input w-full"
                value={v.rowFilter.excludeValues.join(',')}
                onChange={e =>
                  onChange({
                    ...v,
                    rowFilter: {
                      ...v.rowFilter!,
                      excludeValues: e.target.value
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </label>
          )}
        </div>
        <h3 className="mt-4 font-bold">{w.links}</h3>
        {joins.map((join, i) => (
          <div key={join.file} className="grid md:grid-cols-3 gap-3 mt-3">
            <strong>{files[join.file]?.name}</strong>
            <label>
              {w.saleskey}
              {keySelect(join.lineColumns, files[v.lineFile]?.headers || [], cols =>
                onChange({
                  ...v,
                  joins: joins.map((j, k) => (k === i ? { ...j, lineColumns: cols } : j)),
                }),
              )}
            </label>
            <label>
              {w.lookup}
              {keySelect(join.lookupColumns, files[join.file]?.headers || [], cols =>
                onChange({
                  ...v,
                  joins: joins.map((j, k) => (k === i ? { ...j, lookupColumns: cols } : j)),
                }),
              )}
            </label>
            <button
              className="demo-button demo-button-secondary"
              type="button"
              onClick={() => onChange({ ...v, joins: joins.filter((_, k) => k !== i) })}
            >
              {w.remove}
            </button>
          </div>
        ))}
        <select
          className="demo-input mt-3"
          value=""
          onChange={e => {
            if (e.target.value) {
              onChange({
                ...v,
                joins: [
                  ...joins,
                  { file: e.target.value, lineColumns: [], lookupColumns: [] },
                ],
              });
            }
          }}
        >
          <option value="">{w.add}</option>
          {ids
            .filter(
              id =>
                id !== v.lineFile &&
                id !== v.payments?.file &&
                !joins.some(j => j.file === id) &&
                v.fileKinds?.[id] !== 'payments',
            )
            .map(id => (
              <option key={id} value={id}>
                {files[id]?.name}
              </option>
            ))}
        </select>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {fields
            .filter(
              f =>
                v.granularity !== 'receipts' ||
                !['product_name', 'plu', 'category', 'quantity'].includes(f),
            )
            .map(f => (
              <label key={f}>
                {labels[lang][f]}
                <select
                  className="demo-input w-full"
                  value={v.fields[f] ? JSON.stringify(v.fields[f]) : ''}
                  onChange={e =>
                    onChange({
                      ...v,
                      fields: {
                        ...v.fields,
                        [f]: e.target.value ? JSON.parse(e.target.value) : null,
                      },
                    })
                  }
                >
                  <option value="">{w.missing}</option>
                  {ids
                    .filter(id => id === v.lineFile || joins.some(j => j.file === id))
                    .map(id => (
                      <optgroup key={id} label={files[id]?.name}>
                        {files[id]?.headers.map(column => (
                          <option key={column} value={JSON.stringify({ file: id, column })}>
                            {column}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
              </label>
            ))}
        </div>
        <label className="block mt-4">
          {w.payments}
          <select
            className="demo-input w-full"
            value={v.payments?.file || ''}
            onChange={e =>
              onChange({
                ...v,
                payments: e.target.value
                  ? { file: e.target.value, receipt_id: '', amount: '', method: '' }
                  : null,
              })
            }
          >
            <option value="">{w.none}</option>
            {ids
              .filter(id => id !== v.lineFile && !joins.some(j => j.file === id))
              .map(id => (
                <option key={id} value={id}>
                  {files[id]?.name}
                </option>
              ))}
          </select>
        </label>
        {v.payments && (
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            {(['receipt_id', 'amount', 'method', 'tip', 'employee', 'date'] as const).map(key => (
              <label key={key}>
                {
                  ({
                    receipt_id: w.receipt,
                    amount: w.amount,
                    method: w.method,
                    tip: w.tip,
                    employee: labels[lang].employee,
                    date: labels[lang].date,
                  })[key]
                }
                <select
                  className="demo-input w-full"
                  value={v.payments?.[key] || ''}
                  onChange={e =>
                    onChange({
                      ...v,
                      payments: {
                        ...v.payments!,
                        [key]:
                          e.target.value ||
                          (['receipt_id', 'amount', 'method'].includes(key) ? '' : null),
                      },
                    })
                  }
                >
                  <option value="">{w.missing}</option>
                  {files[v.payments!.file]?.headers.map(h => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <AnalysisOptions value={v} onChange={onChange} files={files} disabled={disabled} />
    </div>
  );
}
