const db = require('../db/connection.js');
const pgformat = require('pg-format');

const { doesSeatIdExist } = require('../helpers/errorChecks');
const { hasBeenSwapped } = require('../helpers/errorChecks');

const updateSeat = async (seat_id, seat) => {
  try {
    await doesSeatIdExist(seat_id);
    await hasBeenSwapped([seat]);
    // const seatsSwappedSql = await db.query(
    //   `SELECT seat_row, seat_letter FROM seat WHERE previous_user_id IS NOT NULL AND id=$1;`,
    //   [seat_id]
    // );
    // if (seatsSwapped.rowCount !== 0) {
    //     const seatsSwappedFormatted =  seat.seat_row + seat.seat_letter
    //     return Promise.reject({
    //       status: 400,
    //       msg: `Seat ${seatsSwappedFormatted} already swapped, cannot change`,
    //     });
    //   }
    // console.log('🚀 ~ updateSeat ~ seatsSwappedSql:', seatsSwappedSql.rows);

    const updatedSeat = await db.query(
      `UPDATE seat SET 
      legroom = $1, 
      seat_location_id = (SELECT id FROM seat_location WHERE location_name = $2),
      seat_position_id = (SELECT id FROM seat_position WHERE position_name = $3)
      WHERE id = $4 RETURNING
      id,
      current_user_id,
      original_user_id,
      previous_user_id,
      flight_id,
      seat_row,
      seat_letter,
      legroom AS "extraLegroom", 
      (SELECT location_name FROM seat_location WHERE id = seat.seat_location_id) AS "location", 
      (SELECT position_name FROM seat_position WHERE id = seat.seat_position_id) AS "position",
      (SELECT firstname FROM "user" WHERE id = seat.previous_user_id) AS "previous_user_name"
      ;`,
      [seat.extraLegroom, seat.location, seat.position, seat.id]
    );
    return updatedSeat.rows[0];
  } catch (err) {
    // console.error('Database query error:', err.stack);
    throw err;
  }
};

module.exports = {
  updateSeat,
};
