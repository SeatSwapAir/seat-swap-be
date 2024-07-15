const db = require('../db/connection.js');
const pgformat = require('pg-format');
const {
  formatSeatsQuery,
  formatSeatsReturn,
} = require('../helpers/seatsArrayTranformer.js');

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
        seat.seat_letter AS seat_letter,
        seat.seat_row AS seat_row,
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
        journey_prefs.user_id = $1 AND seat.user_id = $1;`,
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
            legroom_pref: row.legroom_pref,
            window_pref: row.window_pref,
            middle_pref: row.middle_pref,
            aisle_pref: row.aisle_pref,
            front_pref: row.front_pref,
            center_pref: row.center_pref,
            back_pref: row.back_pref,
            neighbouring_row_pref: row.neighbouring_row_pref,
            same_row_pref: row.same_row_pref,
            side_by_side_pref: row.side_by_side_pref,
          },
        };
      }

      if (row.seat_id) {
        flights[row.flight_id].seats.push({
          id: row.seat_id,
          number: row.seat_number,
          seat_letter: row.seat_letter,
          seat_row: row.seat_row,
          extraLegroom: row.seat_legroom,
          location: row.seat_location_name,
          position: row.seat_position_name,
        });
      }
    });

    return Object.values(flights);
  } catch (err) {
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

    const seatsDeleted = await db.query(
      `DELETE FROM "seat" WHERE user_id = $1 AND flight_id = $2;`,
      [user_id, flight_id]
    );

    const seatsJourneyPrefsDeleted = await db.query(
      `DELETE FROM journey_prefs WHERE user_id = $1 AND flight_id = $2;`,
      [user_id, flight_id]
    );

    if (
      seatsDeleted.rowCount === 0 &&
      seatsJourneyPrefsDeleted.rowCount === 0
    ) {
      return Promise.reject({
        status: 404,
        msg: 'Failed to delete journey or seats',
      });
    }
    return 'Deleted';
  } catch (err) {
    // console.error('Database query error:', err);
    throw err;
  }
};

const updateFlightByUserIdAndFlightId = async (user_id, flight_id, journey) => {
  const {
    flightnumber,
    departureairport,
    arrivalairport,
    departuretime,
    arrivaltime,
    airline,
    seats,
    preferences,
  } = journey;
  try {
    const seatNumbers = seats.map((seat) => seat.number);

    const findDuplicates = seatNumbers.filter(
      (seat, index) => seatNumbers.indexOf(seat) !== index
    );
    if (findDuplicates.length > 0) {
      return Promise.reject({
        status: 400,
        msg: 'You cannot enter the same seat twice. Remove duplicate.',
      });
    }

    const doesUserExist = await db.query(`SELECT * FROM "user" WHERE id = $1`, [
      user_id,
    ]);

    if (doesUserExist.rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: 'User not found',
      });
    }

    const doesFlightExist = await db.query(
      `SELECT * FROM "flight" WHERE id = $1`,
      [flight_id]
    );

    if (doesFlightExist.rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: 'Flight not found',
      });
    }
    const sql = pgformat(
      `SELECT * FROM "seat" WHERE user_id != %s AND flight_id = %s AND number IN (%L)`,
      user_id,
      flight_id,
      seatNumbers
    );
    const isSeatTaken = await db.query(sql);

    if (isSeatTaken.rowCount !== 0) {
      return Promise.reject({
        status: 400,
        msg: 'Seat(s) already taken by another passenger',
      });
    }

    await db.query(`DELETE FROM "seat" WHERE user_id = $1 AND flight_id= $2`, [
      user_id,
      flight_id,
    ]);

    const seatsForQuery = formatSeatsQuery(seats, user_id, flight_id);

    const insertSeatQueryStr = pgformat(
      `INSERT INTO seat (flight_id, user_id, number, seat_row, seat_letter, seat_column, legroom, seat_location_id, seat_position_id) VALUES %L 
      RETURNING *;`,
      seatsForQuery.map(
        ({
          flight_id,
          user_id,
          number,
          seat_row,
          seat_letter,  
          seat_column,
          legroom,
          seat_location_id,
          seat_position_id,
        }) => [
          flight_id,
          user_id,
          number,
          seat_row,
          seat_letter,  
          seat_column,
          legroom,
          seat_location_id,
          seat_position_id,
        ]
      )
    );

    const newSeats = await db.query(insertSeatQueryStr);

    const seatsFormatted = formatSeatsReturn(newSeats.rows);

    const {
      legroom_pref,
      window_pref,
      middle_pref,
      aisle_pref,
      front_pref,
      center_pref,
      back_pref,
      side_by_side_pref,
      neighbouring_row_pref,
      same_row_pref,
    } = preferences;

    const updatePrefsQueryStr = pgformat(
      `UPDATE journey_prefs SET 
      legroom_pref = %L,
      window_pref = %L,
      middle_pref = %L,
      aisle_pref = %L,
      front_pref = %L,
      center_pref = %L,
      back_pref = %L,
      side_by_side_pref = %L,
      neighbouring_row_pref = %L,
      same_row_pref = %L
  WHERE 
      user_id = %L AND 
      flight_id = %L 
  RETURNING *;
`,
      legroom_pref,
      window_pref,
      middle_pref,
      aisle_pref,
      front_pref,
      center_pref,
      back_pref,
      side_by_side_pref,
      neighbouring_row_pref,
      same_row_pref,
      user_id,
      flight_id
    );

    const newPrefs = await db.query(updatePrefsQueryStr);
    const journey = {
      id: Number(flight_id),
      flightnumber: flightnumber,
      departureairport: departureairport,
      arrivalairport: arrivalairport,
      departuretime: departuretime,
      arrivaltime: arrivaltime,
      airline: airline,
      seats: seatsFormatted,
      preferences: newPrefs.rows[0],
    };
    return journey;
  } catch (err) {
    // console.error('Database query error:', err);
    throw err;
  }
};

const insertFlightByUserIdAndFlightId = async (user_id, flight_id, journey) => {
  const {
    flightnumber,
    departureairport,
    arrivalairport,
    departuretime,
    arrivaltime,
    airline,
    seats,
    preferences,
  } = journey;
  try {
    const seatNumbers = seats.map((seat) => seat.number);

    const findDuplicates = seatNumbers.filter(
      (seat, index) => seatNumbers.indexOf(seat) !== index
    );
    if (findDuplicates.length > 0) {
      return Promise.reject({
        status: 400,
        msg: 'You cannot enter the same seat twice. Remove duplicate.',
      });
    }

    const doesUserExist = await db.query(`SELECT * FROM "user" WHERE id = $1`, [
      user_id,
    ]);

    if (doesUserExist.rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: 'User not found',
      });
    }

    const doesFlightExist = await db.query(
      `SELECT * FROM "flight" WHERE id = $1`,
      [flight_id]
    );

    if (doesFlightExist.rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: 'Flight not found',
      });
    }
    const sql = pgformat(
      `SELECT * FROM "seat" WHERE user_id != %s AND flight_id = %s AND number IN (%L)`,
      user_id,
      flight_id,
      seatNumbers
    );
    const isSeatTaken = await db.query(sql);

    if (isSeatTaken.rowCount !== 0) {
      return Promise.reject({
        status: 400,
        msg: 'Seat(s) already taken by another passenger',
      });
    }

    await db.query(`DELETE FROM "seat" WHERE user_id = $1 AND flight_id= $2`, [
      user_id,
      flight_id,
    ]);

    const seatsForQuery = formatSeatsQuery(seats, user_id, flight_id);

    const insertSeatQueryStr = pgformat(
      `INSERT INTO seat (flight_id, user_id, number, seat_row, seat_letter, seat_column, legroom, seat_location_id, seat_position_id) VALUES %L 
          RETURNING *;`,
      seatsForQuery.map(
        ({
          flight_id,
          user_id,
          number,
          seat_row,
          seat_letter,  
          seat_column,
          legroom,
          seat_location_id,
          seat_position_id,
        }) => [
          flight_id,
          user_id,
          number,
          seat_row,
          seat_letter,  
          seat_column,
          legroom,
          seat_location_id,
          seat_position_id,
        ]
      )
    );

    const newSeats = await db.query(insertSeatQueryStr);

    const seatsFormatted = formatSeatsReturn(newSeats.rows);

    const preferencesArray = [
      flight_id,
      user_id,
      ...Object.values(preferences),
    ];
    const insertPrefsQueryStr = pgformat(
      `INSERT INTO journey_prefs (flight_id, user_id, legroom_pref, window_pref, middle_pref, aisle_pref, front_pref, center_pref, back_pref, side_by_side_pref, neighbouring_row_pref, same_row_pref) VALUES (%L) RETURNING *;`,
      preferencesArray
    );

    const newPrefs = await db.query(insertPrefsQueryStr);
    const journey = {
      id: Number(flight_id),
      flightnumber: flightnumber,
      departureairport: departureairport,
      arrivalairport: arrivalairport,
      departuretime: departuretime,
      arrivaltime: arrivaltime,
      airline: airline,
      seats: seatsFormatted,
      preferences: newPrefs.rows[0],
    };
    return journey;
  } catch (err) {
    // console.error('Database query error:', err);
    throw err;
  }
};

module.exports = {
  selectFlightsByUser,
  deleteFlightByUserIdAndFlightId,
  updateFlightByUserIdAndFlightId,
  insertFlightByUserIdAndFlightId,
};

//post model for adding new journey pref and seats
//fix addding same flights
//model for returning default prefs to preselec users prefs
