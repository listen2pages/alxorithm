/*
 * Compile one preserved Polish source tree and JSON dictionaries into server-rendered locale routes.
 * Generated files are disposable. Edit template/ and i18n/*.json, then run npm run localize.
 * Database identifiers, enum values, API URLs, currency and business rules are never translated.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const locales = ['en', 'pl', 'ru'];
const entries = JSON.parse(fs.readFileSync('i18n/extracted.json', 'utf8'));
const rows = fs
  .readFileSync('i18n/translations.tsv', 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => line.split('|'));
const translations = new Map(rows.map(([id, en, ru]) => [Number(id), { en, ru }]));
const extraRows = fs
  .readFileSync('i18n/extra.tsv', 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => line.split('|'));
const fragments = require('../i18n/fragments.json');

function brand(s) {
  return s
    .replace(/(?:www\.)?jedzeniewarszawa\.pl/g, 'alxorithm.com')
    .replace(/JedzenieWarszawa|Jedzenie Warszawa|jedzenie warszawa/g, 'alxorithm');
}

for (const locale of locales) {
  const dict = {};
  for (const e of entries) {
    if (e.id === 1105) continue;
    const row = translations.get(e.id);
    if (!row) throw Error('Missing translation ' + e.id + ': ' + e.text);
    dict[e.text] = locale === 'pl' ? e.text : row[locale];
  }
  for (const [pl, en, ru] of extraRows) {
    dict[pl] = locale === 'pl' ? pl : locale === 'en' ? en : ru;
  }
  for (const [key, values] of Object.entries(fragments)) {
    dict[key] = values[locale];
  }
  fs.writeFileSync(`i18n/${locale}.json`, JSON.stringify(dict, null, 2) + '\n');
}

// Build a compact client dictionary containing only API, validation and workspace service messages
// so client bundles do not ship full marketing, demo and legal page prose in all three languages.
const serviceMessages = { en: {}, ru: {} };
for (const e of entries) {
  if (e.id === 1105) continue;
  const isServiceSource =
    Array.isArray(e.files) &&
    e.files.some(f => f.includes('/api/') || f.includes('/utils/'));
  if (!isServiceSource) continue;
  const row = translations.get(e.id);
  if (row) {
    serviceMessages.en[brand(e.text)] = brand(row.en);
    serviceMessages.ru[brand(e.text)] = brand(row.ru);
  }
}
for (const [pl, en, ru] of extraRows) {
  serviceMessages.en[brand(pl)] = brand(en);
  serviceMessages.ru[brand(pl)] = brand(ru);
}
fs.writeFileSync('i18n/service-messages.json', JSON.stringify(serviceMessages, null, 2) + '\n');

function importInto(source, statement) {
  return /['"]use client['"];/.test(source)
    ? source.replace(/(['"]use client['"];)/, '$1\n' + statement)
    : statement + '\n' + source;
}

function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(e => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

function write(f, s) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, s);
}

const baseFiles = files('template');
const presentationUtils = ['utils/demo/', 'utils/panel/types.ts', 'utils/panel/categories.ts'];

function localPath(s, locale) {
  return locale === 'en' ? s : '/' + locale + (s === '/' ? '' : s);
}

function convert(source, file, locale) {
  const dict = JSON.parse(fs.readFileSync(`i18n/${locale}.json`, 'utf8'));
  const ast = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const changes = [];

  const trans = s => {
    if (s === 'PLN') return s;
    let value = brand(locale === 'pl' ? s : (dict[s] ?? s));
    if (
      file.startsWith('app/home/') ||
      file.startsWith('app/demo/') ||
      file.startsWith('utils/demo/')
    ) {
      value = value
        .replace(/\bPLN\b|zł/g, '')
        .replace(/\(\s*\)/g, '')
        .replace(/\s+\//g, ' /')
        .replace(/\s{2,}/g, ' ');
    }
    if (locale !== 'pl') {
      value = value.replace(/szt\./g, locale === 'ru' ? 'шт.' : 'unit');
    }
    value = value.replace(/\bVAT\b/g, locale === 'pl' ? 'podatek' : locale === 'ru' ? 'налог' : 'tax');
    return value;
  };

  function replace(n, value) {
    changes.push([n.getStart(ast), n.end, value]);
  }

  function visit(n) {
    if (ts.isJsxText(n)) {
      const normalized = n.text.replace(/\s+/g, ' ').trim();
      if (normalized && (dict[normalized] !== undefined || brand(normalized) !== normalized)) {
        const result = trans(normalized);
        const lead = /^\s/.test(n.text) ? ' ' : '';
        const tail = /\s$/.test(n.text) ? ' ' : '';
        replace(n, '{' + JSON.stringify(lead + result + tail) + '}');
      }
      return;
    }

    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const s = n.text;
      const p = n.parent;
      let value = s;

      if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p)) {
        if (s === 'next/link') {
          value = '@/i18n/navigation';
        } else if (s === 'next/navigation' && /['"]use client['"]/.test(source)) {
          value = '@/i18n/navigation';
        } else if (
          s.startsWith('@/components/') &&
          ![
            '@/components/LanguageSelector',
            '@/components/RegionalSettings',
            '@/components/WorkspaceShell',
          ].includes(s)
        ) {
          value = s.replace('@/components/', `@/localized/${locale}/components/`);
        } else if (s.startsWith('@/app/')) {
          value = s.replace('@/app/', `@/app/${locale}/`);
        } else if (
          s.startsWith('@/utils/') &&
          presentationUtils.some(prefix => s.slice(2).startsWith(prefix.replace('.ts', '')))
        ) {
          value = s.replace('@/utils/', `@/localized/${locale}/utils/`);
        }
      } else if (
        ts.isJsxAttribute(p) &&
        [
          'value',
          'id',
          'className',
          'name',
          'htmlFor',
          'aria-labelledby',
          'aria-controls',
          'key',
          'data-stripe-link',
        ].includes(p.name.getText(ast))
      ) {
        return;
      } else {
        value = trans(s);
        if (s === 'pl-PL') value = locale === 'en' ? 'en-GB' : locale === 'ru' ? 'ru-RU' : s;
        if (s === 'pl_PL') value = locale === 'en' ? 'en_GB' : locale === 'ru' ? 'ru_RU' : s;
        if (s === 'pl' && ts.isPropertyAssignment(p) && p.name.getText(ast) === 'inLanguage') {
          value = locale;
        }
        // Server redirects are locale-specific; client navigation goes through the shared wrapper.
        if (
          ts.isCallExpression(p) &&
          p.expression.getText(ast) === 'redirect' &&
          s.startsWith('/')
        ) {
          value = localPath(s, locale);
        }
        if (
          ts.isPropertyAssignment(p) &&
          ['canonical', 'url'].includes(p.name.getText(ast)) &&
          s.startsWith('/') &&
          !s.startsWith('//')
        ) {
          value = localPath(s, locale);
        }
        if (ts.isBinaryExpression(p) && p.left.getText(ast) === 'window.location.href' && s === '/') {
          value = localPath('/', locale);
        }
        if (
          s.startsWith('https://www.jedzeniewarszawa.pl') &&
          !/\.(png|jpg|avif|ico|svg)$/.test(s)
        ) {
          value =
            'https://alxorithm.com' +
            localPath(s.replace('https://www.jedzeniewarszawa.pl', '') || '/', locale);
        }
      }

      if (value !== s) replace(n, JSON.stringify(value));
      return;
    }

    if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) {
      let value = trans(n.text);
      if (n.text.startsWith('https://www.jedzeniewarszawa.pl/')) {
        value =
          'https://alxorithm.com' +
          localPath(n.text.replace('https://www.jedzeniewarszawa.pl', ''), locale);
        if (n.text.endsWith('/') && !value.endsWith('/')) value += '/';
      }
      if (value !== n.text) {
        const before = ts.isTemplateHead(n) ? '`' : '}';
        const after = ts.isTemplateTail(n) ? '`' : '${';
        replace(n, before + value.replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + after);
      }
      return;
    }

    ts.forEachChild(n, visit);
  }

  visit(ast);
  changes.sort((a, b) => b[0] - a[0]).forEach(([a, b, s]) => {
    source = source.slice(0, a) + s + source.slice(b);
  });

  if (/['"]use client['"]/.test(source) && /\bfetch\(/.test(source)) {
    source = source.replace(/(['"]use client['"];)/, "$1\nimport { fetch } from '@/i18n/fetch';");
  }

  if (file === 'components/LandingNav.tsx') {
    if (!source.includes("from '@/components/LanguageSelector'")) {
      source = source.replace(
        /(['"]use client['"];)/,
        "$1\nimport LanguageSelector from '@/components/LanguageSelector';\nimport RegionalSettings from '@/components/RegionalSettings';",
      );
    }
    if (!source.includes('<LanguageSelector />')) {
      source = source.replace(
        /(<div className="landing-nav-actions">|<div className="flex items-center gap-4">)/,
        '$1<LanguageSelector /><RegionalSettings />',
      );
    }
  }

  if (file.endsWith('app/login/page.tsx')) {
    source = source.replace(
      '/auth/callback`',
      `/auth/callback?locale=${locale}&next=\${encodeURIComponent(searchParams.get('next') || '/cennik')}\``,
    );
  }

  // Original CSS module classes are Polish identifiers, regardless of displayed headings.
  if (file.endsWith('app/cennik/page.tsx')) {
    source = source.replace(
      "f.label.split('/')[1].trim().toLowerCase()",
      "['analityka pos','kuchnia','magazyn','personel'][features.indexOf(f)]",
    );
  }

  if (/app\/.+\/(page|layout)\.tsx$/.test(file) || file === 'app/page.tsx') {
    source = importInto(source, "import { languageAlternates } from '@/i18n/routing';");
    source = source.replace(
      /canonical:\s*((?:"[^"\n]*"|'[^'\n]*'|`[^`]*`))(,?)/g,
      'canonical: $1, languages: languageAlternates($1)$2',
    );
    const route =
      '/' +
      file
        .replace(/^app\//, '')
        .replace(/\/?(page|layout)\.tsx$/, '');
    if (!route.includes('[') && !source.includes('canonical:') && source.includes('metadata')) {
      const cleanRoute = route === '/' ? '/' : route.replace(/\/$/, '');
      source = source.replace(
        /(export const metadata(?:\s*:\s*Metadata)?\s*=\s*\{)/,
        `$1\n alternates: { canonical: ${JSON.stringify(localPath(cleanRoute, locale))}, languages: languageAlternates(${JSON.stringify(cleanRoute || '/')}) },`,
      );
    }
  }

  return source;
}

for (const locale of locales) {
  for (const f of baseFiles) {
    const rel = f.slice('template/'.length).replaceAll('\\', '/');
    if (
      rel.startsWith('app/api/') ||
      rel.startsWith('app/auth/') ||
      [
        'app/layout.tsx',
        'app/sitemap.ts',
        'app/robots.ts',
        'app/opengraph-image.tsx',
        'app/manifest.json',
        'app/favicon.ico',
        'app/icon.png',
        'app/apple-icon.png',
      ].includes(rel)
    ) {
      continue;
    }
    if (rel.startsWith('utils/') && !presentationUtils.some(prefix => rel.startsWith(prefix))) {
      continue;
    }
    const out = rel.startsWith('app/') ? `app/${locale}/` + rel.slice(4) : `localized/${locale}/` + rel;
    const source = fs.readFileSync(f);
    write(out, /\.tsx?$/.test(f) ? convert(source.toString('utf8'), rel, locale) : source);
  }
}

for (const f of baseFiles) {
  const rel = f.slice('template/'.length).replaceAll('\\', '/');
  if (rel.startsWith('app/api/')) {
    write(rel, brand(fs.readFileSync(f, 'utf8')));
  }
}

for (const f of ['favicon.ico', 'icon.png', 'apple-icon.png']) {
  write('app/' + f, fs.readFileSync('template/app/' + f));
}

write(
  'app/opengraph-image.tsx',
  convert(fs.readFileSync('template/app/opengraph-image.tsx', 'utf8'), 'app/opengraph-image.tsx', 'en'),
);

console.log(`Compiled ${entries.length} messages into three server-rendered versions.`);
