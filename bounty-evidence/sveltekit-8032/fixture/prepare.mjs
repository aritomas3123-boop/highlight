import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
const guide = readFileSync('../../../highlight.io/components/QuickstartContent/server/js/sveltekit.tsx', 'utf8')
const snippets = [...guide.matchAll(/text: `([\s\S]*?)`,/g)].map((match) => match[1])
mkdirSync('src/routes/health-highlight', { recursive: true })
mkdirSync('src/routes/prerendered', { recursive: true })
// The only runtime changes are a synthetic project ID and a local OTLP receiver.
writeFileSync('src/hooks.server.ts', snippets[0].replace("projectID: '<YOUR_PROJECT_ID>',", "projectID: 'local-test',\n    otlpEndpoint: 'http://127.0.0.1:4318',"))
writeFileSync('src/routes/health-highlight/+server.ts', snippets[1])
writeFileSync('src/routes/prerendered/+page.svelte', '<h1>Build guard smoke test</h1>')
writeFileSync('src/routes/prerendered/+page.ts', 'export const prerender = true\n')
writeFileSync('src/app.html', '<!doctype html><html lang="en"><head><meta charset="utf-8">%sveltekit.head%</head><body><div style="display: contents">%sveltekit.body%</div></body></html>')
writeFileSync('svelte.config.js', "import adapter from '@sveltejs/adapter-node';\nexport default { kit: { adapter: adapter() } };\n")
writeFileSync('vite.config.ts', "import { sveltekit } from '@sveltejs/kit/vite';\nimport { defineConfig } from 'vite';\nexport default defineConfig({plugins: [sveltekit()]});\n")
writeFileSync('tsconfig.json', JSON.stringify({ extends: './.svelte-kit/tsconfig.json', compilerOptions: { strict: true, skipLibCheck: true, moduleResolution: 'bundler' } }, null, 2))
