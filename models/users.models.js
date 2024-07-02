const db = require('../db/connection.js');
const pgformat = require('pg-format');

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
    function getPositionId(positionName) {
      if (positionName === 'window') return 1;
      if (positionName === 'middle') return 2;
      if (positionName === 'aisle') return 3;
    }
    function getLocationId(locationName) {
      if (locationName === 'front') return 1;
      if (locationName === 'center') return 2;
      if (locationName === 'back') return 3;
    }
    const seatsForQuery = seats.map((seat) => {
      return {
        user_id: Number(user_id),
        flight_id: Number(flight_id),
        number: seat.number,
        legroom: seat.extraLegroom,
        seat_position_id: getPositionId(seat.position),
        seat_location_id: getLocationId(seat.location),
      };
    });
    const insertSeatQueryStr = pgformat(
      `INSERT INTO seat (flight_id, user_id, number, legroom, seat_location_id, seat_position_id) VALUES %L 
      RETURNING *;`,
      seatsForQuery.map(
        ({
          flight_id,
          user_id,
          number,
          legroom,
          seat_location_id,
          seat_position_id,
        }) => [
          flight_id,
          user_id,
          number,
          legroom,
          seat_location_id,
          seat_position_id,
        ]
      )
    );

    const newSeats = await db.query(insertSeatQueryStr);
    function getPositionName(positionId) {
      if (positionId === 1) return 'window';
      if (positionId === 2) return 'middle';
      if (positionId === 3) return 'aisle';
    }
    function getLocationName(locationId) {
      if (locationId === 1) return 'front';
      if (locationId === 2) return 'center';
      if (locationId === 3) return 'back';
    }
    const seatsFormatted = newSeats.rows.map((seat) => {
      return {
        id: seat.id,
        number: seat.number,
        extraLegroom: seat.legroom,
        location: getLocationName(seat.seat_location_id),
        position: getPositionName(seat.seat_position_id),
      };
    });
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
module.exports = {
  selectFlightsByUser,
  deleteFlightByUserIdAndFlightId,
  updateFlightByUserIdAndFlightId,
};
