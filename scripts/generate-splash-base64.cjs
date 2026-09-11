const fs = require('fs');
const path = require('path');

const iconPath = path.join(__dirname, '..', 'assets', 'images', 'splash-icon.png');
const outPath = path.join(__dirname, '..', 'constants', 'splash-base64.ts');

const buf = fs.readFileSync(iconPath);
const b64 = buf.toString('base64');
const content = `// Auto-gerado a partir de assets/images/splash-icon.png para exibição instantânea no splash screen web (0ms de latência de rede)
export const SPLASH_ICON_BASE64 = "data:image/png;base64,${b64}";
`;

fs.writeFileSync(outPath, content, 'utf8');
console.log('constants/splash-base64.ts gerado com sucesso.');
