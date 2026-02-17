const { Router } = require('express');
const router = Router();

const authRouter = require('./auth');
const userRoutes = require('./userRoutes');
const tripRoutes = require('./tripRoutes');
const adminRoutes = require('./admin.routes');



router.use('/auth', authRouter);
router.use('/users', userRoutes);
router.use('/trips',tripRoutes);
router.use('/admin', adminRoutes); 

module.exports = router;