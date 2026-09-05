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
  const targetPattern = 'let regexSafePath = path.replace(/[-[\\]{}()+?.,\\\\^$|#\\s]/g, \'\\\\$&\');';
  const replacement = 'let regexSafePath = path.replace(/\\\\/g, \'/\').replace(/[-[\\]{}()+?.,^$|#\\s]/g, \'\\\\$&\');\\n    regexSafePath = regexSafePath.replace(/\\//g, \'[/\\\\\\\\\\\\]\');';

  if (content.includes(targetPattern)) {
    content = content.replace(targetPattern, replacement);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[patch-metro-config] Applied Windows path separator fix to @expo/metro-config.');
  }
}
