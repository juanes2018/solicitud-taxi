const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');


const registerUser = async (email, password, name, role) => {

    // Validar password mínimo 6
    if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener mínimo 6 caracteres');
    }

    // Validar rol
    const allowedRoles = ['passenger', 'driver'];
    if (!allowedRoles.includes(role)) {
        throw new Error('Rol inválido');
    }

    // Verificar email único
    const [existingUser] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    if (existingUser.length > 0) {
        throw new Error('El email ya está registrado');
    }

    // Encriptar password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    await db.query(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, role]
    );

    return { message: 'Usuario registrado satisfactoriamente' };
};


const loginUser = async (email, password) => {

    const [users] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    if (users.length === 0) {
        throw new Error('Credenciales inválidas');
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return token;
};



module.exports = { registerUser, loginUser };