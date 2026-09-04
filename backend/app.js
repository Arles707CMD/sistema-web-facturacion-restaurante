require('dotenv').config();

const express = require('express');
const cors = require('cors');
const database = require('./config/database');
const productoRoutes = require('./routes/productoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/dashboard', dashboardRoutes);

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