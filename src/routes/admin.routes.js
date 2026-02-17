const { Router } = require('express');
const router = Router();

const tripControllers = require('../controllers/tripCotrollers');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/authorizeRole');
const adminController = require('../controllers/adminController');  
   


// Ruta para que el admin vea todos los viajes
router.get('/trips', authMiddleware, roleMiddleware(['admin']), tripControllers.getAllTrips
);

router.delete( '/users/:id', authMiddleware, roleMiddleware(['admin']), adminController.deleteUserAndTrips
);

module.exports = router;
