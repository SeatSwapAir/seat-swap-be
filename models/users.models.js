const db = require('../db/connection.js');

const selectFlightsByUser = async (user_id) => {
  try {
    const userResult = await db.query(`SELECT * FROM "user" WHERE id = $1;`, [
      user_id,
    ]);

    if (userResult.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'User not found',
      });
    }

    const userFlightResult = await db.query(
      `SELECT 
        flight.id AS flight_id,
        flight.flightNumber,
        flight.departureAirport,
        flight.arrivalAirport,
        flight.departureTime,
        flight.arrivalTime,
        flight.airline,
        seat.id AS seat_id,
        seat.number AS seat_number,
        seat.legroom AS seat_legroom,
        seat_location.location_name AS seat_location_name,
        seat_position.position_name AS seat_position_name,
        journey_prefs.legroom_pref,
        journey_prefs.window_pref,
        journey_prefs.middle_pref,
        journey_prefs.aisle_pref,
        journey_prefs.front_pref,
        journey_prefs.center_pref,
        journey_prefs.back_pref,
        journey_prefs.side_by_side_pref,
        journey_prefs.neighbouring_row_pref,
        journey_prefs.same_row_pref
      FROM 
        flight
      JOIN 
        journey_prefs ON journey_prefs.flight_id = flight.id
      LEFT JOIN 
        seat ON seat.flight_id = flight.id
      LEFT JOIN 
        seat_location ON seat.seat_location_id = seat_location.id
      LEFT JOIN 
        seat_position ON seat.seat_position_id = seat_position.id
      WHERE 
        journey_prefs.user_id = $1;`,
      [user_id]
    );

    if (userFlightResult.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'No flights found for user',
      });
    }

    const flights = {};

    userFlightResult.rows.forEach((row) => {
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
          },
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
    // console.error('Database query error:', err);
    throw err;
  }
};

const selectJourneyByUserIdAndFlightId = async (user_id, flight_id) => {
  try {
    const userJourneyResult = await db.query(
      `SELECT * FROM journey_prefs WHERE user_id = $1 AND flight_id = $2;`,
      [user_id, flight_id]
    );  

    if (userJourneyResult.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'User journey not found',
      });
    }

    return userJourneyResult.rows[0];
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

const deleteFlightByUserIdAndFlightId = async (user_id, flight_id) => {
  try {
    const userJourneyResult = await db.query(
      `SELECT * FROM journey_prefs WHERE user_id = $1 AND flight_id = $2;`,
      [user_id, flight_id]
    );

    if (userJourneyResult.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'User journey not found',
      });
    }

    const seatsDeleted = await db.query(`DELETE FROM "seat" WHERE user_id = $1 AND flight_id = $2;`, [
      user_id,
      flight_id,
    ]);
    
    const seatsJourneyPrefsDeleted = await db.query(`DELETE FROM journey_prefs WHERE user_id = $1 AND flight_id = $2;`, [
      user_id,
      flight_id,
    ]);

    if (seatsDeleted.rowCount === 0 && seatsJourneyPrefsDeleted.rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: 'Failed to delete journey or seats',
      });
    }
    return "Deleted";
  } catch (err) {
    // console.error('Database query error:', err);
    throw err;
  }
};
module.exports = {
  selectFlightsByUser,
  deleteFlightByUserIdAndFlightId
};
