const express = require('express');
const cors = require('cors'); // Importa el middleware cors

const app = express();
const port = 3000;

// Usa el middleware CORS
app.use(cors());

// Define tus rutas
app.get('/data', (req, res) => {
  res.json({ message: 'Datos enviados correctamente' });
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
