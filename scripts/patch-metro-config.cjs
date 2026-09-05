const fs = require('fs');
const path = require('path');

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

  // 3. Fallback for worker chunk lookup on Windows
  const targetAssert = "(0, assert_1.default)(asyncChunks.size, `Worker chunk not found for: ${dependency.absolutePath}`);";
  const workerFallback = `if (!asyncChunks.size) {
                        const targetNormalized = dependency.absolutePath.toLowerCase().replace(/\\\\/g, '/');
                        for (const [depPath, depMod] of graph.dependencies) {
                            if (depPath.toLowerCase().replace(/\\\\/g, '/') === targetNormalized) {
                                const fallbackChunks = gatherChunks(runtimePremodules, chunks, { test: { test: (p) => p.toLowerCase().replace(/\\\\/g, '/') === targetNormalized } }, runtimePremodules, graph, options, true, isWorker);
                                for (const ch of fallbackChunks) {
                                    asyncChunks.add(ch);
                                }
                                break;
                            }
                        }
                    }
                    ${targetAssert}`;

  if (content.includes(targetAssert) && !content.includes("targetNormalized")) {
    content = content.replace(targetAssert, workerFallback);
  }

  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('[patch-metro-config] Applied comprehensive Windows path & worker fix to @expo/metro-config.');
}
