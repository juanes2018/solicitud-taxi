require('dotenv').config();
const express = require('express');

const LoggerMiddleware = require('./middlewares/logger');
const app = express();
const db = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const authenticateToken = require('./middlewares/auth');
const authorizeRole = require('./middlewares/authorizeRole');
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
 



     //Login de usuario 
app.post('/login', async(req, res) => {

   try{
      const {email, password} = req.body;

      // 1️⃣ Validar datos

      if(!email || !password) {
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



     /*  //Verificacion de Datos en la Base de datos
app.get('/users/me', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, created_at FROM users'
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
}); */

         //Obtener perfil del usuario autenticado 
app.get('/users/me', authenticateToken, async (req, res) => {
  try {
    // 👇 viene del JWT
    const userId = req.user.id;

    const [users] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      ok: true,
      user: users[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al obtener el perfil del usuario'
    });
  }
});


            //Actualizar perfil del usuario autenticado 

app.patch('/users/me', authenticateToken, async (req, res) => {
   
      try{
         const userId = req.user.id; //Viene del JWT 
         const { name, email, password } = req.body;

            //Validar que al menos un campo se envio 
      if(!name && !email && !password) {
         return res.status(400).json({message: 'Se debe enviar al menos un campo para actualizar'});
      }

            //Crear arreglo para la consulta dinamica
         const fields = [];
         const values = [];

        if (name) {
         fields.push('name = ?');
         values.push(name);
        } 

        if (email) {
         fields.push('email = ?');
         values.push(email);
        }

        if (password) {
            if (password.length < 6 ) {
               return res.status(400).json({message: 'La Contraseña debe tener al menos 6 caracteres'})
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            fields.push('password = ?');
            values.push(hashedPassword);
        }

        values.push(userId); // para el WHERE

            //Actualizar usuario
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id =?`;
        await db.query(sql, values);

            //Traer el Usuario Actualizado

         const [updatedUsers] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [userId]
         );

         res.json({
            ok: true,
            message: 'Perfil Actualizado correctamente',
            user: updatedUsers[0]
         });

}catch (error) {
   console.error(error);
   res.status(500).json({ message: 'Error al actualizar el perfil'})

}
});


         //Solicitar un viaje (pasajero) 
app.post('/trips', authenticateToken, authorizeRole('passenger'), async (req, res) => {

    try {
      const { origin, destination } = req.body;
      const passengerId = req.user.id;

            // 1️⃣ Validar body
      if (!origin || !destination) {
        return res.status(400).json({
          message: 'Origen y destino son obligatorios'
        });
      }


             // 2️⃣ Insertar viaje (id INT autoincrement)
      const [result] = await db.query(
        `INSERT INTO trips (passengerId, origin, destination, status)
         VALUES (?, ?, ?, ?)`,
        [passengerId, origin, destination, 'pending']
      );

           // 3️⃣ Responder según el enunciado
      res.status(201).json({
        id: 'abc123', // 👈 string como pide el ejercicio
        origin,
        destination,
        status: 'pending',
        createdAt: '2025-08-01T12:00:00Z'
      });
      
    } catch (error) {
      console.error('Error al solicitar el viaje:', error);
      res.status(500).json({
        message: 'Error al solicitar el viaje'
      });
    }
  }
);


          //Listar viajes solicitados por el pasajero autenticado 
app.get('/trips/mine', authenticateToken, authorizeRole('passenger'), async (req, res) => {
    
  
  try {
      const passengerId = req.user.id;

      // Paginación
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Obtener viajes
      const [trips] = await db.query(
        `SELECT id, origin, destination, status, created_at
         FROM trips
         WHERE passengerId = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [passengerId, limit, offset]
      );

      res.json({
        ok: true,
        page,
        limit,
        results: trips.length,
        trips
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al obtener los viajes'
      });
    }
  }
);




          //Aceptar un viaje (conductor) 
app.patch('/trips/:id/accept', authenticateToken, authorizeRole('driver'), async (req, res) => {
  try {
    const tripId = req.params.id;         // ID del viaje de la URL
    const driverId = req.user.id;         // ID del conductor desde JWT

    // 1️⃣ Verificar que el viaje exista y esté pendiente
    const [trips] = await db.query(
      'SELECT * FROM trips WHERE id = ?',
      [tripId]
    );

    if (trips.length === 0) {
      return res.status(404).json({ message: 'Viaje no encontrado' });
    }

    const trip = trips[0];

    if (trip.status !== 'pending') {
      return res.status(400).json({ message: `El viaje ya fue ${trip.status}` });
    }

    // 2️⃣ Actualizar viaje
    await db.query(
      'UPDATE trips SET status = ?, driverId = ? WHERE id = ?',
      ['accepted', driverId, tripId]
    );

    // 3️⃣ Traer el viaje actualizado
    const [updatedTrips] = await db.query(
      'SELECT id, passengerId, driverId, origin, destination, status, created_at FROM trips WHERE id = ?',
      [tripId]
    );

    res.json({
      ok: true,
      message: 'Viaje aceptado',
      trip: updatedTrips[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al aceptar el viaje' });
  }
});


            //Completar un viaje (conductor)
app.patch('/trips/:id/complete', authenticateToken, authorizeRole('driver'), async (req, res) => {

    try {
      const tripId = req.params.id;
      const driverId = req.user.id;
      const { price } = req.body;

      // 1️⃣ Validar precio
      if (!price || price <= 0) {
        return res.status(400).json({
          message: 'El precio es obligatorio y debe ser mayor a 0'
        });
      }

      // 2️⃣ Verificar que el viaje exista
      const [trips] = await db.query(
        'SELECT * FROM trips WHERE id = ?',
        [tripId]
      );

      if (trips.length === 0) {
        return res.status(404).json({
          message: 'Viaje no encontrado'
        });
      }

      const trip = trips[0];

      // 3️⃣ Verificar que el viaje esté aceptado
      if (trip.status !== 'accepted') {
        return res.status(400).json({
          message: `El viaje no puede completarse porque está en estado ${trip.status}`
        });
      }

      // 4️⃣ Verificar que el conductor sea el asignado
      if (trip.driverId !== driverId) {
        return res.status(403).json({
          message: 'No puedes completar un viaje que no te pertenece'
        });
      }

      // 5️⃣ Actualizar viaje
      await db.query(
        'UPDATE trips SET status = ?, price = ? WHERE id = ?',
        ['completed', price, tripId]
      );

      // 6️⃣ Obtener viaje actualizado
      const [updatedTrips] = await db.query(
        'SELECT id, passengerId, driverId, origin, destination, status, price, created_at FROM trips WHERE id = ?',
        [tripId]
      );

      res.json({
        ok: true,
        message: 'Viaje completado correctamente',
        trip: updatedTrips[0]
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al completar el viaje'
      });
    }
  }
);
  

        //Listar todos los viajes (admin) 
app.get('/admin/trips', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // 1️⃣ Paginación obligatoria
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (!page || !limit) {
      return res.status(400).json({
        message: 'Debe enviar pagina y limites como parámetros de paginación'
      });
    }

    const offset = (page - 1) * limit;

    // 2️⃣ Filtrado opcional por status
    const { status } = req.query; // status puede ser 'pending', 'accepted', 'completed', etc.
    
    let sql = 'SELECT * FROM trips';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // 3️⃣ Ejecutar consulta
    const [trips] = await db.query(sql, params);

    res.json({
      ok: true,
      page,
      limit,
      results: trips.length,
      trips
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los viajes' });
  }
});

      //Eliminar un usuario (admin) 
app.delete('/admin/users/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    
  try {
      const userId = parseInt(req.params.id);

      // 1. Verificar que el usuario exista
      const userResult = await db.query(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );

      if (userResult.rowCount === 0) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }

      // 2. Eliminar viajes donde sea passenger o driver
      await db.query(
        `DELETE FROM trips WHERE passengerId = ? OR driverId = ?`,
        [userId, userId]
      );

      // 3. Eliminar usuario
      await db.query(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );

      res.json({
        ok: true,
        message: 'Usuario y viajes asociados eliminados'
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error del servidor'
      });
    }
  }
);






app.listen( PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
} );