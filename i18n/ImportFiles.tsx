'use client';

import { useLocale } from './navigation';
import type { MonthFiles, Mapping } from '@/utils/panel/types';
import type { UploadedFile } from '@/utils/uploads';

const words = {
  en: {
    intro:
      'Upload one or several POS exports. Start with detailed sold items or receipt history; add catalogues or payment exports only when needed. Up to 8 CSV files, 20 MB each, 60 MB per batch. Select the month of the sales dates.',
    add: 'Add CSV files',
    saved: 'Add from your saved files',
    choose: 'Choose a saved CSV',
    replace: 'Replace',
    remove: 'Remove from this month',
    empty: 'No files yet. A single detailed sales CSV can be enough.',
    unknown: 'Not identified yet',
    items: 'Sold items',
    receipts: 'Receipts / orders',
    catalogue: 'Product catalogue',
    payments: 'Payments',
    other: 'Other',
  },
  pl: {
    intro:
      'Dodaj jeden lub kilka eksportów POS. Zacznij od sprzedanych pozycji lub historii paragonów; katalogi i płatności dodaj w razie potrzeby. Do 8 plików CSV, 20 MB każdy, 60 MB na przesłanie. Wybierz miesiąc dat sprzedaży.',
    add: 'Dodaj pliki CSV',
    saved: 'Dodaj z zapisanych plików',
    choose: 'Wybierz zapisany CSV',
    replace: 'Zastąp',
    remove: 'Usuń z tego miesiąca',
    empty: 'Brak plików. Jeden szczegółowy CSV sprzedaży może wystarczyć.',
    unknown: 'Jeszcze nierozpoznany',
    items: 'Sprzedane pozycje',
    receipts: 'Paragony / zamówienia',
    catalogue: 'Katalog produktów',
    payments: 'Płatności',
    other: 'Inne',
  },
  ru: {
    intro:
      'Загрузите один или несколько экспортов POS. Начните с проданных позиций или истории чеков; каталог и платежи добавляйте при необходимости. До 8 CSV, по 20 МБ, 60 МБ за загрузку. Выберите месяц дат продаж.',
    add: 'Добавить CSV-файлы',
    saved: 'Добавить из сохранённых файлов',
    choose: 'Выберите сохранённый CSV',
    replace: 'Заменить',
    remove: 'Убрать из этого месяца',
    empty: 'Файлов пока нет. Одного подробного CSV продаж может быть достаточно.',
    unknown: 'Ещё не распознан',
    items: 'Проданные позиции',
    receipts: 'Чеки / заказы',
    catalogue: 'Каталог товаров',
    payments: 'Платежи',
    other: 'Прочее',
  },
};

export default function ImportFiles({
  files,
  mapping,
  existing,
  disabled,
  onAdd,
  onRemove,
}: {
  files: MonthFiles;
  mapping: Mapping | null;
  existing: UploadedFile[];
  disabled: boolean;
  onAdd: (files: File[] | string, id?: string) => void;
  onRemove: (id: string) => void;
}) {
  const lang = useLocale();
  const w = words[lang];
  return (
    <div className="demo-card mt-5">
      <p className="demo-muted">{w.intro}</p>
      <div className="flex flex-wrap gap-3 mt-4">
        <label className="demo-button cursor-pointer">
          {w.add}
          <input
            aria-label={w.add}
            className="sr-only"
            type="file"
            multiple
            accept=".csv,text/csv"
            disabled={disabled || Object.keys(files).length >= 8}
            onChange={e => {
              const selected = Array.from(e.target.files || []);
              if (selected.length) onAdd(selected);
              e.target.value = '';
            }}
          />
        </label>
        <label>
          {w.saved}
          <select
            aria-label={w.saved}
            className="demo-input ml-2"
            disabled={disabled || Object.keys(files).length >= 8}
            value=""
            onChange={e => {
              if (e.target.value) onAdd(e.target.value);
            }}
          >
            <option value="">{w.choose}</option>
            {existing.map(f => (
              <option key={f.path} value={f.path}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!Object.keys(files).length && <p className="demo-muted mt-4">{w.empty}</p>}
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        {Object.entries(files).map(
          ([id, file]) =>
            file && (
              <div key={id} className="rounded-xl border border-[#d4c8bb] p-4">
                <strong className="break-all">{file.name}</strong>
                <p className="demo-muted">
                  {mapping?.fileKinds?.[id] ? w[mapping.fileKinds[id]] : w.unknown} ·{' '}
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <div className="flex gap-2 mt-2">
                  <label className="demo-button demo-button-secondary cursor-pointer">
                    {w.replace}
                    <input
                      aria-label={w.replace + ' ' + file.name}
                      className="sr-only"
                      type="file"
                      accept=".csv,text/csv"
                      disabled={disabled}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) onAdd([f], id);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={disabled}
                    className="demo-button demo-button-secondary"
                    onClick={() => onRemove(id)}
                  >
                    {w.remove}
                  </button>
                </div>
              </div>
            ),
        )}
      </div>
    </div>
  );
}
