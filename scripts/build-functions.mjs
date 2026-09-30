import { build } from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

await build({
  entryPoints: [path.resolve(root, 'netlify/functions/api.mts')],
  outfile: path.resolve(root, 'netlify/functions-serve/api.mjs'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
  external: [],
  nodePaths: [
    path.resolve(root, 'node_modules'),
    path.resolve(root, 'server/node_modules'),
  ],
  alias: {
    '@moyun/core': path.resolve(root, 'packages/core/src/index.ts'),
    '@moyun/core/poem': path.resolve(root, 'packages/core/src/poem/index.ts'),
    '@moyun/core/calligraphy': path.resolve(root, 'packages/core/src/calligraphy/index.ts'),
    '@moyun/core/api': path.resolve(root, 'packages/core/src/api/index.ts'),
    '@moyun/core/types': path.resolve(root, 'packages/core/src/types/index.ts'),
  },
  loader: { '.ts': 'ts' },
})

console.log('✅ Netlify function bundled → netlify/functions-serve/api.mjs')
