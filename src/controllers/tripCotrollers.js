const tripService = require('../services/tripService');

const createTrip = async (req, res) => {
    try {
       
        const passengerId = req.user.id; // Obtener el ID del pasajero desde el token JWT

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { origin, destination } = req.body;

        const trip = await tripService.createTrip( passengerId, page, limit, { origin, destination });

        res.status(201).json(trip);
        res.jon({
            page,
            limit,
            trip
        })
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el viaje' }); 
    }
}

const getMyTrips = async (req, res) => {
    try {
        const passengerId = req.user.id; // Obtener el ID del pasajero desde el token JWT

        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        
        const trips = await tripService.getTripsByPassengerId(passengerId, page, limit);

        res.status(200).json({
            page,
            limit,
            trips
        }); 
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los viajes' });
    }
}

const acceptTrip = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'driver') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        const driverId = req.user.id; // Obtener el ID del conductor desde el token JWT
        const tripId = req.params.id; // Obtener el ID del viaje desde los parámetros de la URL

        const updatedTrip = await tripService.acceptTrip(tripId, driverId);

        if (!updatedTrip) {
            return res.status(404).json({ error: 'Viaje no encontrado o no disponible para aceptar' });
        }

        res.status(200).json(updatedTrip);
    } catch (error) {
        res.status(500).json({ error: 'Error al aceptar el viaje' });
    }   
}  

const completeTrip = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'driver') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        const price = req.body.price; // Obtener el precio del viaje desde el cuerpo de la solicitud

        const driverId = req.user.id; // Obtener el ID del conductor desde el token JWT
        const tripId = req.params.id; // Obtener el ID del viaje desde los parámetros de la URL

        const updatedTrip = await tripService.completeTrip(tripId, driverId, price);

        if (!updatedTrip) {
            return res.status(404).json({ error: 'Viaje no encontrado o no disponible para completar' });
        }

        res.status(200).json(updatedTrip);
    } catch (error) {
        res.status(500).json({ error: 'Error al completar el viaje' });
    }   
} 

const getAllTrips = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const trips = await tripService.getAllTrips(status, page, limit);

        res.status(200).json({
            page: parseInt(page),
            limit: parseInt(limit),
            trips
        });     
    }
    catch (error) {res.status(500).json({ error: 'Error al obtener los viajes' });
    }
};

module.exports = {
    createTrip,
    getMyTrips,
    acceptTrip,
    completeTrip,
    getAllTrips
};



