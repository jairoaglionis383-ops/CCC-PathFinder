// Creates the database (if missing) and applies schema.sql + seed.sql.
// Usage: npm run db:setup   (uses DB_* values from .env)
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { db } = require('../src/config/env');

// Splits SQL on ';' while ignoring ';' inside quotes and comments.
function splitStatements(sql) {
  const out = [];
  let cur = '';
  let quote = null;
  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (!quote && ch === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') i += 1;
      cur += '\n';
      continue;
    }
    if (quote) {
      cur += ch;
      if (ch === '\\') { cur += sql[i + 1] || ''; i += 1; }
      else if (ch === quote) {
        if (next === quote) { cur += next; i += 1; } else quote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"') { quote = ch; cur += ch; continue; }
    if (ch === ';') { if (cur.trim()) out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

async function main() {
  const conn = await mysql.createConnection({
    host: db.host, port: db.port, user: db.user, password: db.password, charset: 'utf8mb4',
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db.database}\` CHARACTER SET utf8mb4`);
  await conn.query(`USE \`${db.database}\``);
  // SAFETY: schema.sql DROPs every table. Refuse to run against a database
  // that already holds saved assessments unless --force is given.
  const [exists] = await conn.query(
    "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ? AND table_name = 'assessment_sessions'",
    [db.database]
  );
  if (exists[0].n > 0 && !process.argv.includes('--force')) {
    const [rows] = await conn.query('SELECT COUNT(*) AS n FROM assessment_sessions');
    if (rows[0].n > 0) {
      console.error(`REFUSING to continue: database "${db.database}" already has ${rows[0].n} saved assessment(s) and setup would DROP them.`);
      console.error('Back it up first (see DATABASE_GUIDE.md). To reset on purpose, run: npm run db:setup -- --force');
      await conn.end();
      process.exit(2);
    }
  }
  for (const file of ['schema.sql', 'seed.sql']) {
    const statements = splitStatements(fs.readFileSync(path.join(__dirname, '..', 'database', file), 'utf8'));
    for (const s of statements) await conn.query(s);
    console.log(`Applied ${file} (${statements.length} statements)`);
  }
  await conn.end();
  console.log('Database ready.');
}

main().catch((err) => { console.error('Setup failed:', err.message); process.exit(1); });
