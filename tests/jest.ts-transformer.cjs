// Minimal TypeScript transformer for Jest using the TypeScript compiler API.
// Avoids requiring ts-jest in environments where installing workspace deps is flaky.
const path = require('path');
let ts;
const candidateDirs = [
  null,
  path.join(__dirname, 'node_modules/typescript'),
  path.join(__dirname, '..', 'node_modules/typescript'),
  path.join(__dirname, '..', '..', 'node_modules/typescript'),
  path.join(process.cwd(), 'node_modules/typescript'),
  path.join(process.cwd(), '..', 'node_modules/typescript')
];
for (const candidate of candidateDirs) {
  try {
    ts = candidate ? require(candidate) : require('typescript');
    break;
  } catch {}
}
if (!ts) {
  throw new Error('typescript module not found for jest transformer');
}

/** @type {{ process: (src:string, filename:string) => { code: string } }} */
module.exports = {
  process(src, filename) {
    if (/\.(ts|tsx)$/.test(filename)) {
      const result = ts.transpileModule(src, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2019,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
          allowJs: true,
          skipLibCheck: true,
          inlineSourceMap: true
        },
        fileName: filename,
        reportDiagnostics: false
      });
      return { code: result.outputText };
    }
    return { code: src };
  }
};


