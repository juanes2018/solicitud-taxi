
function authorizeRole(role) {
    return (req, res, next) => {

        // 1️⃣ Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({
                message: 'Usuario no autenticado'
            });
        }

        // 2️⃣ Verificar que el rol sea el correcto
        if (req.user.role !== role) {
            return res.status(403).json({
                message: 'Acceso denegado: rol incorrecto'
            });
        }

        // 3️⃣ Si todo está bien, continuar
        next();
    };
}




module.exports = authorizeRole;