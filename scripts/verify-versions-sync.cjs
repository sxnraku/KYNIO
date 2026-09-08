const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. package.json
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const pkgVersion = packageJson.version;

// 2. app.json
const appJsonPath = path.join(rootDir, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const appVersion = appJson.expo?.version;
const appVersionCode = appJson.expo?.android?.versionCode;

// 3. android/app/build.gradle
const buildGradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
let gradleVersionCode = null;
let gradleVersionName = null;

if (fs.existsSync(buildGradlePath)) {
  const gradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  const codeMatch = gradleContent.match(/versionCode\s+(\d+)/);
  const nameMatch = gradleContent.match(/versionName\s+["']([^"']+)["']/);
  if (codeMatch) gradleVersionCode = parseInt(codeMatch[1], 10);
  if (nameMatch) gradleVersionName = nameMatch[1];
}

console.log('--- Verificação de Sincronização de Versões ---');
console.log(`package.json:            version = ${pkgVersion}`);
console.log(`app.json:                version = ${appVersion}, versionCode = ${appVersionCode}`);
console.log(`android/app/build.gradle: versionName = ${gradleVersionName}, versionCode = ${gradleVersionCode}`);

const errors = [];

if (pkgVersion !== appVersion) {
  errors.push(`Discrepância de versão: package.json (${pkgVersion}) != app.json (${appVersion})`);
}

if (gradleVersionName && gradleVersionName !== appVersion) {
  errors.push(`Discrepância de versão: android/app/build.gradle (${gradleVersionName}) != app.json (${appVersion})`);
}

if (gradleVersionCode && gradleVersionCode !== appVersionCode) {
  errors.push(`Discrepância de versionCode: android/app/build.gradle (${gradleVersionCode}) != app.json (${appVersionCode})`);
}

if (errors.length > 0) {
  console.error('\n❌ ERRO: As versões não estão sincronizadas!');
  errors.forEach((err) => console.error(` - ${err}`));
  console.error('\nAtualiza TODOS os ficheiros antes de gerar o AAB:');
  console.error(' 1. package.json');
  console.error(' 2. app.json');
  console.error(' 3. android/app/build.gradle');
  process.exit(1);
}

console.log('\n✅ Todas as versões e versionCodes estão sincronizados perfeitamente!');
