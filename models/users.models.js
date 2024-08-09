const db = require('../db/connection.js');
const pgformat = require('pg-format');

const {
  doesUserExist,
  doesFlightExist,
  isSeatDuplicate,
  isSeatTaken,
  seatsInsertedFormatted,
  hasBeenSwapped,
} = require('../helpers/errorChecks');

const selectFlightsByUser = async (user_id) => {
  try {
    await doesUserExist(user_id);
    const journeysSql = `SELECT
        flight.id AS id,
        flight.flightNumber AS flightnumber,
        flight.departureAirport AS departureairport,
        flight.arrivalAirport AS arrivalairport,
        flight.departureTime AS departuretime,
        flight.arrivalTime AS arrivaltime,
        flight.airline AS airline,
        arr_airport.name AS arrivalairportname,
        arr_airport.city AS arrivalairportcity,
        dep_airport.name AS departureairportname,
        dep_airport.city AS departureairportcity
      FROM 
        flight
      JOIN 
        journey_prefs ON journey_prefs.flight_id = flight.id
      JOIN 
        airport AS arr_airport ON flight.arrivalAirport = arr_airport.iata
      JOIN 
        airport AS dep_airport ON flight.departureAirport = dep_airport.iata
      WHERE
        journey_prefs.user_id = $1;`;
    const journeyResult = await db.query(journeysSql, [user_id]);

    if (journeyResult.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'No flights found for user',
      });
    }
    const flightsIds = journeyResult.rows.map((row) => row.id);

    const seatsSql = pgformat(
      `SELECT
        seat.id AS id,
        seat.current_user_id AS current_user_id,
        seat.original_user_id AS original_user_id,
        seat.previous_user_id AS previous_user_id,
        "user".firstname AS previous_user_name,
        seat.seat_letter AS seat_letter,
        seat.seat_row AS seat_row,
        seat.flight_id AS flight_id,
        seat.legroom AS "extraLegroom",
        seat_location.location_name AS location,
        seat_position.position_name AS position
      FROM seat 
      JOIN seat_location ON seat.seat_location_id = seat_location.id
      JOIN seat_position ON seat.seat_position_id = seat_position.id
      LEFT JOIN "user" ON seat.previous_user_id = "user".id
      WHERE
        seat.current_user_id = %s AND seat.flight_id IN (%L);`,
      user_id,
      flightsIds
    );

    const seatsResult = await db.query(seatsSql);
    const journeys = journeyResult.rows.map((journey) => {
      const seats = seatsResult.rows.filter(
        (seat) => seat.flight_id === journey.id
      );
      return { ...journey, seats };
    });

    return journeys;
    // const flights = {};

    // for (const row of userFlightResult.rows) {
    //   if (!flights[row.flight_id]) {
    //     flights[row.flight_id] = {
    //       id: row.flight_id,
    //       flightnumber: row.flightnumber,
    //       departureairport: row.departureairport,
    //       arrivalairport: row.arrivalairport,
    //       departuretime: row.departuretime,
    //       arrivaltime: row.arrivaltime,
    //       airline: row.airline,
    //       seats: [],
    //       preferences: {
    //         legroom_pref: row.legroom_pref,
    //         window_pref: row.window_pref,
    //         middle_pref: row.middle_pref,
    //         aisle_pref: row.aisle_pref,
    //         front_pref: row.front_pref,
    //         center_pref: row.center_pref,
    //         back_pref: row.back_pref,
    //         neighbouring_row_pref: row.neighbouring_row_pref,
    //         same_row_pref: row.same_row_pref,
    //         side_by_side_pref: row.side_by_side_pref,
    //       },
    //     };
    //   }

    //   if (row.seat_id) {
    //     const prevUserName = async (user_id) => {
    //       if (row.seat_previous_user_id !== null) {
    //         const prevUserName = await db.query(
    //           'SELECT firstname FROM "user" WHERE id=$1',
    //           [user_id]
    //         );
    //         return prevUserName.rows[0].firstname;
    //       }
    //       return null;
    //     };

    //     flights[row.flight_id].seats.push({
    //       id: row.seat_id,
    //       current_user_id: row.seat_current_user_id,
    //       original_user_id: row.seat_original_user_id,
    //       previous_user_id: row.seat_previous_user_id,
    //       previous_user_name: await prevUserName(row.seat_previous_user_id),
    //       seat_letter: row.seat_letter,
    //       seat_row: row.seat_row,
    //       extraLegroom: row.seat_legroom,
    //       location: row.seat_location_name,
    //       position: row.seat_position_name,
    //     });
    //   }
    // }
    // return Object.values(flights);
  } catch (err) {
    throw err;
  }
};

const seatSwapChecker = async (seat_id) => {
  const isSeatSwapped = await db.query(
    `SELECT * FROM swap WHERE (offered_seat_id = $1 OR requested_seat_id = $1) AND swap_approval_date IS NOT NULL;`,
    [seat_id]
  );

  if (isSeatSwapped.rowCount !== 0) {
    const offered_seat_id = isSeatSwapped.rows[0].offered_seat_id;
    const requested_seat_id = isSeatSwapped.rows[0].requested_seat_id;
    if (offered_seat_id === seat_id) {
      const swappedSeat = await db.query(`SELECT * FROM seat WHERE id=$1;`, [
        requested_seat_id,
      ]);
      return swappedSeat.rows[0];
    }
    const swappedSeat = await db.query(`SELECT * FROM seat WHERE id=$1;`, [
      offered_seat_id,
    ]);
    return swappedSeat.rows[0];
  }

  return false;
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
      `DELETE FROM "seat" WHERE current_user_id = $1 AND flight_id = $2;`,
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
  } = journey;

  try {
    const seatNumbers = seats.map((seat) => seat.seat_row + seat.seat_letter);

    await isSeatDuplicate(seatNumbers);

    await doesUserExist(user_id);

    await doesFlightExist(flight_id);

    await isSeatTaken(seats, user_id, flight_id);
    await hasBeenSwapped(seats);

    await db.query(
      `DELETE FROM "seat" WHERE current_user_id = $1 AND flight_id= $2`,
      [user_id, flight_id]
    );

    const seatsFormatted = await seatsInsertedFormatted(
      seats,
      user_id,
      flight_id
    );

    const journey = {
      id: Number(flight_id),
      flightnumber: flightnumber,
      departureairport: departureairport,
      arrivalairport: arrivalairport,
      departuretime: departuretime,
      arrivaltime: arrivaltime,
      airline: airline,
      seats: seatsFormatted,
    };
    // console.log(journey.seats);
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
    const seatNumbers = seats.map((seat) => seat.seat_row + seat.seat_letter);

    isSeatDuplicate(seatNumbers);

    await doesUserExist(user_id);

    await doesFlightExist(flight_id);

    await isSeatTaken(seats, user_id, flight_id);

    const seatsFormatted = await seatsInsertedFormatted(
      seats,
      user_id,
      flight_id
    );

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

const selectSeatByUserIdAndFlightIdAndSeatLetterAndSeatNumber = async (
  user_id,
  flight_id,
  seat_letter,
  seat_number
) => {
  try {
    await doesUserExist(user_id);
    await doesFlightExist(flight_id);

    if (!/^[A-J]$/.test(seat_letter)) {
      return Promise.reject({
        status: 400,
        msg: 'Invalid seat letter',
      });
    }

    if (Number.isNaN(+seat_number) || +seat_number > 99) {
      return Promise.reject({
        status: 400,
        msg: 'Invalid seat number',
      });
    }

    const seat = await db.query(
      `SELECT 
      seat.id, 
      seat.current_user_id,
      seat.original_user_id,
      seat.previous_user_id,
      "user".firstname AS previous_user_name,
      seat.seat_letter,
      seat.seat_row,
      seat.flight_id,
      seat.legroom AS "extraLegroom",
      seat_location.location_name AS location,
      seat_position.position_name AS position
      FROM seat 
      JOIN seat_location ON seat.seat_location_id = seat_location.id
      JOIN seat_position ON seat.seat_position_id = seat_position.id
      LEFT JOIN "user" ON seat.previous_user_id = "user".id
      WHERE flight_id = $1 AND seat_letter = $2 AND seat_row = $3;`,
      [flight_id, seat_letter, seat_number]
    );

    if (seat.rowCount === 0) return { msg: 'Seat is free' };

    if (seat.rows[0].current_user_id !== +user_id) {
      return Promise.reject({
        status: 403,
        msg: 'Seat already taken by another user',
      });
    }

    return seat.rows[0];
  } catch (err) {
    throw err;
  }
};
module.exports = {
  selectFlightsByUser,
  deleteFlightByUserIdAndFlightId,
  updateFlightByUserIdAndFlightId,
  insertFlightByUserIdAndFlightId,
  seatSwapChecker,
  selectSeatByUserIdAndFlightIdAndSeatLetterAndSeatNumber,
};

//post model for adding new journey pref and seats
//fix addding same flights
//model for returning default prefs to preselec users prefs
