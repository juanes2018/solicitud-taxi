require('dotenv').config();
const express = require('express');
const logger = require('./middlewares/logger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');


const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: true}));
; // Agrega las rutas de administrador bajo el prefijo /admin


app.use(logger);

app.use('/api', routes);
app.use(errorHandler);



app.get('/', (req, res) => {
    res.send('Bienvenido a la API REST para la Solicitud de Taxis ');
});

module.exports = app;