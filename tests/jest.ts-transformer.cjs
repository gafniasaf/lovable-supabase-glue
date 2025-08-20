// Minimal TypeScript transformer for Jest using the TypeScript compiler API.
// Avoids requiring ts-jest in environments where installing workspace deps is flaky.
const ts = require('typescript');

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


