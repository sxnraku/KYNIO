const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(process.cwd(), 'legal-site');
const htmlFiles = [
  'index.html',
  'privacy.html',
  'terms.html',
  'account-deletion.html',
  'support.html',
];

for (const fileName of htmlFiles) {
  const filePath = path.join(root, fileName);
  assert.equal(fs.existsSync(filePath), true, `${fileName} não existe`);
  const html = fs.readFileSync(filePath, 'utf8');
  assert.match(html, /<meta name="viewport"/);
  assert.match(html, /data-language="pt"/);
  assert.match(html, /data-language="en"/);

  const localReferences = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((reference) => !/^(?:https?:|#|mailto:)/.test(reference));

  for (const reference of localReferences) {
    assert.equal(
      fs.existsSync(path.join(root, reference)),
      true,
      `${fileName} referencia ${reference}, que não existe`,
    );
  }
}

const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
const deletion = fs.readFileSync(path.join(root, 'account-deletion.js'), 'utf8');
const config = fs.readFileSync(path.join(root, 'config.js'), 'utf8');

assert.match(privacy, /Google Gemini/);
assert.match(privacy, /Supabase/);
assert.match(privacy, /account-deletion\.html/);
assert.match(deletion, /functions\.invoke\('delete-account'\)/);
assert.doesNotMatch(config, /supabaseUrl:\s*''/);
assert.doesNotMatch(config, /supabasePublishableKey:\s*''/);

process.stdout.write('Site legal, links e eliminação de conta validados.\n');
