const app = require('./src/app');
const env = require('./src/config/env');
const { testConnection } = require('./src/config/db');

(async () => {
  try {
    await testConnection();
    console.log(`MySQL connected (${env.db.host}:${env.db.port}/${env.db.database})`);
  } catch (err) {
    console.error('Could not connect to MySQL:', err.message);
    console.error('Check .env and run "npm run db:setup" first.');
    process.exit(1);
  }
  app.listen(env.port, () =>
    console.log(`CCC PathFinder API running at http://localhost:${env.port}/api/${env.apiVersion}`));
})();
