const db = require('../db/connection.js');

// const selectFlightsByUser = async (user_id) => {
//   const result = await db.query('SELECT * FROM flight WHERE user_id = $1', [
//     user_id,
//   ]);
//   if (result.rows.length === 0) {
//     return Promise.reject({
//       status: 404,
//       msg: 'Not found',
//     });
//   }
//   return result.rows[0];
// };

const selectFlightsByUser = async (user_id) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT ON (seat.flight_id) flight.*
      FROM seat
      JOIN flight ON seat.flight_id = flight.id
      WHERE seat.user_id = $1
      ORDER BY seat.flight_id, seat.id;`,
      [user_id]
    );
    if (result.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'Not found',
      });
    }
    return result.rows;
  } catch (err) {
    console.error('Database query error:', err); // Log any database errors
    throw err;
  }
};

module.exports = {
  selectFlightsByUser,
};
