const db = require('../db/connection.js');
const pgformat = require('pg-format');

const {
  formatSeatsQuery,
  formatSeatsReturn,
} = require('../helpers/seatsArrayTranformer');

const doesUserExist = async (user_id) => {
  const userResult = await db.query(`SELECT * FROM "user" WHERE id = $1;`, [
    user_id,
  ]);

  if (userResult.rows.length === 0) {
    return Promise.reject({
      status: 404,
      msg: 'User not found',
    });
  }
};

const doesFlightExist = async (flight_id) => {
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
};

const isSeatDuplicate = async (seatNumbers) => {
  const findDuplicates = seatNumbers.filter(
    (seat, index) => seatNumbers.indexOf(seat) !== index
  );
  if (findDuplicates.length > 0) {
    return Promise.reject({
      status: 400,
      msg: 'You cannot enter the same seat twice. Remove duplicate.',
    });
  }
};

const isSeatTaken = async (seats, user_id, flight_id) => {
  const takenSeats = (
    await Promise.all(
      seats.map(async (seat) => {
        const sql = pgformat(
          `SELECT * FROM "seat" WHERE user_id != %s AND flight_id = %s AND seat_row = %s AND seat_letter = '%s'`,
          user_id,
          flight_id,
          seat.seat_row,
          seat.seat_letter
        );
        const isSeatTaken = await db.query(sql);
        if (isSeatTaken.rowCount === 0) {
          return false;
        }
        return isSeatTaken.rows[0].seat_row + isSeatTaken.rows[0].seat_letter;
      })
    )
  ).filter((seat) => seat !== false);

  if (takenSeats.length > 0) {
    return Promise.reject({
      status: 400,
      msg: `Seat(s) ${takenSeats.join(
        ', '
      )} already taken by another passenger`,
    });
  }
};

const seatsInsertedFormatted = async (seats, user_id, flight_id) => {
  const seatsForQuery = formatSeatsQuery(seats, user_id, flight_id);

  const insertSeatQueryStr = pgformat(
    `INSERT INTO seat (flight_id, user_id, seat_row, seat_letter, seat_column, legroom, seat_location_id, seat_position_id) VALUES %L 
      RETURNING *;`,
    seatsForQuery.map(
      ({
        flight_id,
        user_id,
        seat_row,
        seat_letter,
        seat_column,
        legroom,
        seat_location_id,
        seat_position_id,
      }) => [
        flight_id,
        user_id,
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

  return seatsFormatted;
};

const doesSeatIdExist = async (seat_id) => {
  const seatExist = await db.query(`SELECT * FROM seat WHERE id= $1`, [
    seat_id,
  ]);
  if (seatExist.rowCount === 0) {
    return Promise.reject({
      status: 400,
      msg: 'Seat id not found',
    });
  }
};

module.exports = {
  doesUserExist,
  doesFlightExist,
  isSeatDuplicate,
  isSeatTaken,
  seatsInsertedFormatted,
  doesSeatIdExist,
};
