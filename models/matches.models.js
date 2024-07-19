const db = require('../db/connection.js');
const pgformat = require('pg-format');
const dayjs = require('dayjs');

const {
  getPositionName,
  getLocationName,
} = require('../helpers/seatsArrayTranformer.js');

const { doesUserExist, doesFlightExist } = require('../helpers/errorChecks');

const selectSideBySideMatches = async (user_id, flight_id) => {
  try {
    await doesUserExist(user_id);
    await doesFlightExist(flight_id);

    const usersSeats = await db.query(
      `SELECT * FROM seat WHERE flight_id = $1 AND user_id = $2;`,
      [flight_id, user_id]
    );

    const side_by_side_matches = await Promise.all(
      usersSeats.rows.map(async (seat) => {
        const current_seats = {
          id: seat.id,
          seat_row: seat.seat_row,
          seat_letter: seat.seat_letter,
          extraLegroom: seat.legroom,
          position: getPositionName(seat.seat_position_id),
          location: getLocationName(seat.seat_location_id),
        };
        const sql = pgformat(
          'SELECT * FROM seat WHERE flight_id = %s AND seat_row = %s AND seat_column IN (%L);',
          flight_id,
          seat.seat_row,
          [seat.seat_column + 1, seat.seat_column - 1]
        );
        const { rows } = await db.query(sql);
        const offer_seats = rows.map((seat) => {
          return {
            id: seat.id,
            seat_row: seat.seat_row,
            seat_letter: seat.seat_letter,
            extraLegroom: seat.legroom,
            position: getPositionName(seat.seat_position_id),
            location: getLocationName(seat.seat_location_id),
          };
        });

        return {
          current_seats: current_seats,
          offer_seats: offer_seats,
        };
      })
    );
    return side_by_side_matches;
  } catch (err) {
    throw err;
  }
};

const selectSameRowMatches = async (user_id, flight_id) => {
  try {
    await doesUserExist(user_id);
    await doesFlightExist(flight_id);

    const usersSeats = await db.query(
      `SELECT * FROM seat WHERE flight_id = $1 AND user_id = $2;`,
      [flight_id, user_id]
    );

    const same_row_matches = await Promise.all(
      usersSeats.rows.map(async (seat) => {
        const current_seats = {
          id: seat.id,
          seat_row: seat.seat_row,
          seat_letter: seat.seat_letter,
          extraLegroom: seat.legroom,
          position: getPositionName(seat.seat_position_id),
          location: getLocationName(seat.seat_location_id),
        };
        const sql = pgformat(
          'SELECT * FROM seat WHERE flight_id = %s AND seat_row = %s AND seat_column NOT IN (%L) AND user_id !=%s;',
          flight_id,
          seat.seat_row,
          [seat.seat_column + 1, seat.seat_column - 1],
          user_id
        );
        const { rows } = await db.query(sql);
        const offer_seats = rows.map((seat) => {
          return {
            id: seat.id,
            seat_row: seat.seat_row,
            seat_letter: seat.seat_letter,
            extraLegroom: seat.legroom,
            position: getPositionName(seat.seat_position_id),
            location: getLocationName(seat.seat_location_id),
          };
        });

        return {
          current_seats: current_seats,
          offer_seats: offer_seats,
        };
      })
    );
    return same_row_matches;
  } catch (err) {
    throw err;
  }
};

const selectNeighbourhingRowsMatches = async (user_id, flight_id) => {
  try {
    await doesUserExist(user_id);
    await doesFlightExist(flight_id);

    const usersSeats = await db.query(
      `SELECT * FROM seat WHERE flight_id = $1 AND user_id = $2;`,
      [flight_id, user_id]
    );

    const neighbouring_rows_matches = await Promise.all(
      usersSeats.rows.map(async (seat) => {
        const current_seats = {
          id: seat.id,
          seat_row: seat.seat_row,
          seat_letter: seat.seat_letter,
          extraLegroom: seat.legroom,
          position: getPositionName(seat.seat_position_id),
          location: getLocationName(seat.seat_location_id),
        };

        const sql = pgformat(
          'SELECT * FROM seat WHERE flight_id = %s AND seat_row IN (%L);',
          flight_id,
          [seat.seat_row + 1, seat.seat_row - 1]
        );
        const { rows } = await db.query(sql);
        const offer_seats = rows.map((seat) => {
          return {
            id: seat.id,
            seat_row: seat.seat_row,
            seat_letter: seat.seat_letter,
            extraLegroom: seat.legroom,
            position: getPositionName(seat.seat_position_id),
            location: getLocationName(seat.seat_location_id),
          };
        });

        return {
          current_seats: current_seats,
          offer_seats: offer_seats,
        };
      })
    );

    return neighbouring_rows_matches;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  selectSideBySideMatches,
  selectSameRowMatches,
  selectNeighbourhingRowsMatches,
};
