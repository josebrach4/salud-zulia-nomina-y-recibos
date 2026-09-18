const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');

const db = new sqlite3.Database('./database.sqlite');
const pgClient = new Client({
  connectionString: 'postgresql://neondb_owner:npg_FUy1PmfOS6cB@ep-blue-poetry-aps73cpm-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function migrate() {
  await pgClient.connect();
  console.log("Conectado a Postgres. Creando tabla...");

  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS empleados (
      id SERIAL PRIMARY KEY,
      tipoMovimiento TEXT,
      oficina TEXT,
      nacionalidad TEXT,
      cedula TEXT UNIQUE,
      nombresApellidos TEXT,
      fechaNacimiento TEXT,
      genero TEXT,
      condicionLaboral TEXT,
      cargo TEXT,
      nivelEducativo TEXT,
      profesion TEXT,
      fechaIngreso TEXT,
      salario TEXT,
      fechaEgreso TEXT
    )
  `);

  console.log("Tabla creada. Leyendo SQLite...");
  
  db.all("SELECT * FROM empleados", async (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`Encontrados ${rows.length} empleados en SQLite.`);

    for (const row of rows) {
      try {
        await pgClient.query(`
          INSERT INTO empleados (
            tipoMovimiento, oficina, nacionalidad, cedula, nombresApellidos, 
            fechaNacimiento, genero, condicionLaboral, cargo, nivelEducativo, 
            profesion, fechaIngreso, salario, fechaEgreso
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (cedula) DO NOTHING
        `, [
          row.tipoMovimiento, row.oficina, row.nacionalidad, row.cedula, row.nombresApellidos,
          row.fechaNacimiento, row.genero, row.condicionLaboral, row.cargo, row.nivelEducativo,
          row.profesion, row.fechaIngreso, row.salario, row.fechaEgreso
        ]);
        console.log(`Migrado: ${row.nombresApellidos}`);
      } catch (insertErr) {
        console.error("Error insertando empleado:", insertErr.message);
      }
    }

    console.log("Migración completada.");
    await pgClient.end();
    db.close();
  });
}

migrate().catch(console.error);
