const db = require('../config/db');

const createTrip = async (passengerId, tripData) => {

    const { origin, destination } = tripData;

    const [result] = await db.query('INSERT INTO trips (passengerId, origin, destination, status) VALUES (?, ?, ?, ?)', [passengerId, origin, destination, 'pending']);

    return {
        id:"abc123", //id: result.insertId,
        //passenger_id: passengerId,
        origin,
        destination,
        status: 'pending',
        createdAt: "2025-08-01T12:00:00Z"
    };
};

const getTripsByPassengerId = async (passengerId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

  const [trips] = await db.query('SELECT * FROM trips WHERE passengerId = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [passengerId, limit, offset]);

 const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM trips WHERE passengerId = ?', [passengerId]);  
 const totalPages = Math.ceil(count / limit);

    return {
        data: trips,
        pagination: {
            totalItems: count,
            totalPages,
            currentPage: page,
            pageSize: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }       
    }   
};

const acceptTrip = async (tripId, driverId, price) => {
    
    const [result] = await db.query(`UPDATE trips SET driverId = ?, status = 'accepted', price = ? WHERE id = ? AND status = 'pending'`, [driverId, price, tripId]);

    if (result.affectedRows === 0) {
        return null; // No se encontró el viaje o no estaba disponible para aceptar
    }
    
    const [row] = await db.query('SELECT * FROM trips WHERE id = ?', [tripId]);

    return row[0]; // Retorna el viaje actualizado  

};

const completeTrip = async (tripId, driverId, price) => {

    const [result] = await db.query(`UPDATE trips SET status = 'completed', price = ? WHERE id = ? AND driverId = ?`, [price, tripId, driverId]);

    if (result.affectedRows === 0) {
        return null; // No se encontró el viaje o no estaba disponible para completar
    }

    const [row] = await db.query('SELECT * FROM trips WHERE id = ?', [tripId]);

    return row[0]; // Retorna el viaje actualizado      
};

const getAllTrips = async (status, page = 1, limit = 20) => {  
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20; 
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM trips';
    const params = [];

    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);
     console.log('Query trips:', query, params);

    const [trips] = await db.query(query, params);
     console.log('Trips obtenidos:', trips);

    let countQuery = 'SELECT COUNT(*) as count FROM trips';
    const countParams = [];

    if (status) {
        countQuery += ' WHERE status = ?';
        countParams.push(status);
    }

    const [[{ count }]] = await db.query(countQuery, countParams);
    const totalPages = Math.ceil(count / limitNum);

    return {
        data: trips,
        pagination: {
            totalItems: count,
            totalPages,
            currentPage: pageNum,
            pageSize: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPreviousPage: pageNum > 1
        }       
    }   
};


module.exports = {
    createTrip,
    getTripsByPassengerId,
    acceptTrip,
    completeTrip,
    getAllTrips

};      

