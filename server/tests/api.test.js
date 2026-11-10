// Backend regression tests - run with:  cd server && npm test
// They need the API running (npm start) against a TEST database that
// was prepared with `npm run db:setup`. They only INSERT new sessions
// with random ids; they never delete or reset anything. Set
// API_URL if the API is not at http://localhost:4000/api/v1.
// Uses Node's built-in test runner (Node 18+), no extra packages.
require('dotenv').config(); // same DB_* settings as the server (server/.env)
const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const API = process.env.API_URL || 'http://localhost:4000/api/v1';
const call = async (method, path, body) => {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null), headers: res.headers };
};
const answers = (fn) => Array.from({ length: 20 }, (_, i) => ({ questionId: i + 1, likertValue: fn(i + 1) }));
const body = (o = {}) => ({
  sessionId: randomUUID(),
  studentInfo: { firstName: 'Juan', lastName: 'Dela Cruz', additionalInfo: { age: '18' } },
  language: 'en',
  answers: answers(() => 3),
  ...o,
});

test('scoring: all Strongly Agree / Disagree / Neutral give finite, valid scores', async () => {
  for (const [v, pct] of [[5, 100], [1, 20], [3, 60]]) {
    const b = body({ answers: answers(() => v) });
    const sub = await call('POST', '/assessment/submit', b);
    assert.equal(sub.status, 201);
    const res = await call('GET', `/results/${b.sessionId}`);
    assert.equal(res.status, 200);
    assert.equal(res.json.data.results.length, 4);
    for (const r of res.json.data.results) {
      assert.ok(Number.isFinite(r.percentageScore));
      assert.equal(r.percentageScore, pct);
      assert.equal(r.rank, 1); // four-way tie shares rank 1 by design
    }
  }
});

test('scoring: ranking is dynamic (favoring one program puts it first)', async () => {
  const fav = { DTE: 1, DCI: 6, DBA: 11, DAS: 16 };
  for (const [code, first] of Object.entries(fav)) {
    const b = body({ answers: answers((q) => (q >= first && q < first + 5 ? 5 : 1)) });
    await call('POST', '/assessment/submit', b);
    const { json } = await call('GET', `/results/${b.sessionId}`);
    assert.equal(json.data.results[0].departmentCode, code);
    assert.equal(json.data.results[0].percentageScore, 100);
    assert.equal(json.data.results[1].rank, 2);
  }
});

test('a finished session id cannot be submitted twice', async () => {
  const b = body();
  assert.equal((await call('POST', '/assessment/submit', b)).status, 201);
  assert.equal((await call('POST', '/assessment/submit', b)).status, 409);
});

test('simultaneous submits of one session: exactly one wins', async () => {
  const b = body();
  const codes = (await Promise.all(Array.from({ length: 15 }, () => call('POST', '/assessment/submit', b)))).map((r) => r.status);
  assert.equal(codes.filter((c) => c === 201).length, 1);
  assert.equal(codes.filter((c) => c === 409).length, 14);
  assert.equal((await call('GET', `/results/${b.sessionId}`)).json.data.results.length, 4);
});

test('server rejects invalid input with 400', async () => {
  const bad = [
    body({ sessionId: 'a'.repeat(100) }),
    body({ sessionId: "x' OR '1'='1" }),
    body({ studentInfo: { firstName: '12345', additionalInfo: { age: '18' } } }),
    body({ studentInfo: { firstName: '<script>', additionalInfo: { age: '18' } } }),
    body({ studentInfo: { firstName: 'a'.repeat(300), additionalInfo: { age: '18' } } }),
    ...['-5', 'abc', '999', '17.5', '0', '5'].map((age) => body({ studentInfo: { firstName: 'Juan', additionalInfo: { age } } })),
    body({ language: 'xx' }),
    body({ answers: answers(() => 5.5) }),
    body({ answers: answers(() => '5') }),
    body({ answers: answers(() => null) }),
    body({ answers: answers(() => 0) }),
    body({ answers: answers(() => 6) }),
    body({ answers: answers(() => 3).slice(0, 19) }),
    body({ answers: [...answers(() => 3).slice(0, 19), { questionId: 1, likertValue: 3 }] }),
    body({ answers: [...answers(() => 3).slice(0, 19), { questionId: 21, likertValue: 3 }] }),
  ];
  for (const b of bad) {
    const r = await call('POST', '/assessment/submit', b);
    assert.equal(r.status, 400, JSON.stringify(r.json));
    assert.equal(r.json.success, false);
  }
});

test('legitimate names are accepted', async () => {
  for (const [first, last] of [['Anne-Marie', "O'Connor"], ['José', 'Ñuñez'], ['Nguyễn', 'Văn An'], ['李小龍', null], ['Ma.', 'Cristina Reyes Jr.']]) {
    const r = await call('POST', '/assessment/submit', body({ studentInfo: { firstName: first, lastName: last, additionalInfo: { age: '19' } } }));
    assert.equal(r.status, 201, `${first} ${last} -> ${JSON.stringify(r.json)}`);
  }
});

test('results / readiness lookups: invalid ids give clean 404, no 500', async () => {
  for (const id of ['not-a-session', "x' OR '1'='1", 'a'.repeat(300), randomUUID()]) {
    const r = await call('GET', `/results/${encodeURIComponent(id)}`);
    assert.equal(r.status, 404);
  }
  assert.equal((await call('GET', '/readiness/XXX')).status, 404);
  for (const c of ['DTE', 'DCI', 'DBA', 'DAS', 'dci']) {
    const r = await call('GET', `/readiness/${c}`);
    assert.equal(r.status, 200);
    assert.equal(r.json.data.sections.length, 7);
  }
});

test('malformed requests and unknown routes give JSON errors, not stack traces', async () => {
  const bad = await fetch(API + '/assessment/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"a":' });
  assert.equal(bad.status, 400);
  const j = await bad.json();
  assert.equal(j.success, false);
  assert.ok(!/at \S+ \(/.test(JSON.stringify(j)));
  assert.equal((await call('GET', '/nope')).status, 404);
});

test('X-Powered-By is not exposed', async () => {
  assert.equal((await call('GET', '/health')).headers.get('x-powered-by'), null);
});

test('scoring matrix: every uniform answer and every single-program pattern', async () => {
  // All answers v => raw = 5v, max = 25 for every program => v/5*100 %.
  for (const [v, pct] of [[5, 100], [4, 80], [3, 60], [2, 40], [1, 20]]) {
    const b = body({ answers: answers(() => v) });
    assert.equal((await call('POST', '/assessment/submit', b)).status, 201);
    const { json } = await call('GET', `/results/${b.sessionId}`);
    assert.deepEqual(json.data.results.map((r) => [r.percentageScore, r.rank]), [[pct, 1], [pct, 1], [pct, 1], [pct, 1]]);
  }
  // Strongly Agree for one program, Strongly Disagree for the rest => 100 / 20 / 20 / 20.
  for (const [code, first] of [['DTE', 1], ['DCI', 6], ['DBA', 11], ['DAS', 16]]) {
    const b = body({ answers: answers((q) => (q >= first && q < first + 5 ? 5 : 1)) });
    await call('POST', '/assessment/submit', b);
    const { json } = await call('GET', `/results/${b.sessionId}`);
    const r = json.data.results;
    assert.equal(r[0].departmentCode, code);
    assert.deepEqual(r.map((x) => x.percentageScore), [100, 20, 20, 20]);
    assert.deepEqual(r.map((x) => x.rank), [1, 2, 2, 2]);
  }
  // Mixed: the percentage of each program equals sum(its 5 answers)/25, computed independently here.
  const mixed = [5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 2, 2, 5, 5, 1, 4, 4, 4, 4, 2];
  const b = body({ answers: answers((q) => mixed[q - 1]) });
  await call('POST', '/assessment/submit', b);
  const { json } = await call('GET', `/results/${b.sessionId}`);
  const expected = { DTE: 15, DCI: 15, DBA: 15, DAS: 18 };
  for (const r of json.data.results) assert.equal(r.percentageScore, (expected[r.departmentCode] / 25) * 100);
  assert.equal(json.data.results[0].departmentCode, 'DAS');
  assert.deepEqual(json.data.results.map((r) => r.rank), [1, 2, 2, 2]);
});

test('reopening a saved result returns identical data every time', async () => {
  const b = body({ answers: answers((q) => (q % 5) + 1) });
  await call('POST', '/assessment/submit', b);
  const first = await call('GET', `/results/${b.sessionId}`);
  const second = await call('GET', `/results/${b.sessionId}`);
  assert.deepEqual(first.json.data, second.json.data);
});

test('security headers are present and results are not cacheable', async () => {
  const r = await call('GET', '/health');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(r.headers.get('x-frame-options'), 'DENY');
  assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(r.headers.get('referrer-policy'), 'no-referrer');
});

test('CORS only allows the configured client origin', async () => {
  const ok = await fetch(API + '/health', { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(ok.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const other = await fetch(API + '/health', { headers: { Origin: 'http://evil.example' } });
  assert.notEqual(other.headers.get('access-control-allow-origin'), 'http://evil.example');
});

test('oversized request body is refused with 413', async () => {
  const res = await fetch(API + '/assessment/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ x: 'a'.repeat(200000) }) });
  assert.equal(res.status, 413);
});

test('too-long school name / strand / gender are rejected', async () => {
  const mk = (extra) => body({ studentInfo: { firstName: 'Juan', additionalInfo: { age: '18' }, ...extra } });
  assert.equal((await call('POST', '/assessment/submit', mk({ schoolName: 'S'.repeat(201) }))).status, 400);
  assert.equal((await call('POST', '/assessment/submit', mk({ schoolName: 12345 }))).status, 400);
  assert.equal((await call('POST', '/assessment/submit', mk({ seniorHighStrand: 'x'.repeat(101) }))).status, 400);
  assert.equal((await call('POST', '/assessment/submit', mk({ schoolName: 'City College of Calamba' }))).status, 201);
});

test('SHS Track / Elective Cluster: only the 15 Strengthened SHS codes (or empty) are accepted; client and server lists match', async () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const { SHS_TRACK_CODES } = require('../src/services/assessment.service');
  const clientCodes = [...fs.readFileSync(path.join(__dirname, '../../client/src/constants/shsTracks.js'), 'utf8').matchAll(/value:\s*'([a-z_]+)'/g)].map((m) => m[1]);
  assert.equal(SHS_TRACK_CODES.length, 15);
  assert.deepEqual([...clientCodes].sort(), [...SHS_TRACK_CODES].sort());
  const mk = (strand) => body({ studentInfo: { firstName: 'Juan', additionalInfo: { age: '18' }, seniorHighStrand: strand } });
  for (const old of ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'stem', 'abm']) {
    assert.equal((await call('POST', '/assessment/submit', mk(old))).status, 400, old + ' must be rejected');
  }
  assert.equal((await call('POST', '/assessment/submit', mk('techpro_maritime'))).status, 201);
  assert.equal((await call('POST', '/assessment/submit', mk(''))).status, 201);
});

test('rate limiter: a flood gets 429 and then recovers (separate server on port 4010)', async () => {
  const { spawn } = require('node:child_process');
  const path = require('node:path');
  const srv = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '4010', RATE_LIMIT_MAX: '5', RATE_LIMIT_WINDOW_MS: '1500' },
    stdio: 'ignore',
  });
  try {
    const url = 'http://localhost:4010/api/v1/health';
    for (let i = 0; i < 40 && !(await fetch(url).then((r) => r.ok).catch(() => false)); i += 1) await new Promise((r) => setTimeout(r, 250));
    const codes = [];
    for (let i = 0; i < 12; i += 1) codes.push((await fetch(url)).status);
    assert.ok(codes.includes(429), codes.join());
    assert.equal(codes[0], 200);
    await new Promise((r) => setTimeout(r, 1800));
    assert.equal((await fetch(url)).status, 200);
  } finally {
    srv.kill();
  }
});

test('db:setup refuses to wipe a database that has saved assessments (scratch database)', async () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const mysql = require('mysql2/promise');
  const DB = 'ccc_pathfinder_guard_test';
  const env = { ...process.env, DB_NAME: DB };
  const run = (args = []) => spawnSync('node', ['scripts/setupDatabase.js', ...args], { cwd: path.join(__dirname, '..'), env, encoding: 'utf8' });
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '',
  });
  try {
    assert.equal(run().status, 0); // empty scratch DB: allowed
    await conn.query(`INSERT INTO \`${DB}\`.assessment_sessions (id, first_name, status, started_at) VALUES (?, 'Keep', 'completed', NOW())`, [randomUUID()]);
    const refused = run();
    assert.equal(refused.status, 2);
    const [[{ n }]] = await conn.query(`SELECT COUNT(*) AS n FROM \`${DB}\`.assessment_sessions`);
    assert.equal(n, 1); // data untouched
    assert.equal(run(['--force']).status, 0);
    const [[{ n: after }]] = await conn.query(`SELECT COUNT(*) AS n FROM \`${DB}\`.assessment_sessions`);
    assert.equal(after, 0); // --force really resets (scratch DB only)
  } finally {
    await conn.query(`DROP DATABASE IF EXISTS \`${DB}\``); // scratch database created by this test
    await conn.end();
  }
});

test('TRUST_PROXY: rate limit counts each forwarded client separately (separate server on port 4011)', async () => {
  const { spawn } = require('node:child_process');
  const path = require('node:path');
  const run = async (trust) => {
    const port = trust ? 4011 : 4012;
    const srv = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: String(port), RATE_LIMIT_MAX: '3', RATE_LIMIT_WINDOW_MS: '60000', ...(trust ? { TRUST_PROXY: '1' } : { TRUST_PROXY: '' }) },
      stdio: 'ignore',
    });
    try {
      for (let i = 0; i < 40; i++) { try { if ((await fetch(`http://localhost:${port}/api/v1/health`)).ok) break; } catch { /* starting */ } await new Promise((r) => setTimeout(r, 150)); }
      const hit = async (ip) => (await fetch(`http://localhost:${port}/api/v1/health`, { headers: { 'X-Forwarded-For': ip } })).status;
      const a = []; for (let i = 0; i < 5; i++) a.push(await hit('203.0.113.1'));
      const other = await hit('203.0.113.2');
      return { a, other };
    } finally { srv.kill(); }
  };
  const withProxy = await run(true);
  assert.deepEqual(withProxy.a, [200, 200, 200, 429, 429]); // client 1 is limited ...
  assert.equal(withProxy.other, 200); // ... client 2 (different forwarded IP) is not
  const withoutProxy = await run(false);
  assert.equal(withoutProxy.other, 429); // default: header ignored, everyone shares the connection IP (safe against spoofing)
});
