import assert from 'node:assert/strict'
import http from 'node:http'
import { gunzipSync } from 'node:zlib'
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const received = []
const receiver = http.createServer((req, res) => {
  const chunks = []
  req.on('data', (chunk) => chunks.push(chunk))
  req.on('end', () => {
    let data = Buffer.concat(chunks)
    if (req.headers['content-encoding'] === 'gzip') data = gunzipSync(data)
    try { received.push({ path: req.url, data: JSON.parse(data.toString()) }) }
    catch { received.push({ path: req.url, raw: data.toString('base64') }) }
    res.writeHead(200, { 'content-type': 'application/json' }); res.end('{}')
  })
})
await new Promise((resolve) => receiver.listen(4318, '127.0.0.1', resolve))
let logs = ''
const app = spawn(process.execPath, ['build'], { env: { ...process.env, PORT: '4173', HOST: '127.0.0.1', ORIGIN: 'http://127.0.0.1:4173' }, stdio: ['ignore', 'pipe', 'pipe'] })
app.stdout.on('data', (data) => { logs += data.toString() })
app.stderr.on('data', (data) => { logs += data.toString() })
try {
  for (let i = 0; i < 100 && !logs.includes('Listening'); i++) await new Promise((resolve) => setTimeout(resolve, 100))
  assert.ok(logs.includes('Listening'), logs)
  console.log('Production adapter-node server listening on localhost:4173')
  let response = await fetch('http://127.0.0.1:4173/health-highlight', { headers: { 'x-highlight-request': 'demo-session/demo-request' } })
  assert.equal(response.status, 200); assert.equal(await response.text(), 'ok')
  console.log('PASS GET /health-highlight: 200 ok')
  response = await fetch('http://127.0.0.1:4173/health-highlight?error=1', { headers: { 'x-highlight-request': 'demo-session/demo-error-request' } })
  assert.equal(response.status, 500); assert.ok((await response.text()).includes('Internal Error'))
  console.log('PASS GET /health-highlight?error=1: 500 with generic public message')
  response = await fetch('http://127.0.0.1:4173/health-highlight')
  assert.equal(response.status, 200)
  console.log('PASS request without browser correlation header: 200 ok')
  response = await fetch('http://127.0.0.1:4173/prerendered')
  assert.equal(response.status, 200)
  console.log('PASS prerendered page: 200')
  await new Promise((resolve) => setTimeout(resolve, 6500))
  const spans = received.flatMap((item) => (item.data?.resourceSpans ?? []).flatMap((r) => r.scopeSpans.flatMap((s) => s.spans)))
  const records = received.flatMap((item) => (item.data?.resourceLogs ?? []).flatMap((r) => r.scopeLogs.flatMap((s) => s.logRecords)))
  const attr = (attrs, key) => attrs?.find((a) => a.key === key)?.value
  const requests = spans.filter((s) => s.name === 'GET /health-highlight')
  assert.ok(requests.length >= 3, JSON.stringify(received))
  assert.ok(requests.some((s) => attr(s.attributes, 'highlight.session_id')?.stringValue === 'demo-session'))
  assert.ok(records.some((r) => r.body?.stringValue?.includes('Highlight server instrumentation verification')))
  const errors = spans.flatMap((span) => (span.events ?? []).map((event) => ({ span, event }))).filter(({ event }) => event.name === 'exception')
  assert.ok(errors.some(({ event }) => attr(event.attributes, 'exception.message')?.stringValue === 'Highlight SvelteKit server verification error'), JSON.stringify(received))
  console.log('PASS local OTLP receiver: request spans and console logs exported')
  console.log('PASS local OTLP receiver: unexpected exception exported')
  console.log('PASS session correlation: highlight.session_id = demo-session')
  console.log('Scope: real SDK 3.12.1, SvelteKit 2, local collector. Hosted Highlight ingestion not tested.')
  writeFileSync('runtime-evidence.json', JSON.stringify({ received, logs }, null, 2))
} finally {
  app.kill('SIGTERM')
  await new Promise((resolve) => receiver.close(resolve))
}
