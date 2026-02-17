# 🚖 API REST - Solicitud de Taxis

API REST desarrollada con **Node.js + Express + MySQL**, conectada a la base de datos MYSQL que permite gestionar usuarios, conductores y viajes, con autenticación JWT, autorización por roles y paginación.

---

## 📌 Descripción

Este proyecto implementa una API REST completa para una aplicación de solicitud de taxis.  

Incluye:

- 🔐 Autenticación con JWT
- 🛡 Autorización por roles (passenger, driver, admin)
- 👤 Gestión de usuarios
- 🚗 Gestión de viajes
- 📄 Paginación y filtros
- ✅ Validación de datos
- ⚠ Manejo global de errores ()
- 🔒 Encriptación de contraseñas con bcrypt

---

## 🛠 Tecnologías Utilizadas

- Node.js
- Express.js
- MySQL
- JWT (jsonwebtoken)
- bcrypt
- dotenv
- express-validator
- mysql2/promise

---



## ⚙️ Instalación

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/solicitud-taxi.git
cd solicitud-taxi
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=......
DB_NAME=solicitud_taxi

JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=...
```

---

### 4️⃣ Ejecutar el servidor

```bash
npm run dev
```

Servidor disponible en:

```
http://localhost:3000
```

---

# 🗄 Base de Datos

## Tabla: users

| Campo      | Tipo |
|------------|------|
| id         | INT (PK) |
| name       | VARCHAR |
| email      | VARCHAR (UNIQUE) |
| password   | VARCHAR |
| role       | ENUM(passenger, driver, admin) |
| created_at  | TIMESTAMP |

---

## Tabla: trips

| Campo        | Tipo |
|-------------|------|
| id          | INT (PK) |
| passengerId | INT (FK users) |
| driverId    | INT (FK users) |
| origin      | VARCHAR |
| destination | VARCHAR |
| status      | ENUM(pending, accepted, in_progress, completed, cancelled) |
| price       | DECIMAL |
| created_at   | TIMESTAMP |

---

# 🔐 Autenticación

La API utiliza JWT.

Enviar el token en los endpoints protegidos:

```
Authorization: Bearer TU_TOKEN
```

---

# 📌 Endpoints

## 🔑 Autenticación

### Registro

**POST** `/api/auth/register`

```json
{
  "name": "Juan Perez",
  "email": "juan@email.com",
  "password": "123456",
  "role": "passenger"
}
```

Validaciones:
- Email único
- Password mínimo 6 caracteres
- Role válido (passenger o driver)

---

### Login

**POST** `/api/auth/login`

```json
{
  "email": "juan@email.com",
  "password": "123456"
}
```

Respuesta:

```json
{
  "token": "jwt-token"
}
```

---

## 👤 Usuarios

### Obtener perfil de usuario autenticado

**GET** `/api/users/me`  
Requiere JWT
- Devuelve datos del usuario actual.

---

### Actualizar perfil de usuario autenticado

**PATCH** `/api/users/me`  
Requiere JWT
- Permite actualizar name, email o password



## 🚖 Viajes

### Solicitar viaje

**POST** `/api/trips`  
Requiere JWT (role=passenger)

```json
{
  "origin": "Calle A #123",
  "destination": "Plaza Central"
}
```

---

### Listar viajes solicitados por el pasajero autenticado

**GET** `/api/trips/mine?page=1&limit=10`  
Requiere JWT (role=passenger)

---

### Aceptar viaje (conductor)

**PATCH** `/api/trips/:id/accept`  
Requiere JWT (role=driver)
- Cambia el status a accepted y asigna driverId. 

---

### Completar un viaje(conductor)

**PATCH** `/api/trips/:id/complete`  
Requiere JWT (role=driver)

Cambia status a completed y asigna precio. 

---

## 🛡 Administración

### Listar todos los viajes(admin)

**GET** `/api/admin/trips  
Requiere JWT (role=admin)

- Permite filtrar por status (pending, completed, etc.). 
- Paginación obligatoria (?page=1&limit=20). 

---

### Eliminar usuario

**DELETE** `/api/admin/users/:id`  
Requiere JWT (role=admin)

Elimina el usuario y sus viajes asociados.

---

# 🧠 Middlewares Implementados

- Autenticación JWT
- Autorización por rol
- Validación de datos(express-validator o lógica propia)
- Manejo global de errores
- Paginación reutilizable

---

# 📊 Códigos de Estado Utilizados

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

---

# 🧪 Pruebas

Puedes probar la API usando:

- Postman


---

# 👨‍💻 Autor

Ing. Juan carlos Moncada<juancarlosmoncadaomana@gmail.com>

Desarrollado como ejercicio práctico de Backend con Node.js + Express.

---

# 📌 Estado del Proyecto

✔ Autenticación JWT  
✔ CRUD completo  
✔ Control de roles  
✔ Paginación  
✔ Validaciones  
✔ Manejo de errores  
✔ Persistencia en base de datos  

---
