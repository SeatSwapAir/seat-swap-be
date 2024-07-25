const db = require('../db/connection.js');
const pgformat = require('pg-format');
const moment = require('moment');

const { doesSeatIdExist } = require('../helpers/errorChecks');

const insertSwap = async (offered_seat_id, requested_seat_id) => {
  try {
    await doesSeatIdExist(offered_seat_id);
    await doesSeatIdExist(requested_seat_id);
    const doesSwapExist = await db.query(
      'SELECT * FROM swap WHERE offered_seat_id=$1 AND requested_seat_id= $2;',
      [offered_seat_id, requested_seat_id]
    );

    if (doesSwapExist.rowCount !== 0) {
      return Promise.reject({
        status: 400,
        msg: 'Swap already exists',
      });
    }

    const insertSwapQueryStr = pgformat(
      `INSERT INTO swap (offered_seat_id, requested_seat_id) VALUES (%L) RETURNING *;`,
      [offered_seat_id, requested_seat_id]
    );
    const swap = await db.query(insertSwapQueryStr);

    const swapFormatted = {
      offered_seat_id: swap.rows[0].offered_seat_id,
      requested_seat_id: swap.rows[0].requested_seat_id,
      swap_request_date: swap.rows[0].swap_request_date,
    };

    return swapFormatted;
  } catch (err) {
    // console.error('Database query error:', err);
    throw err;
  }
};

const updateSwap = async (action, swap_id) => {
  try {
    const doesSwapExist = await db.query('SELECT * FROM swap WHERE id=$1', [
      swap_id,
    ]);

    if (doesSwapExist.rowCount === 0) {
      return Promise.reject({
        status: 400,
        msg: 'Swap does not exist',
      });
    }
    if (action === 'approve') {
      const updatedSwap = await db.query(
        'UPDATE swap SET swap_approval_date = CURRENT_TIMESTAMP WHERE id=$1 RETURNING offered_seat_id, requested_seat_id, swap_approval_date;',
        [swap_id]
      );

      const findSwapUsers = await db.query(
        'SELECT flight_id, user_id FROM seat WHERE id IN ($1,$2);',
        [
          updatedSwap.rows[0].offered_seat_id,
          updatedSwap.rows[0].requested_seat_id,
        ]
      );
      const findUsersSeats = await db.query(
        'SELECT id FROM seat WHERE flight_id=$1 AND user_id IN ($2,$3);',
        [
          findSwapUsers.rows[0].flight_id,
          findSwapUsers.rows[0].user_id,
          findSwapUsers.rows[1].user_id,
        ]
      );
      const userSeatsFormatted = findUsersSeats.rows.map((seat) => seat.id);

      const cancelSwapsQuery = pgformat(
        'UPDATE swap SET rejection = true, cancelled = true WHERE (offered_seat_id IN %L OR requested_seat_id IN %L) AND swap_approval_date IS NULL RETURNING *;',
        [userSeatsFormatted],
        [userSeatsFormatted]
      );
      const cancelledSwaps = await db.query(cancelSwapsQuery);
      const result = {
        approved: updatedSwap.rows[0],
        cancelled: cancelledSwaps.rows,
      };

      return result;
    }
    if (action === 'reject') {
      const updatedSwap = await db.query(
        'UPDATE swap SET rejection = true WHERE id=$1 RETURNING offered_seat_id, requested_seat_id, rejection;',
        [swap_id]
      );
      return updatedSwap.rows[0];
    }
    if (action === 'cancel') {
      const updatedSwap = await db.query(
        'UPDATE swap SET cancelled = true WHERE id=$1 RETURNING offered_seat_id, requested_seat_id, cancelled;',
        [swap_id]
      );
      return updatedSwap.rows[0];
    }
  } catch (err) {
    // console.error('Database query error:', err);
    throw err;
  }
};

const selectSwap = async (your_seat_id, matched_seat_id) => {
  try {
    await doesSeatIdExist(your_seat_id);
    await doesSeatIdExist(matched_seat_id);
    const didRequestQuery = await db.query(
      'SELECT * FROM swap WHERE offered_seat_id = $1 AND requested_seat_id = $2;',
      [your_seat_id, matched_seat_id]
    );
    const seatRequestedQuery = await db.query(
      'SELECT * FROM swap WHERE offered_seat_id = $2 AND requested_seat_id = $1;',
      [your_seat_id, matched_seat_id]
    );

    if (didRequestQuery.rowCount === 0 && seatRequestedQuery.rowCount === 0) {
      return {
        actions: ['request'],
      };
    }
    if (seatRequestedQuery.rowCount !== 0) {
      return {
        actions: ['accept', 'reject'],
        swap_id: seatRequestedQuery.rows[0].id,
      };
    }
    if (
      didRequestQuery.rowCount !== 0 &&
      didRequestQuery.rows[0].swap_approval_date === null
    ) {
      return {
        actions: ['cancel'],
        swap_id: didRequestQuery.rows[0].id,
      };
    }
  } catch (err) {
    // console.error('Database query error:', err);
    throw err;
  }
};

module.exports = {
  insertSwap,
  updateSwap,
  selectSwap,
};
