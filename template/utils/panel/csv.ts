import type { Csv } from './types';

export function parseCsv(text: string): Csv {
  text = text.replace(/^\uFEFF/, '');
  const counts:Record<string,number>={',':0,';':0,'\t':0};let inQuote=false;
  for(let i=0;i<text.length;i++){
    const char=text[i];
    if(char==='"'){if(inQuote&&text[i+1]==='"')i++;else inQuote=!inQuote;}
    else if(!inQuote){if(char==='\n'||char==='\r')break;if(char in counts)counts[char]++;}
  }
  const delimiter = Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
  const matrix: string[][] = []; let row: string[] = [], cell = '', quoted = false, closed = false;
  for (let i = 0; i <= text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === undefined) throw new Error('Niezamknięty cudzysłów w CSV.');
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') { quoted = false; closed = true; }
      else cell += char;
    } else if (char === delimiter || char === '\n' || char === '\r' || char === undefined) {
      row.push(cell.trim()); cell = ''; closed = false;
      if (char !== delimiter) {
        if (row.some(value => value !== '')) matrix.push(row);
        row = []; if (char === '\r' && text[i+1] === '\n') i++;
      }
    } else if (char === '"' && !cell.trim() && !closed) { cell = ''; quoted = true; }
    else { if (closed && char.trim()) throw new Error('Nieprawidłowy format CSV po cudzysłowie.'); cell += char; }
  }
  const headers = matrix.shift();
  if (!headers?.length || !matrix.length) throw new Error('CSV musi zawierać nagłówki i co najmniej jeden wiersz danych.');
  if (headers.some(h => !h) || new Set(headers).size !== headers.length) throw new Error('Nazwy kolumn muszą być niepuste i unikalne.');
  if (headers.length > 100 || matrix.length > 300000) throw new Error('Limit: 100 kolumn i 300 000 wierszy na plik.');
  return { headers, rows: matrix.map((values, index) => {
    if (values.length !== headers.length) throw new Error(`Wiersz ${index + 2}: liczba komórek nie zgadza się z nagłówkiem.`);
    return Object.fromEntries(headers.map((header, i) => [header, values[i]]));
  }) };
}

export function parseNumber(value: string, format: 'auto'|'decimal-comma'|'decimal-point'='auto'): number | null {
  const strip=(v:string)=>v.replace(/^(?:[A-Z]{3}|zł)|(?:[A-Z]{3}|zł|%)$/g,'');
  let text = strip(value.trim().replace(/[\s\u00a0]/g, ''));
  // Some POS exports encode literal quotes inside an already quoted CSV cell.
  // Unwrap one balanced pair only; never remove embedded or unmatched quotes.
  if (text.startsWith('"') && text.endsWith('"') && text.length >= 2) {
    text = strip(text.slice(1,-1));
  }
  if (!text) return null;
  // Currency codes/symbols, accounting negatives and regional thousands separators.
  if(/^\(.*\)$/.test(text))text='-'+text.slice(1,-1);
  text=text.replace(/^(-?)[€$£¥₹₽₩₺₴]/,'$1').replace(/[€$£¥₹₽₩₺₴]$/,'').replace(/[’']/g,'');
  if(format==='decimal-comma')text=text.replace(/\./g,'').replace(',','.');
  else if(format==='decimal-point')text=text.replace(/,/g,'');
  if (text.includes(',') && text.includes('.')) {
    text = text.lastIndexOf(',') > text.lastIndexOf('.') ? text.replace(/\./g,'').replace(',', '.') : text.replace(/,/g,'');
  } else if(format==='auto')text = text.replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) throw new Error(`Nieprawidłowa liczba: ${value.slice(0,40)}`);
  const result = Number(text);
  if (!Number.isFinite(result) || Math.abs(result) > 1e12) throw new Error('Liczba poza obsługiwanym zakresem.');
  return result;
}

export function parseDate(value: string, format: 'iso' | 'dmy' | 'mdy'): string {
  const part = value.trim().split(/[ T]/)[0];
  let y: number, m: number, d: number;
  const iso = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(part);
  const local = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(part);
  if (iso) { y=+iso[1]; m=+iso[2]; d=+iso[3]; }
  else if (local && format !== 'iso') { y=+local[3]; m=+(format==='dmy'?local[2]:local[1]); d=+(format==='dmy'?local[1]:local[2]); }
  else throw new Error('Nie rozpoznano daty. Sprawdź format dat w mapowaniu.');
  const date = new Date(Date.UTC(y,m-1,d));
  if (date.getUTCFullYear()!==y || date.getUTCMonth()!==m-1 || date.getUTCDate()!==d) throw new Error('CSV zawiera nieprawidłową datę.');
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
