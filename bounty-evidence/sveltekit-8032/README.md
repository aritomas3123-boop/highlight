# SvelteKit quickstart verification

Evidence for https://github.com/highlight/highlight/pull/10676.

[Short demo video](./demo.mp4) walks through the corrected source and recorded local test output.

Tested source: da3545158f5629cb8bc5114eded62afd8e8528c4.

From this checkout, with Node 24:

```sh
node --test scripts/verify-sveltekit-quickstart.mjs
cd bounty-evidence/sveltekit-8032/fixture
npm ci
node prepare.mjs
npx svelte-kit sync
npx svelte-check --tsconfig ./tsconfig.json
npx vite build
node verify-runtime.mjs
```

The fixture extracts the exact snippets from the guide. Its only changes replace the placeholder project ID with a synthetic ID and point the SDK to a local OTLP receiver. It binds local ports 4173 and 4318.

Verified: nine regression tests, clean Svelte typecheck, adapter-node production build and prerender, success/error endpoints, requests without session headers, exported request spans/logs/exception, and synthetic session correlation.

Not tested: full Highlight monorepo/Next.js build or hosted Highlight ingestion/replay. The video shows code and recorded test output, not a hosted dashboard.

This evidence branch keeps the video and isolated fixture out of the upstream documentation diff.
