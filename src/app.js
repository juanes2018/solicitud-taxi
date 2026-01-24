require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./config/db')



app.use(express.json());
app.use(express.urlencoded({ extended: true}));




app.get('/', (req, res) => {
    res.send(`
        <h1>API REST para Solicitud de Servicio de Taxis</h1>
<p>Esto es una Aplicacion node.js con express.js.</p>
<p>Corre en el Puerto: ${PORT}</p>`);

    
} );







const PORT = process.env.PORT || 3000;
console.log(PORT);


app.listen( PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
} );