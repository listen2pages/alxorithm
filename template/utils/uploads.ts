export const MAX_STORAGE_BYTES = 50 * 1024 * 1024;
export const MAX_FILES = 100;

export type UploadedFile = {
  name: string;
  path: string;
  size: number;
  uploaded_at: string;
};

export type SupportedUploadExt = 'csv' | 'txt' | 'pdf' | 'png' | 'jpg' | 'jpeg' | 'xlsx' | 'xls';

export const CANONICAL_MIME: Record<SupportedUploadExt, string> = {
  csv: 'text/csv',
  txt: 'text/plain',
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
};

function startsWith(bytes: Uint8Array, prefix: number[]): boolean {
  if (bytes.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (bytes[i] !== prefix[i]) return false;
  }
  return true;
}

const MAGIC = {
  pdf: [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpg: [0xff, 0xd8, 0xff],
  zipLocal: [0x50, 0x4b, 0x03, 0x04],
  zipEmpty: [0x50, 0x4b, 0x05, 0x06],
  zipSpanned: [0x50, 0x4b, 0x07, 0x08],
  ole2: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1],
  elf: [0x7f, 0x45, 0x4c, 0x46],
};

function looksLikeText(bytes: Uint8Array): boolean {
  if (bytes.length === 0) return false;
  if (
    startsWith(bytes, MAGIC.pdf) ||
    startsWith(bytes, MAGIC.png) ||
    startsWith(bytes, MAGIC.jpg) ||
    startsWith(bytes, MAGIC.zipLocal) ||
    startsWith(bytes, MAGIC.ole2) ||
    startsWith(bytes, MAGIC.elf)
  ) {
    return false;
  }
  const sampleLength = Math.min(bytes.length, 8192);
  for (let i = 0; i < sampleLength; i++) {
    if (bytes[i] === 0x00) return false;
  }
  return true;
}

/**
 * Validates that a file's binary magic header matches its declared extension
 * and returns the canonical MIME type so client-supplied `file.type` is never trusted.
 */
export function detectFileKind(
  name: string,
  bytes: Uint8Array,
): { valid: true; ext: SupportedUploadExt; mime: string } | { valid: false; error: string } {
  const ext = (name.split('.').pop() || '').toLowerCase() as SupportedUploadExt;
  if (!Object.hasOwn(CANONICAL_MIME, ext)) {
    return { valid: false, error: 'Nieobsługiwany format pliku.' };
  }
  let matches = false;
  switch (ext) {
    case 'pdf':
      matches = startsWith(bytes, MAGIC.pdf);
      break;
    case 'png':
      matches = startsWith(bytes, MAGIC.png);
      break;
    case 'jpg':
    case 'jpeg':
      matches = startsWith(bytes, MAGIC.jpg);
      break;
    case 'xlsx':
      matches =
        startsWith(bytes, MAGIC.zipLocal) ||
        startsWith(bytes, MAGIC.zipEmpty) ||
        startsWith(bytes, MAGIC.zipSpanned);
      break;
    case 'xls':
      matches = startsWith(bytes, MAGIC.ole2);
      break;
    case 'csv':
    case 'txt':
      matches = looksLikeText(bytes);
      break;
  }
  if (!matches) {
    return { valid: false, error: 'Zawartość pliku nie odpowiada jego rozszerzeniu.' };
  }
  return { valid: true, ext, mime: CANONICAL_MIME[ext] };
}

export function validateUpload(name: string, size: number, files: UploadedFile[]) {
  if (!/\.(csv|xlsx|xls|pdf)$/i.test(name)) return 'Wybierz plik CSV, XLSX, XLS lub PDF.';
  if (size <= 0) return 'Plik jest pusty.';
  if (files.length >= MAX_FILES) return 'Osiągnięto limit 100 plików.';
  if (files.reduce((sum, file) => sum + file.size, 0) + size > MAX_STORAGE_BYTES) {
    return 'Przekroczono limit 50 MB. Usuń niepotrzebne pliki.';
  }
  return null;
}

export function ownsUpload(path: unknown, userId: string): path is string {
  return (
    typeof path === 'string' &&
    path.startsWith(userId + '/') &&
    path.split('/').length === 2 &&
    !path.includes('..') &&
    !path.includes('\\')
  );
}
