const jwt = require('jsonwebtoken');


function authenticateToken(req, res, next) {
  //const authHeader = req.headers.authorization; // 👈 minúsculas
 

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({
      error: 'Acceso denegado. No se proporcionó token'
    });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 👈 AQUÍ guardamos el usuario del JWT
    console.log('Usuario completo desde JWT:', decoded);
    console.log('ID de usuario desde JWT:', decoded.id); 
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Token inválido'
    });
  }
}

module.exports = authenticateToken;
















/* function authenticateToken(req, res, next) {
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
 */
