const userService = require('../services/userService');

const getCurrentUser = async (req, res) => {
  try {
    console.log('ID de usuario desde JWT:', req.user.id); 
    const user = await userService.getCurrentUser(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('ERROR REAL:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateCurrentUser(req.user.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

const deleteCurrentUser = async (req, res) => {
  try {
    await userService.deleteCurrentUser(req.user.id);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

const createAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newAdmin = await userService.createAdminUser(name, email, password);
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario admin' });
  }
};

const deleteUserAndTrips = async (req, res) => {
  try {
    const userId = req.params.id;
    await userService.deleteUserAndTrips(userId);
    res.json({ message: 'Usuario y viajes asociados eliminados correctamente' });
  } catch (error) {
     console.error("ERROR COMPLETO:", error);
    res.status(500).json({ error: 'Error al eliminar el usuario y sus viajes' });
  }
};


    

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  createAdminUser,
  deleteUserAndTrips
};  