require('dotenv').config();

const express = require('express');
const cors = require('cors');
const database = require('./config/database');
const productoRoutes = require('./routes/productoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', productoRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'Backend Restaurante Baluarte funcionando'
    });
});

app.get('/api/prueba-db', async (req, res) => {
    try {
        const [resultado] = await database.query('SELECT 1 AS conexion');

        res.json({
            mensaje: 'Conexión con la base de datos exitosa',
            resultado
        });
    } catch (error) {
        console.error('Error de conexión:', error.message);

        res.status(500).json({
            mensaje: 'Error al conectar con la base de datos',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});