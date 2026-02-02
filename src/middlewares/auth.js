const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.headers['Authorization']?.split(' ')[1];
        if (!token)
            return res.status(401).json({error: 'Acceso Denegado. No se proporciono token'});
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({error: 'Token Invalido'});
        });

        req.user = user;
        next();

};

module.exports = authenticateToken;

