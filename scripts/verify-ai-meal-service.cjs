const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const clientServicePath = path.join(process.cwd(), 'services', 'aiMealService.ts');
const edgeFunctionPath = path.join(
  process.cwd(),
  'supabase',
  'functions',
  'analyze-meal',
  'index.ts',
);
const clientSource = fs.readFileSync(clientServicePath, 'utf8');
const edgeFunctionSource = fs.readFileSync(edgeFunctionPath, 'utf8');
const { outputText } = ts.transpileModule(clientSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});

const expectedAnalysis = {
  dish_name: 'Salmão com arroz e legumes',
  // A IA devolve 550 (número redondo); o cliente recalibra pela fórmula
  // 4*proteína + 4*hidratos + 9*gordura = 475 kcal.
  estimated_calories: 475,
  macros: { protein_g: 35, carbs_g: 50, fat_g: 15 },
  tags: ['Proteico', 'Quebra Suave'],
  confidence: 'high',
};

async function fetchMock(url, options) {
  assert.equal(url, 'https://example.supabase.co/functions/v1/analyze-meal');
  assert.equal(options.method, 'POST');
  assert.equal(options.headers.apikey, 'public-client-key');
  assert.equal(options.headers.Authorization, 'Bearer public-client-key');
  assert.equal(options.headers['x-goog-api-key'], undefined);

  const body = JSON.parse(options.body);
  assert.equal(body.description, 'salmão, arroz e legumes');
  assert.equal(body.image.mimeType, 'image/jpeg');
  assert.equal(body.image.base64, 'aW1hZ2U=');

  return {
    ok: true,
    status: 200,
    json: async () => expectedAnalysis,
  };
}

async function main() {
  const moduleUnderTest = { exports: {} };
  const loadService = new Function('exports', 'module', 'require', 'process', 'fetch', outputText);
  const testProcess = {
    env: {
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'public-client-key',
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    },
  };

  loadService(moduleUnderTest.exports, moduleUnderTest, require, testProcess, fetchMock);
  const result = await moduleUnderTest.exports.analyzeMeal({
    description: 'salmão, arroz e legumes',
    image: { base64: 'aW1hZ2U=', mimeType: 'image/jpeg' },
  });

  assert.deepEqual(result, expectedAnalysis);
  assert.doesNotMatch(clientSource, /EXPO_PUBLIC_GEMINI_API_KEY/);
  assert.doesNotMatch(clientSource, /generativelanguage\.googleapis\.com/);
  assert.match(edgeFunctionSource, /Deno\.env\.get\('GEMINI_API_KEY'\)/);
  assert.match(edgeFunctionSource, /EXCLUSIVAMENTE com JSON válido/);
  assert.match(edgeFunctionSource, /responseJsonSchema: RESPONSE_SCHEMA/);
  assert.match(edgeFunctionSource, /store: false/);
  process.stdout.write('Proxy e contrato JSON da análise de refeições validados.\n');
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
});
