const { test } = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { load } = require('./helpers/ts-loader.cjs');

test('detectFileKind validates magic-byte signatures and blocks spoofed extensions', () => {
  const { detectFileKind } = load('utils/uploads.ts');

  const csvBytes = new TextEncoder().encode('date,revenue,cost\n2026-09-01,1200,450\n');
  assert.deepEqual(detectFileKind('sales.csv', csvBytes), {
    valid: true,
    ext: 'csv',
    mime: 'text/csv',
  });

  const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
  assert.deepEqual(detectFileKind('invoice.pdf', pdfBytes), {
    valid: true,
    ext: 'pdf',
    mime: 'application/pdf',
  });

  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  assert.deepEqual(detectFileKind('receipt.png', pngBytes), {
    valid: true,
    ext: 'png',
    mime: 'image/png',
  });

  const jpgBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  assert.deepEqual(detectFileKind('photo.jpeg', jpgBytes), {
    valid: true,
    ext: 'jpeg',
    mime: 'image/jpeg',
  });

  const zipBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
  assert.deepEqual(detectFileKind('sheet.xlsx', zipBytes), {
    valid: true,
    ext: 'xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const oleBytes = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  assert.deepEqual(detectFileKind('legacy.xls', oleBytes), {
    valid: true,
    ext: 'xls',
    mime: 'application/vnd.ms-excel',
  });

  // Spoofed HTML/script disguised as PDF or PNG must be rejected
  const htmlSpoof = new TextEncoder().encode('<script>alert(1)</script>');
  assert.equal(detectFileKind('evil.pdf', htmlSpoof).valid, false);
  assert.equal(detectFileKind('evil.png', htmlSpoof).valid, false);

  // Binary payload with NUL bytes disguised as CSV must be rejected
  const binarySpoofCsv = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]);
  assert.equal(detectFileKind('malware.csv', binarySpoofCsv).valid, false);
});

test('AI quota enforces per-minute burst limit and database daily quota', async () => {
  const quota = load('utils/ai-quota.ts');
  quota.resetAiBurst();

  for (let i = 0; i < 20; i++) {
    assert.equal(quota.allowBurst('user-burst', 1000), true);
  }
  assert.equal(quota.allowBurst('user-burst', 1000), false);
  // After 60s window expires, burst resets
  assert.equal(quota.allowBurst('user-burst', 62_000), true);

  let dbAllowed = true;
  const mockSupabase = {
    async rpc(fn, args) {
      assert.equal(fn, 'consume_ai_quota');
      assert.equal(args.p_kind, 'kitchen_analyze');
      return { data: dbAllowed, error: null };
    },
  };

  quota.resetAiBurst();
  const ok = await quota.consumeAiQuota(mockSupabase, 'user-db', 'kitchen_analyze', {
    enforceDb: true,
  });
  assert.equal(ok.allowed, true);

  dbAllowed = false;
  const denied = await quota.consumeAiQuota(mockSupabase, 'user-db', 'kitchen_analyze', {
    enforceDb: true,
  });
  assert.equal(denied.allowed, false);
  assert.equal(denied.message, quota.AI_LIMIT_MESSAGE);
});

test('signWorkspaceImages caches signed URLs across polls and invalidates replaced images', async () => {
  const ws = load('utils/workspace/server.ts');
  let signCalls = 0;
  const supabase = {
    storage: {
      from(bucket) {
        assert.equal(bucket, 'workspace-images');
        return {
          async createSignedUrls(paths, ttl) {
            signCalls += 1;
            assert.equal(ttl, 3600);
            return {
              data: paths.map(path => ({
                path,
                signedUrl: `https://signed.example/${path}?call=${signCalls}`,
              })),
            };
          },
        };
      },
    },
  };

  const first = await ws.signWorkspaceImages(supabase, 'owner', ['owner/dish.png'], 1000);
  const second = await ws.signWorkspaceImages(supabase, 'owner', ['owner/dish.png'], 2000);
  assert.equal(signCalls, 1);
  assert.equal(first.get('owner/dish.png'), second.get('owner/dish.png'));

  ws.invalidateWorkspaceImage('owner/dish.png');
  const third = await ws.signWorkspaceImages(supabase, 'owner', ['owner/dish.png'], 3000);
  assert.equal(signCalls, 2);
  assert.notEqual(first.get('owner/dish.png'), third.get('owner/dish.png'));
});

test('middleware attaches HTTP security headers to responses', async () => {
  const { middleware } = load('middleware.ts', {
    '@/i18n/routing': load('i18n/routing.ts'),
    '@supabase/ssr': { createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }) },
    '@/utils/supabase/subscription': { isSubscriber: async () => false },
  });
  const response = await middleware(new NextRequest('http://localhost/'));
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
  assert.equal(response.headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
  assert.ok(response.headers.get('Content-Security-Policy').includes("frame-ancestors 'none'"));
});
