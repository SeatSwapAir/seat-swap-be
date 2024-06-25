const db = require('../db/connection.js');

const selectFlightsByUser = async (user_id) => {
  try {
    // Check if the user exists
    const userResult = await db.query(
      `SELECT * FROM "user" WHERE id = $1;`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'User not found',
      });
    }

    const userFlightResult = await db.query(
      `SELECT 
        uf.id AS user_flight_id,
        f.id AS flight_id,
        f.flightNumber,
        f.departureAirport,
        f.arrivalAirport,
        f.departureTime,
        f.arrivalTime,
        f.airline,
        uf.legroom_pref,
        uf.window_pref,
        uf.middle_pref,
        uf.aisle_pref,
        uf.front_pref,
        uf.center_pref,
        uf.back_pref,
        uf.side_by_side_pref,
        uf.neighbouring_row_pref,
        uf.same_row_pref,
        s.id AS seat_id,
        s.number AS seat_number,
        s.legroom AS seat_legroom,
        sl.name AS seat_location_name,
        sp.name AS seat_position_name
      FROM 
        user_flight uf
      JOIN 
        flight f ON uf.flight_id = f.id
      LEFT JOIN 
        seat s ON s.user_flight_id = uf.id
      LEFT JOIN 
        seat_location sl ON s.seat_location_id = sl.id
      LEFT JOIN 
        seat_position sp ON s.seat_position_id = sp.id
      WHERE 
        uf.user_id = $1;`,
      [user_id]
    );

    if (userFlightResult.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'No flights found for user',
      });
    }

    const flights = {};

    userFlightResult.rows.forEach(row => {
      if (!flights[row.flight_id]) {
        flights[row.flight_id] = {
          id: row.flight_id,
          flightnumber: row.flightnumber,
          departureairport: row.departureairport,
          arrivalairport: row.arrivalairport,
          departuretime: row.departuretime,
          arrivaltime: row.arrivaltime,
          airline: row.airline,
          seats: [],
          preferences: {
            location: row.seat_location_name,
            extraLegroom: row.legroom_pref,
            position: row.seat_position_name,
            neighbouringRows: row.neighbouring_row_pref,
            sameRow: row.same_row_pref,
            sideBySide: row.side_by_side_pref,
          }
        };
      }

      if (row.seat_id) {
        flights[row.flight_id].seats.push({
          id: row.seat_id,
          number: row.seat_number,
          extraLegroom: row.seat_legroom,
          location: row.seat_location_name,
          position: row.seat_position_name,
        });
      }
    });

    return Object.values(flights);
  } catch (err) {
    console.error('Database query error:', err); 
    throw err;
  }
};

module.exports = {
  selectFlightsByUser,
};
