const db = require('../db/connection.js');
const { selectFlightsByUser } = require('./users.models.js');

const deleteFlightByUserFlightId = async (user_flight_id) => {
  try {
    // Check if the user_flight exists
    const userFlightResult = await db.query(
      `SELECT * FROM "user_flight" WHERE id = $1;`,
      [user_flight_id]
    );

    if (userFlightResult.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'Users flight not found',
      });
    }
    await db.query(
      `DELETE FROM "seat" WHERE user_flight_id = $1;`,
      [user_flight_id]);

    await db.query(
      `DELETE FROM "user_flight" WHERE id = $1;`,
      [user_flight_id]);


    return await selectFlightsByUser(userFlightResult.rows[0].user_id);
  } catch (err) {
    console.error('Database query error:', err); 
    throw err;
  }
};

const selectFlightsByUserFlightId = async (user_flight_id) => {
  try {
    const userFlightResult = await db.query(
      `SELECT * FROM "user_flight" WHERE id = $1;`,
      [user_flight_id]
    );

    if (userFlightResult.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'Flight not found',
      });
    }

    return userFlightResult.rows[0];
  } catch (err) {
    console.error('Database query error:', err); 
    throw err;  
  }
};
module.exports = {
  deleteFlightByUserFlightId, selectFlightsByUserFlightId
};


// HTTP REQUESTS
// DELETE (use remove to avoid conflict with delete keyword)
// GET 
// POST 
// PUT 

//sql requests
// DELETE
// SELECT
// INSERT
// UPDATE