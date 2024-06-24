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

    const flightsResult = await db.query(
      `SELECT DISTINCT flight.*
      FROM seat
      JOIN flight ON seat.flight_id = flight.id
      WHERE seat.user_id = $1
      ORDER BY flight.id;`,
      [user_id]
    );

    if (flightsResult.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'No flights found for user',
      });
    }

    const flights = flightsResult.rows;

    const flightIds = flights.map(flight => flight.id);
    const seatsResult = await db.query(
      `SELECT seat.*, location.name as location_name, position.name as position_name
      FROM seat
      JOIN location ON seat.location_id = location.id
      JOIN position ON seat.position_id = position.id
      WHERE user_id = $1 AND flight_id = ANY($2::int[]);`,
      [user_id, flightIds]
    );

    const seats = seatsResult.rows;

    const preferencesResult = await db.query(
      `SELECT flight_preferences.*, location.name as location_name, position.name as position_name
      FROM flight_preferences
      JOIN location ON flight_preferences.location_id = location.id
      JOIN position ON flight_preferences.position_id = position.id
      WHERE user_id = $1 AND flight_id = ANY($2::int[]);`,
      [user_id, flightIds]
    );

    const preferences = preferencesResult.rows;

    const flightsWithDetails = flights.map(flight => {
      const flightSeats = seats.filter(seat => seat.flight_id === flight.id).map(seat => ({
        id: seat.id,
        number: seat.number,
        extraLegroom: seat.legroom,
        location: seat.location_name,
        position: seat.position_name,
        isEditing: false,
      }));

      const flightPreference = preferences.find(pref => pref.flight_id === flight.id) || {};

      return {
        id: flight.id,
        flightnumber: flight.flightnumber,
        departureairport: flight.departureairport,
        arrivalairport: flight.arrivalairport,
        departuretime: flight.departuretime,
        arrivaltime: flight.arrivaltime,
        airline: flight.airline,
        seats: flightSeats,
        preferences: {
          location: flightPreference.location_name,
          extraLegroom: flightPreference.legroom ,
          position: flightPreference.position_name,
          neighbouringRows: flightPreference.neighbouring_row,
          sameRow: flightPreference.same_row,
          sideBySide: flightPreference.side_by_side,
        },
      };
    });

    return flightsWithDetails;
  } catch (err) {
    console.error('Database query error:', err); 
    throw err;
  }
};

module.exports = {
  selectFlightsByUser,
};
