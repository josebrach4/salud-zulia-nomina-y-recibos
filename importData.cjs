const fs = require('fs');
const pg = require('pg');
const { parse } = require('csv-parse/sync');

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_FUy1PmfOS6cB@ep-blue-poetry-aps73cpm-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function main() {
  const content = fs.readFileSync('temp.csv', 'utf8');
  // Skip the first 4 lines
  const lines = content.split('\n').slice(4).join('\n');
  const records = parse(lines, { columns: true, skip_empty_lines: true });

  const { rows: dbEmployees } = await pool.query('SELECT id, cedula FROM empleados');
  
  for (const emp of dbEmployees) {
    // CSV cedulas might have dots like "15.518.611", db might not. Let's normalize.
    const dbCed = emp.cedula.replace(/\D/g, '');
    const csvRow = records.find(r => r.CEDULA && r.CEDULA.replace(/\D/g, '') === dbCed);

    if (csvRow) {
      let salStr = csvRow['SALARIO MENSUAL'];
      if (!salStr) continue;
      salStr = salStr.replace(/\./g, '').replace(',', '.');
      const salDolares = (parseFloat(salStr) / 99).toFixed(2);
      
      let bonoStr = csvRow['bono quincenal'];
      let bono = bonoStr ? parseFloat(bonoStr).toFixed(2) : '0.00';

      await pool.query('UPDATE empleados SET salario = $1, bonoquincenal = $2 WHERE id = $3', [salDolares, bono, emp.id]);
      console.log(`Updated ${emp.cedula} -> Salario: $${salDolares}, Bono: $${bono}`);
    }
  }

  console.log("Done updating from CSV");
  process.exit(0);
}

main();
