const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Pruebas',
  password: 'admin123',
  port: 5432,
});

// Middleware para habilitar CORS
app.use(cors());

// Ruta de ejemplo
app.get('/', (req, res) => {
  res.send('¡Hola, mundo desde el backend!');
});

// Obtener citas
app.get('/citas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM citas');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});

// Obtener clientes
app.get('/clientes', async (req, res) => {
  try {
    const { nombre } = req.query; // Obtener el parámetro de búsqueda de la consulta
    let result;

    if (!nombre) {
      // Si no se proporciona el parámetro `nombre`, devolver todos los clientes
      result = await pool.query('SELECT * FROM clientes');
    } else {
      // Si se proporciona el parámetro `nombre`, filtrar por ese nombre (usando LIKE para coincidencias parciales)
      result = await pool.query(
        'SELECT * FROM clientes WHERE nombre ILIKE $1',
        [`%${nombre}%`]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});


// Obtener servicios
app.get('/servicios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servicios');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});

// Obtener citas por mes
app.get('/ventas/mes', async (req, res) => {
    try {
        const { month } = req.query; // Obtener el parámetro de mes de la consulta

        let result;
        if (!month) {
            // Si no se proporciona el parámetro `month`, devolver datos para todos los meses
            result = await pool.query(`
                SELECT 
                    TO_CHAR(fecha_cita, 'YYYY-MM') AS mes, 
                    COUNT(*) AS total
                FROM citas
                GROUP BY TO_CHAR(fecha_cita, 'YYYY-MM')
                ORDER BY mes;
            `);
        } else {
            // Si se proporciona el parámetro `month`, filtrar por ese mes
            result = await pool.query(`
                SELECT 
                    TO_CHAR(fecha_cita, 'YYYY-MM') AS mes, 
                    COUNT(*) AS total
                FROM citas
                WHERE TO_CHAR(fecha_cita, 'YYYY-MM') = $1
                GROUP BY TO_CHAR(fecha_cita, 'YYYY-MM')
                ORDER BY mes;
            `, [month]);
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });



/*******************************************************************************/

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Ruta para crear una nueva cita
app.post('/citas', async (req, res) => {
  try {
    const { cliente_id, servicio_id, fecha_cita, estatus, comentarios } = req.body;

    const result = await pool.query(
      'INSERT INTO citas (cliente_id, servicio_id, fecha_cita, estatus, comentarios) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cliente_id, servicio_id, fecha_cita, estatus, comentarios]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor al crear una cita');
  }
});

// Ruta para crear un nuevo cliente
app.post('/clientes', async (req, res) => {
  try {
    const { nombre, correo, telefono } = req.body;

    const result = await pool.query(
      'INSERT INTO clientes (nombre, correo, telefono) VALUES ($1, $2, $3) RETURNING *',
      [nombre, correo, telefono]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor al crear un cliente');
  }
});

// Ruta para crear un nuevo servicio
app.post('/servicios', async (req, res) => {
  try {
    const { nombre, descripcion, precio } = req.body;

    const result = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, precio) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, precio]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor al crear un servicio');
  }
});

