require('dotenv').config();
const express = require('express');

const LoggerMiddleware = require('./middlewares/logger');
const app = express();
const db = require('./config/db');
const errorHandler = require('./middlewares/errorHandler')



app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(LoggerMiddleware);
app.use(errorHandler);




app.get('/', (req, res) => {
    res.send(`
        <h1>API REST para Solicitud de Servicio de Taxis</h1>
<p>Esto es una Aplicacion node.js con express.js.</p>
<p>Corre en el Puerto: ${PORT}</p>`);

    
} );



app.post('/register', async (req, res) => {
      

      // Validaciones
    const { name, password, email, role } = req.body;
     try {
        if (!name || !password || !email || !role) {
            return res.status(400).json({message: 'faltan datos requeridos'});
     };


        // Rol debe ser 'passenger' o 'driver'
     if (!["passenger", "driver"].includes(role)) {
        return res.status(400).json({error: "El rol debe ser 'passenger' o 'driver'"});
     }

        // Validar contraseña mínima de 6 caracteres
     if (password.lentgh < 6) {

        return res.status(400).json({error: "Contraseña debe minima de 6 caracteres"});

     };

       // Validar Email Unico

       const [existingUser] = await db.query('Select * from users where email = ?', [email]);

       if (existingUser.lentgh > 0){
        return res.status(400).json({error: "El email ya está en uso"});
       };

               // Encriptar Password

      const hashedPassword = await bcrypt.hash(password, 10);

            
      
               // Registrar Usuario a la Base de Datos

       await db.query('Insert into users (name, email, hashedPassword, role) values (?, ?, ?, ?)', [name, email, password, role]);

       res.status(201).json({message: 'Usuario registrado exitosamente'});

      } catch (error) {
         console.error('Error al registrar usuario:', error);

         res.status(500).json({message: 'Error interno del servidor'});
      }  

});

app.get('/error', (req, res, next) => {
   next(new Error('Error Intencional'))
})


const PORT = process.env.PORT || 3000;
console.log(PORT);


app.listen( PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
} );