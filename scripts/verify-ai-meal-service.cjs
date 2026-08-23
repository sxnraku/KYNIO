const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const servicePath = path.join(process.cwd(), 'services', 'aiMealService.ts');
const source = fs.readFileSync(servicePath, 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});

const expectedAnalysis = {
  dish_name: 'Salmão com arroz e legumes',
  estimated_calories: 550,
  macros: { protein_g: 35, carbs_g: 50, fat_g: 15 },
  tags: ['Proteico', 'Quebra Suave'],
  confidence: 'high',
};

async function fetchMock(url, options) {
  assert.equal(
    url,
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent',
  );
  assert.equal(options.method, 'POST');
  assert.equal(options.headers['x-goog-api-key'], 'contract-test-key');

  const body = JSON.parse(options.body);
  assert.equal(body.store, false);
  assert.equal(body.generationConfig.responseMimeType, 'application/json');
  assert.equal(body.generationConfig.responseJsonSchema.type, 'object');
  assert.match(body.systemInstruction.parts[0].text, /EXCLUSIVAMENTE com JSON válido/);
  assert.match(body.contents[0].parts[0].text, /salmão, arroz e legumes/);
  assert.equal(body.contents[0].parts[1].inlineData.mimeType, 'image/jpeg');
  assert.equal(body.contents[0].parts[1].inlineData.data, 'aW1hZ2U=');

  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [
        {
          content: { parts: [{ text: JSON.stringify(expectedAnalysis) }] },
        },
      ],
    }),
  };
}

async function main() {
  const moduleUnderTest = { exports: {} };
  const loadService = new Function('exports', 'module', 'require', 'process', 'fetch', outputText);
  const testProcess = { env: { EXPO_PUBLIC_GEMINI_API_KEY: 'contract-test-key' } };

  loadService(moduleUnderTest.exports, moduleUnderTest, require, testProcess, fetchMock);
  const result = await moduleUnderTest.exports.analyzeMeal({
    description: 'salmão, arroz e legumes',
    image: { base64: 'aW1hZ2U=', mimeType: 'image/jpeg' },
  });

  assert.deepEqual(result, expectedAnalysis);
  process.stdout.write('Contrato JSON da análise de refeições validado.\n');
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
});
