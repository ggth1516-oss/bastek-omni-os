import { copyFileSync, mkdirSync, existsSync, cpSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { stripTypeScriptTypes } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');
const isWatch = process.argv.includes('--watch');

console.log(`[Bastek Omni-OS] Building extension with isolated formats${isWatch ? ' (WATCH MODE)' : ''}...`);

if (!isWatch && existsSync(dist)) {
  rmSync(dist, { recursive: true, force: true });
}
if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true });
}

copyFileSync(resolve(root, 'manifest.json'), resolve(dist, 'manifest.json'));
if (existsSync(resolve(root, 'public/icons'))) {
  cpSync(resolve(root, 'public/icons'), resolve(dist, 'icons'), { recursive: true });
}

function resolveTsFile(fromDir, spec) {
  const base = resolve(fromDir, spec);
  const candidates = [base, `${base}.ts`, resolve(base, 'index.ts')];
  for (const c of candidates) {
    if (existsSync(c)) {
      try {
        if (readFileSync(c)) return c;
      } catch {}
    }
  }
  throw new Error(`Cannot resolve import "${spec}" from ${fromDir}`);
}

function stripConstructorParamProperties(tsCode) {
  return tsCode.replace(
    /constructor\s*\(([\s\S]*?)\)\s*\{/g,
    (fullMatch, paramsBlock) => {
      const assignments = [];
      const cleanedParams = paramsBlock
        .split(',')
        .map((param) => {
          const trimmed = param.trim();
          if (!trimmed) return param;
          const m = trimmed.match(/^(?:(private|public|protected|readonly)\s+)+([a-zA-Z0-9_$]+)(\??\s*:[\s\S]*)$/);
          if (m) {
            const varName = m[2];
            assignments.push(`this.${varName} = ${varName};`);
            return `${varName}${m[3]}`;
          }
          return param;
        })
        .join(', ');
      if (assignments.length === 0) return fullMatch;
      return `constructor(${cleanedParams}) {\n    ${assignments.join('\n    ')}`;
    }
  );
}

function bundleEntry(entryPath, iife = false) {
  const visited = new Set();
  const chunks = [];

  function visit(filePath) {
    if (visited.has(filePath)) return;
    visited.add(filePath);
    const dir = dirname(filePath);
    const rawTs = readFileSync(filePath, 'utf-8');

    const importRegex = /^\s*import\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"];?\s*$/gm;
    let match;
    while ((match = importRegex.exec(rawTs)) !== null) {
      const block = match[0];
      if (/^\s*import\s+type\s+/.test(block)) continue;
      const target = resolveTsFile(dir, match[1]);
      visit(target);
    }

    const normalizedTs = stripConstructorParamProperties(rawTs);
    const js = stripTypeScriptTypes(normalizedTs)
      .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"];?\s*$/gm, '')
      .replace(/^\s*export\s+\{[^}]*\};?\s*$/gm, '')
      .replace(/^\s*export\s+(const|let|var|function|class|async\s+function)\s+/gm, '$1 ');

    chunks.push(`// --- ${filePath.replace(root + '/', '')} ---\n${js.trim()}`);
  }

  visit(entryPath);
  const body = chunks.join('\n\n');
  return iife ? `(function() {\n"use strict";\n${body}\n})();\n` : `"use strict";\n${body}\n`;
}

try {
  const { build } = await import('vite');
  console.log('-> Compiling via Vite...');
  await build({
    root,
    configFile: false,
    build: {
      outDir: dist,
      emptyOutDir: false,
      target: 'esnext',
      minify: false,
      watch: isWatch ? {} : null,
      lib: {
        entry: resolve(root, 'src/background/service-worker.ts'),
        name: 'background',
        formats: ['es'],
        fileName: () => 'background.js',
      },
    },
  });
  await build({
    root,
    configFile: false,
    build: {
      outDir: dist,
      emptyOutDir: false,
      target: 'esnext',
      minify: false,
      watch: isWatch ? {} : null,
      lib: {
        entry: resolve(root, 'src/content/index.ts'),
        name: 'BastekOmniContent',
        formats: ['iife'],
        fileName: () => 'content.js',
      },
    },
  });
} catch {
  console.log('-> Compiling via Node.js native TypeScript bundler...');
  writeFileSync(resolve(dist, 'background.js'), bundleEntry(resolve(root, 'src/background/service-worker.ts'), false), 'utf-8');
  writeFileSync(resolve(dist, 'content.js'), bundleEntry(resolve(root, 'src/content/index.ts'), true), 'utf-8');
}

console.log('[Bastek Omni-OS] Extension build complete: dist/');
