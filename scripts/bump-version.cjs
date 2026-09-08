const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Usage: node scripts/bump-version.cjs [newVersion] [newVersionCode]
// e.g.:  node scripts/bump-version.cjs 1.3.5 31
// or:    node scripts/bump-version.cjs 31 (bumps only versionCode to 31)
// or:    node scripts/bump-version.cjs (bumps versionCode by +1)

const args = process.argv.slice(2);
const packageJsonPath = path.join(rootDir, 'package.json');
const appJsonPath = path.join(rootDir, 'app.json');
const buildGradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

let currentVersion = appJson.expo?.version || packageJson.version || '1.0.0';
let currentVersionCode = appJson.expo?.android?.versionCode || 1;

let nextVersion = currentVersion;
let nextVersionCode = currentVersionCode + 1;

if (args.length === 1) {
  if (/^\d+$/.test(args[0])) {
    nextVersionCode = parseInt(args[0], 10);
  } else {
    nextVersion = args[0];
  }
} else if (args.length >= 2) {
  nextVersion = args[0];
  nextVersionCode = parseInt(args[1], 10);
}

console.log(`Atualizando versões em TODO o projeto:`);
console.log(`Versão: ${currentVersion} -> ${nextVersion}`);
console.log(`versionCode: ${currentVersionCode} -> ${nextVersionCode}`);

// 1. package.json
packageJson.version = nextVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
console.log(`✅ Atualizado package.json`);

// 2. app.json
appJson.expo.version = nextVersion;
if (!appJson.expo.android) appJson.expo.android = {};
appJson.expo.android.versionCode = nextVersionCode;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
console.log(`✅ Atualizado app.json`);

// 3. android/app/build.gradle
if (fs.existsSync(buildGradlePath)) {
  let gradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${nextVersionCode}`);
  gradleContent = gradleContent.replace(/versionName\s+["'][^"']+["']/, `versionName "${nextVersion}"`);
  fs.writeFileSync(buildGradlePath, gradleContent, 'utf8');
  console.log(`✅ Atualizado android/app/build.gradle`);
} else {
  console.warn(`⚠️ android/app/build.gradle não encontrado!`);
}

console.log(`\n🎉 Versões sincronizadas com sucesso em todos os 3 locais!`);
