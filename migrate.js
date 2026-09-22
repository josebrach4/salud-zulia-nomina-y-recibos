import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_FUy1PmfOS6cB@ep-blue-poetry-aps73cpm-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function main() {
  try {
    await pool.query('ALTER TABLE empleados ADD COLUMN bonoquincenal VARCHAR(50) DEFAULT \'\'');
    console.log("Added bonoquincenal");
  } catch(e) { console.error(e.message) }
  
  try {
    await pool.query('ALTER TABLE empleados ADD COLUMN sso_base VARCHAR(50) DEFAULT \'6.00\'');
    console.log("Added sso_base");
  } catch(e) { console.error(e.message) }

  try {
    await pool.query('ALTER TABLE empleados ADD COLUMN faov_base VARCHAR(50) DEFAULT \'6.50\'');
    console.log("Added faov_base");
  } catch(e) { console.error(e.message) }

  try {
    await pool.query('ALTER TABLE empleados ADD COLUMN spf_base VARCHAR(50) DEFAULT \'1.50\'');
    console.log("Added spf_base");
  } catch(e) { console.error(e.message) }

  process.exit(0);
}

main();
