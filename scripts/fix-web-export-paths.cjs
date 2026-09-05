const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceInDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const updated = content
        .replaceAll('href="/favicon.png"', 'href="/KYNIO/app/favicon.png"')
        .replaceAll('href="/apple-touch-icon.png"', 'href="/KYNIO/app/apple-touch-icon.png"')
        .replaceAll('href="/manifest.json"', 'href="/KYNIO/app/manifest.json"');
      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log('Updated:', entry.name);
      }
    }
  }
}

replaceInDir(path.join(__dirname, '..', 'legal-site', 'app'));
console.log('Path prefixing complete.');
