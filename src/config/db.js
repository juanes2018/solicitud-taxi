const mysql = require('mysql2/promise')

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

});


const testConnection = async () => {

    try{
        const connection = await pool.getConnection();
        console.log('Conexion a la Base de Datos');
        connection.release();
    } catch (error) {
        console.eroor('Error de conexion a la base de datos', error)
    }
};

testConnection();


module.exports = pool;