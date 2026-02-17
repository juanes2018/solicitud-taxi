const { Router } = require('express');
const router = Router();
const tripController = require('../controllers/tripCotrollers');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/authorizeRole');

router.post('/mine', authMiddleware, tripController.createTrip);
router.get('/mine', authMiddleware, tripController.getMyTrips);
router.get('/mine', authMiddleware, tripController.getMyTrips);
router.patch('/:id/accept', authMiddleware, roleMiddleware(['driver']), tripController.acceptTrip);
router.patch('/:id/complete', authMiddleware, roleMiddleware(['driver']), tripController.completeTrip);
router.get('/trips', authMiddleware, roleMiddleware(['admin']), tripController.getAllTrips); // Ruta para que el admin vea todos los viajes

module.exports = router;
