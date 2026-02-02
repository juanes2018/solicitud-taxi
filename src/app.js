require('dotenv').config();
const express = require('express');

const LoggerMiddleware = require('./middlewares/logger');
const app = express();
const db = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const authenticateToken = require('./middlewares/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(LoggerMiddleware);
app.use(errorHandler);



const PORT = process.env.PORT || 3000;
console.log(PORT);


app.get('/', (req, res) => {
    res.send(`
        <h1>API REST para Solicitud de Servicio de Taxis</h1>
<p>Esto es una Aplicacion node.js con express.js.</p>
<p>Corre en el Puerto: ${PORT}</p>`);

    
} );

 
   //Registro de Usuario
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
     if (password.length < 6) {

        return res.status(400).json({error: "Contraseña debe minima de 6 caracteres"});

     };

       // Validar Email Unico

       const [existingUser] = await db.query('Select * from users where email = ?', [email]);

       if (existingUser.length > 0){
        return res.status(400).json({error: "El email ya está en uso"});
       };

               // Encriptar Password

      const hashedPassword = await bcrypt.hash(password, 10);

            
      
               // Registrar Usuario a la Base de Datos

       await db.query('Insert into users (name, email, password, role) values (?, ?, ?, ?)', [name, email, hashedPassword, role]);

       res.status(201).json({message: 'Usuario registrado exitosamente'});

      } catch (error) {
         console.error('Error al registrar usuario:', error);

         res.status(500).json({message: 'Error interno del servidor'});
      }  

});
       

     //Manejo de errores
app.get('/error', (req, res, next) => {
   next(new Error('Error Intencional'))
});



     //Confirmacion de la ruta protegida
app.get('/protected-route', authenticateToken, (req, res) => {
   res.send('Esta es una ruta protegida.');
});
 
      //Verificacion de Datos en la Base de datos
app.get('/db/users', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, created_at FROM users'
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});


     //Login de usuario 
app.post('/login', async(req, res) => {

   try{
      const {email, password} = req.body;

      // 1️⃣ Validar datos

      if(!email, !password) {
         return res.status(400).json({message: 'Faltan datos Requeridos'});
      }

      // 2️⃣ Verificar si el Usuario Existe

      const[users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

      if(users.length === 0) {
         return res.status(401).json({message: 'Credenciales Invalidas'})
      }

      const user = users[0];

            // 3️⃣ Verificar Password

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if(!isPasswordValid) {
         return res.status(401).json({message: 'Credenciales Invalidas'});
      }

            // 4️⃣ Generar JWT

      const tokenPayload = {id: user.id, role: user.role};
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h'});

             // 5️⃣ Enviar respuesta

      res.json({ token});

   } catch (error) {
      console.error('Error en el proceso de login:', error);
      res.status(500).json({message: 'Error del Servidor'});
   };
});




app.listen( PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
} );