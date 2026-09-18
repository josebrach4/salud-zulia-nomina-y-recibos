import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_FUy1PmfOS6cB@ep-blue-poetry-aps73cpm-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

app.get('/api/empleados', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM empleados ORDER BY id ASC');
    const mappedRows = rows.map(r => ({
      id: r.id.toString(),
      tipoMovimiento: r.tipomovimiento,
      oficina: r.oficina,
      nacionalidad: r.nacionalidad,
      cedula: r.cedula,
      nombresApellidos: r.nombresapellidos,
      fechaNacimiento: r.fechanacimiento,
      genero: r.genero,
      condicionLaboral: r.condicionlaboral,
      cargo: r.cargo,
      nivelEducativo: r.niveleducativo,
      profesion: r.profesion,
      fechaIngreso: r.fechaingreso,
      salario: r.salario,
      fechaEgreso: r.fechaegreso,
      montoDescuento: r.montodescuento,
      motivoDescuento: r.motivodescuento
    }));
    res.json(mappedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/empleados', async (req, res) => {
  const { tipoMovimiento, oficina, nacionalidad, cedula, nombresApellidos, fechaNacimiento, genero, condicionLaboral, cargo, nivelEducativo, profesion, fechaIngreso, salario, fechaEgreso, montoDescuento, motivoDescuento } = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO empleados (tipoMovimiento, oficina, nacionalidad, cedula, nombresApellidos, fechaNacimiento, genero, condicionLaboral, cargo, nivelEducativo, profesion, fechaIngreso, salario, fechaEgreso, montodescuento, motivodescuento) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *
    `, [tipoMovimiento || "160", oficina || "1", nacionalidad || "57", cedula, nombresApellidos, fechaNacimiento, genero || "163", condicionLaboral || "94", cargo, nivelEducativo || "111", profesion || "264", fechaIngreso, salario || "0", fechaEgreso || "", montoDescuento || "", motivoDescuento || ""]);
    
    const r = rows[0];
    res.json({
      id: r.id.toString(),
      tipoMovimiento: r.tipomovimiento,
      oficina: r.oficina,
      nacionalidad: r.nacionalidad,
      cedula: r.cedula,
      nombresApellidos: r.nombresapellidos,
      fechaNacimiento: r.fechanacimiento,
      genero: r.genero,
      condicionLaboral: r.condicionlaboral,
      cargo: r.cargo,
      nivelEducativo: r.niveleducativo,
      profesion: r.profesion,
      fechaIngreso: r.fechaingreso,
      salario: r.salario,
      fechaEgreso: r.fechaegreso,
      montoDescuento: r.montodescuento,
      motivoDescuento: r.motivodescuento
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/empleados/:id', async (req, res) => {
  const { tipoMovimiento, oficina, nacionalidad, cedula, nombresApellidos, fechaNacimiento, genero, condicionLaboral, cargo, nivelEducativo, profesion, fechaIngreso, salario, fechaEgreso, montoDescuento, motivoDescuento } = req.body;
  try {
    const { rowCount } = await pool.query(`
      UPDATE empleados SET tipoMovimiento = $1, oficina = $2, nacionalidad = $3, cedula = $4, nombresApellidos = $5, fechaNacimiento = $6, genero = $7, condicionLaboral = $8, cargo = $9, nivelEducativo = $10, profesion = $11, fechaIngreso = $12, salario = $13, fechaEgreso = $14, montodescuento = $15, motivodescuento = $16 
      WHERE id = $17
    `, [tipoMovimiento, oficina, nacionalidad, cedula, nombresApellidos, fechaNacimiento, genero, condicionLaboral, cargo, nivelEducativo, profesion, fechaIngreso, salario, fechaEgreso, montoDescuento, motivoDescuento, req.params.id]);
    res.json({ updated: rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/empleados/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM empleados WHERE id = $1`, [req.params.id]);
    res.json({ deleted: rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend Express/Postgres escuchando en http://localhost:${port}`);
  });
}

export default app;
