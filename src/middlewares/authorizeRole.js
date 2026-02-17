const roleMiddleware = require('../middlewares/authorizeRole');

function authorizeRole(role) {
    return (req, res, next) => {
        // 1️⃣ Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({
                message: 'Usuario no autenticado'
            });
        }

        //ojo: el rol puede ser un string o un array de strings
        if (!Array.isArray(role)) {
            role = [role]; // Convertir a array si es un string
        }   

        // 2️⃣ Verificar que el rol sea uno de los permitidos
        if (!role.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Acceso denegado: rol incorrecto'
            });
        }

        // 3️⃣ Si todo está bien, continuar
        next();
    };
}


module.exports = authorizeRole;