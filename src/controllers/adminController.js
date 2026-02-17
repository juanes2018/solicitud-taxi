const { parse } = require('dotenv');
const userService = require('../services/userService');

const deleteUserAndTrips = async (req, res) => {

  try {
    const userId = parseInt(req.params.id);
    console.log('Intentando eliminar usuario con id:', userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario no proporcionado o inválido' });
    }
    
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    } 

    await userService.deleteUserAndTrips(userId);
      console.log('Usuario eliminado correctamente');
    res.status(200).json({ message: 'Usuario y viajes asociados eliminados correctamente' });
  } catch (error) {
      console.error("ERROR COMPLETO:", error);
    res.status(500).json({ error: error.message || 'Error al eliminar el usuario y sus viajes', details: error });
  }
};

module.exports = {
  deleteUserAndTrips
};