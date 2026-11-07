/claim #8032

Closes #8032 (documentation contribution).

## Summary
- Add a Node-runtime SvelteKit server quickstart and register its documentation route.
- Use `H.runWithHeaders(name, headers, callback)` with stable route names and copied request headers.
- Skip initialization and telemetry during build/prerender, and report unexpected SvelteKit errors through `handleError`.
- Document local verification, browser session correlation, privacy, and serverless flush limitations.
- Add nine executable regression tests for the documented examples.

## Demo
[Watch the 56-second demo video](https://raw.githubusercontent.com/aritomas3123-boop/highlight/c5ded080deb635e2f5538ec6bc93c90b587c28d3/bounty-evidence/sveltekit-8032/demo.mp4) · [Video file](https://github.com/aritomas3123-boop/highlight/blob/c5ded080deb635e2f5538ec6bc93c90b587c28d3/bounty-evidence/sveltekit-8032/demo.mp4)

[Reproducible fixture and recorded results](https://github.com/aritomas3123-boop/highlight/blob/c5ded080deb635e2f5538ec6bc93c90b587c28d3/bounty-evidence/sveltekit-8032/README.md). The video walks through the corrected snippets and recorded local test output; it does not demonstrate hosted Highlight ingestion. Evidence is kept on a separate branch in my fork so the binary does not enter the upstream diff.

## Verification
- `node --test scripts/verify-sveltekit-quickstart.mjs`: 9 passed.
- Prettier checks on changed JavaScript/TypeScript files: passed.
- `git diff --check`: passed.
- Isolated SvelteKit fixture using `@highlight-run/node` 3.12.1, SvelteKit 2.70.4, adapter-node 5.5.8, and Node 24: `svelte-check` reported 0 errors and 0 warnings; production build and prerender passed.
- Production adapter-node runtime: successful and failing requests, uncorrelated requests, and prerendered page checked. A local OTLP receiver verified request spans, console logs, the unexpected exception, and session correlation.

## CI status for da3545158f5629cb8bc5114eded62afd8e8528c4
- Snyk passed.
- GitHub Actions reports `action_required`, including the Monorepo workflow. These are not completed test passes.
- Vercel reports a deployment authorization failure; Reflame preview is skipped pending maintainer approval.

## Limits
- Full Highlight monorepo/Next.js build and hosted Highlight ingestion/replay were not tested.
- This is a documentation-only contribution, with no SDK version bump.
- Prepared with AI assistance. Acceptance and any bounty award remain subject to maintainer review.
