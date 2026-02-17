const { Router } = require('express');
const router = Router();
const userController = require('../controllers/userController');
const authenticateToken  = require('../middlewares/auth');


router.get('/me', authenticateToken, userController.getCurrentUser);

router.patch('/me', authenticateToken, userController.updateCurrentUser);

router.delete('/me', authenticateToken, userController.deleteCurrentUser);

module.exports = router;