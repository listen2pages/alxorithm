const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file) {
  const exports = {};
  new Function('exports', ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText)(exports);
  return exports;
}
const { isSubscriber, safeReturnPath } = load('utils/supabase/subscription.ts');
const { validateUpload, ownsUpload, MAX_STORAGE_BYTES } = load('utils/uploads.ts');
function client(rows, error = null) {
  return { from(table) {
    assert.equal(table, 'subscriptions');
    return { select() { return { eq(column, id) {
      assert.equal(column, 'user_id'); assert.equal(id, 'owner');
      return { in(column, statuses) {
        assert.equal(column, 'status'); assert.deepEqual(statuses, ['active', 'trialing']);
        return { limit: async () => ({ data: rows, error }) };
      } };
    } }; } };
  } };
}
test('only a matching active or trialing subscription grants access', async () => {
  assert.equal(await isSubscriber(client([{ id: 1 }]), 'owner'), true);
  assert.equal(await isSubscriber(client([]), 'owner'), false);
});
test('a database failure never grants subscriber access', async () => {
  await assert.rejects(isSubscriber(client(null, { message: 'offline' }), 'owner'));
});
test('callback rejects external and malformed redirect destinations', () => {
  for (const path of ['https://evil.test', '//evil.test', '/\\evil.test', '/\n/evil.test', null]) assert.equal(safeReturnPath(path), '/cennik');
  assert.equal(safeReturnPath('/demo?source=login'), '/demo?source=login');
});
test('uploads reject empty, unsupported, oversized files and full accounts', () => {
  assert.ok(validateUpload('report.csv', 0, []));
  assert.ok(validateUpload('report.exe', 1, []));
  assert.ok(validateUpload('report.csv', MAX_STORAGE_BYTES + 1, []));
  assert.ok(validateUpload('report.csv', 1, [{ size: MAX_STORAGE_BYTES }]));
  assert.ok(validateUpload('report.csv', 1, Array.from({ length: 100 }, () => ({ size: 1 }))));
  assert.equal(validateUpload('report.XLSX', 100, []), null);
});
test('download, deletion and analysis reject paths outside the user folder', () => {
  assert.equal(ownsUpload('owner/report.csv', 'owner'), true);
  for (const path of ['other/report.csv', 'owner/../other/report.csv', 'owner/sub/report.csv', 'owner/..', null]) assert.equal(ownsUpload(path, 'owner'), false);
});
