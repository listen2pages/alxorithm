'use client';

import { useState } from 'react';
import { useLocale } from '@/i18n/navigation';
import {
  getSettings,
  regionalSettings,
  type RegionalSettings as Settings,
} from '@/utils/global-settings';

const words = {
  en: {
    title: 'Regional settings',
    currency: 'Business currency',
    country: 'Country',
    zone: 'Time zone',
    save: 'Save',
    unknown: 'Not set',
    note: 'Use the currency of your source amounts. Changing this setting does not convert money. Existing POS reports keep their recorded currency.',
  },
  pl: {
    title: 'Ustawienia regionalne',
    currency: 'Waluta firmy',
    country: 'Kraj',
    zone: 'Strefa czasowa',
    save: 'Zapisz',
    unknown: 'Nie ustawiono',
    note: 'Wybierz walutę kwot źródłowych. Zmiana ustawienia nie przelicza pieniędzy. Zapisane raporty POS zachowują swoją walutę.',
  },
  ru: {
    title: 'Региональные настройки',
    currency: 'Валюта бизнеса',
    country: 'Страна',
    zone: 'Часовой пояс',
    save: 'Сохранить',
    unknown: 'Не задано',
    note: 'Выберите валюту исходных сумм. Изменение настройки не конвертирует деньги. Сохранённые отчёты POS сохраняют свою валюту.',
  },
};

const COUNTRY_CODES =
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(
    ' ',
  );

export default function RegionalSettings() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Settings>(() => regionalSettings({ language: locale }));
  const w = words[locale] || words[value.language] || words.en;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label={w.title}
        title={w.title}
        onClick={() => {
          if (!open) setValue(getSettings());
          setOpen(!open);
        }}
        style={{ padding: '6px 10px', border: '1px solid #d4c8bb', borderRadius: 8 }}
      >
        ⚙
      </button>
      {open && (
        <form
          onSubmit={e => {
            e.preventDefault();
            localStorage.setItem('alxorithm-region', JSON.stringify(regionalSettings(value)));
            window.location.reload();
          }}
          style={{
            position: 'absolute',
            right: 0,
            top: 40,
            width: 'min(320px,85vw)',
            padding: 20,
            background: '#faf7f3',
            border: '1px solid #d4c8bb',
            borderRadius: 12,
            zIndex: 100,
            color: '#3e2f29',
            boxShadow: '0 8px 30px #0002',
          }}
        >
          <strong>{w.title}</strong>
          <label style={{ display: 'block', marginTop: 12 }}>
            {w.currency}
            <select
              className="demo-input w-full"
              value={value.currency}
              onChange={e => setValue({ ...value, currency: e.target.value })}
            >
              <option value="">{w.unknown}</option>
              {Intl.supportedValuesOf('currency').map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'block', marginTop: 12 }}>
            {w.country}
            <select
              className="demo-input w-full"
              value={value.country}
              onChange={e => setValue({ ...value, country: e.target.value })}
            >
              <option value="">{w.unknown}</option>
              {COUNTRY_CODES.map(c => (
                <option key={c} value={c}>
                  {new Intl.DisplayNames([locale], { type: 'region' }).of(c)}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'block', marginTop: 12 }}>
            {w.zone}
            <select
              className="demo-input w-full"
              value={value.timeZone}
              onChange={e => setValue({ ...value, timeZone: e.target.value })}
            >
              {['UTC', ...Intl.supportedValuesOf('timeZone'), value.timeZone]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map(z => (
                  <option key={z}>{z}</option>
                ))}
            </select>
          </label>
          <p style={{ fontSize: 12, margin: '12px 0' }}>{w.note}</p>
          <button className="demo-button" type="submit">
            {w.save}
          </button>
        </form>
      )}
    </div>
  );
}
