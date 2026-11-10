// Scoring tests. Needs the API running against a TEST database (see tests/README.md).
// Uses an independent oracle written from the specification: percentage = sum(weight*answer) / sum(weight*5) * 100,
// all 20 questions weigh 1.00 for their own department (DTE 1-5, DCI 6-10, DBA 11-15, DAS 16-20), standard competition ranking.
require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const mysql = require('mysql2/promise');

const API = process.env.API_URL || 'http://localhost:4000/api/v1';
const DEPTS = ['DTE', 'DCI', 'DBA', 'DAS'];
const deptOf = (q) => DEPTS[Math.floor((q - 1) / 5)];
const post = async (path, body) => { const r = await fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { status: r.status, json: await r.json() }; };
const get = async (path) => { const r = await fetch(API + path); return { status: r.status, json: await r.json() }; };

function oracle(valueOf) {
  const sum = Object.fromEntries(DEPTS.map((d) => [d, 0]));
  for (let q = 1; q <= 20; q++) sum[deptOf(q)] += valueOf(q);
  const pct = Object.fromEntries(DEPTS.map((d) => [d, Math.round((sum[d] / 25) * 10000) / 100]));
  const rank = Object.fromEntries(DEPTS.map((d) => [d, 1 + DEPTS.filter((o) => pct[o] > pct[d]).length]));
  return { pct, rank };
}
async function submit(valueOf, extra = {}) {
  const sessionId = randomUUID();
  const answers = Array.from({ length: 20 }, (_, i) => ({ questionId: i + 1, likertValue: valueOf(i + 1) }));
  const sub = await post('/assessment/submit', { sessionId, language: 'en', studentInfo: { firstName: 'Audit', lastName: 'Test', additionalInfo: { age: 18 } }, answers, ...extra });
  assert.equal(sub.status, 201, JSON.stringify(sub.json));
  return sessionId;
}
function assertMatches(res, valueOf, label) {
  const { pct, rank } = oracle(valueOf);
  assert.equal(res.status, 200, label);
  const rows = res.json.data.results;
  assert.equal(rows.length, 4, label);
  assert.deepEqual(rows.map((r) => r.departmentCode).sort(), [...DEPTS].sort(), label);
  for (const r of rows) {
    assert.equal(r.percentageScore, pct[r.departmentCode], `${label}: ${r.departmentCode} percentage`);
    assert.equal(r.rank, rank[r.departmentCode], `${label}: ${r.departmentCode} rank`);
  }
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].percentageScore >= rows[i].percentageScore, `${label}: sorted high to low`);
}

test('each single question moves only its own department (all 20 questions x answers 5 and 1 over a neutral base)', async () => {
  for (let q = 1; q <= 20; q++) {
    for (const v of [5, 1]) {
      const f = (id) => (id === q ? v : 3);
      const id = await submit(f);
      const res = await get(`/results/${id}`);
      assertMatches(res, f, `q${q}=${v}`);
      const changed = res.json.data.results.filter((r) => r.percentageScore !== 60).map((r) => r.departmentCode);
      assert.deepEqual(changed, [deptOf(q)], `question ${q} must affect only ${deptOf(q)}`);
    }
  }
});

test('every uniform answer pattern 1..5 and every "one program strongest" pattern matches the oracle', async () => {
  for (let v = 1; v <= 5; v++) { const f = () => v; assertMatches(await get(`/results/${await submit(f)}`), f, `uniform ${v}`); }
  for (const target of DEPTS) for (const [hi, lo] of [[5, 1], [5, 3], [4, 2], [3, 1]]) {
    const f = (q) => (deptOf(q) === target ? hi : lo);
    const res = await get(`/results/${await submit(f)}`);
    assertMatches(res, f, `${target} ${hi}/${lo}`);
    assert.equal(res.json.data.results[0].departmentCode, target);
  }
});

test('300 random answer sets: API result equals oracle, equals itself on re-fetch, and equals the stored database rows', async () => {
  const conn = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT) || 3306, user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'ccc_pathfinder' });
  try {
    for (let n = 0; n < 300; n++) {
      const vals = Array.from({ length: 21 }, () => 1 + Math.floor(Math.random() * 5));
      const f = (q) => vals[q];
      const id = await submit(f);
      const a = await get(`/results/${id}`);
      assertMatches(a, f, `random ${n}`);
      assert.deepEqual((await get(`/results/${id}`)).json.data, a.json.data, 'second fetch identical');
      const [stored] = await conn.query('SELECT d.code, r.percentage_score, r.rank_position FROM result_scores r JOIN departments d ON d.id = r.department_id WHERE r.session_id = ?', [id]);
      assert.equal(stored.length, 4);
      for (const s of stored) {
        const api = a.json.data.results.find((r) => r.departmentCode === s.code);
        assert.equal(Number(s.percentage_score), api.percentageScore); assert.equal(s.rank_position, api.rank);
      }
      const [ans] = await conn.query('SELECT question_id, likert_value FROM assessment_answers WHERE session_id = ? ORDER BY question_id', [id]);
      assert.equal(ans.length, 20);
      ans.forEach((r) => assert.equal(r.likert_value, f(r.question_id)));
    }
  } finally { await conn.end(); }
});

test('submitted student details are stored in the right columns', async () => {
  const conn = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT) || 3306, user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'ccc_pathfinder' });
  try {
    const id = await submit(() => 3, { language: 'fil', studentInfo: { firstName: 'Ana', lastName: 'Santos', schoolName: 'Test SHS', seniorHighStrand: 'academic_stem', additionalInfo: { age: 19, gender: 'Female' } } });
    const [[row]] = await conn.query('SELECT * FROM assessment_sessions WHERE id = ?', [id]);
    assert.equal(row.first_name, 'Ana'); assert.equal(row.last_name, 'Santos'); assert.equal(row.age, 19);
    assert.equal(row.gender, 'Female'); assert.equal(row.senior_high_strand, 'academic_stem'); assert.equal(row.school_name, 'Test SHS');
    assert.equal(row.language, 'fil'); assert.equal(row.status, 'completed'); assert.ok(row.completed_at);
  } finally { await conn.end(); }
});
