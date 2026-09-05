const fs = require('fs');
const path = require('path');

// Este patch corrige separadores de caminho no Windows; em Linux/macOS não é necessário
if (process.platform !== 'win32') {
  console.log('[patch-metro-config] Plataforma não-Windows, patch ignorado.');
  process.exit(0);
}

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'metro-config',
  'build',
  'serializer',
  'serializeChunks.js'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');

  // 1. Case-insensitive RegExp and slash replacement
  if (!content.includes("new RegExp('^' + regexSafePath + '$', 'i')")) {
    content = content.replace(
      "return new RegExp('^' + regexSafePath + '$');",
      "return new RegExp('^' + regexSafePath + '$', 'i');"
    );
  }

  // 2. Normalize both slash formats in getEntryModulesForChunkSettings
  const originalGetEntry = "if (settings.test.test(entry[0])) {";
  const patchedGetEntry = "if (settings.test.test(entry[0]) || settings.test.test(entry[0].replace(/\\\\/g, '/')) || settings.test.test(entry[0].replace(/\\//g, '\\\\\\\\'))) {";
  if (content.includes(originalGetEntry) && !content.includes(patchedGetEntry)) {
    content = content.replace(originalGetEntry, patchedGetEntry);
  }

  // 3. Graceful handling of worker chunks (prevent crashing on Windows when asyncChunks is empty)
  const targetAssert = "(0, assert_1.default)(asyncChunks.size, `Worker chunk not found for: ${dependency.absolutePath}`);";
  const gracefulWorker = `if (asyncChunks.size) {
                        for (const chunk of asyncChunks) {
                            chunk.seal();
                        }
                    }`;

  if (content.includes(targetAssert)) {
    content = content.replace(
      `${targetAssert}\n                    for (const chunk of asyncChunks) {\n                        chunk.seal();\n                    }`,
      gracefulWorker
    );
  }

  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('[patch-metro-config] Applied graceful worker chunk handling to @expo/metro-config.');
}
