const bcrypt = require('bcryptjs');
const db = require('../config/db');

const getCurrentUser = async (userId) => {

  //const userId = req.user.id;
  const [result] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
  if ( result.length === 0 ) {
    throw new Error('Usuario no encontrado');
  } 
  return result[0]  ;
};

const updateCurrentUser = async (userId, data) => {
  const { name, email, password } = data;
  
  const updatedUser = {name,email};  

  if (password) {
    updatedUser.password = await bcrypt.hash(password, 10);
  }

  const field = [];
  const values = [];
  
  for (const key in updatedUser) {
    field.push(`${key} = ?`);
    values.push(updatedUser[key]);
  }

  if (field.length === 0) {
    throw new Error('No se proporcionaron campos para actualizar');
  } 
  values.push(userId);

  const query = `UPDATE users SET ${field.join(', ')} WHERE id = ?`;
  const result = await db.query(query, values);

  if (result.affectedRows === 0) {
    throw new Error('Usuario no encontrado');
  }

  return getCurrentUser(userId);    

  
};

const deleteCurrentUser = async (userId) => {
  const result = await db.query('DELETE FROM users WHERE id = ?', [userId]);

  if (result.affectedRows === 0) {
    throw new Error('Usuario no encontrado');
  }   
};

const createAdminUser = async (name, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, 'admin']);
  return { id: result.insertId,
    name,
    email,
    role: 'admin' };
};

const deleteUserAndTrips = async (userId) => {
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Eliminar los viajes asociados al usuario
    await connection.query('DELETE FROM trips WHERE passengerId = ? or driverId = ?', [userId, userId]);



    // Eliminar el usuario
    const [result] = await connection.query('DELETE FROM users WHERE id = ?', [userId]);

    

    if (result.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }     


}; 



module.exports = {
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  createAdminUser, deleteUserAndTrips
};  

