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

    if (doesSwapExist.rowCount !== 0 && doesSwapExist.rows[0].cancelled === true) {
     return await updateSwap('request', doesSwapExist.rows[0].id);
    }

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
    if (action === 'accept') {
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
    if (action === 'request') {
      const updatedSwap = await db.query(
        'UPDATE swap SET cancelled = false WHERE id=$1 RETURNING offered_seat_id, requested_seat_id, cancelled;',
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
    if (didRequestQuery.rowCount !== 0 && didRequestQuery.rows[0].swap_request_date) return {actions: ['cancel']};
    if (didRequestQuery.rowCount !== 0 && didRequestQuery.rows[0].swap_request_date && didRequestQuery.rows[0].cancelled) return {actions: ['request']};
    if (didRequestQuery.rowCount !== 0 && didRequestQuery.rows[0].swap_request_date && didRequestQuery.rows[0].rejected) return {actions: ['rejected']};
    if (didRequestQuery.rowCount !== 0 && didRequestQuery.rows[0].swap_request_date && didRequestQuery.rows[0].rejected && didRequestQuery.rows[0].cancelled) return {actions: ['rejected']};
    if (didRequestQuery.rowCount !== 0 && didRequestQuery.rows[0].swap_request_date && didRequestQuery.rows[0].swap_approval_date) return {actions: ['accepted']};


    
    
  //  if(didRequestQuery.rowCount !== 0 && didRequestQuery.rows[0].swap_approval_date &&) {}
    if (
      didRequestQuery.rowCount !== 0 &&
      didRequestQuery.rows[0].cancelled === true
    ) {
      return {
        actions: ['request'],
        swap_id: didRequestQuery.rows[0].id,
      };
    }
    if (
      seatRequestedQuery.rowCount !== 0 &&
      seatRequestedQuery.rows[0].cancelled === true
    ) {
      return {
        actions: ['request'],
        swap_id: seatRequestedQuery.rows[0].id,
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
      didRequestQuery.rows[0].swap_approval_date === null &&
      didRequestQuery.rows[0].cancelled === false
    ) {
      return {
        actions: ['cancel'],
        swap_id: didRequestQuery.rows[0].id,
      };
    }
    return {actions: [ 'ok']};
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


// didRequestQuery.rowCount !== 0 // user has requested
// seatRequestedQuery.rowCount !== 0 // the other has requested

// |offered_seat_id|requested_seat_id|swap_request_date|swap_approval_date|rej|can| // you have requested
// |yours          |theirs           |not null         |null              |fal|fal| // you have requested
// |yours          |theirs           |not null         |null              |fal|tru| // you requested and cancelled
// |yours          |theirs           |not null         |null              |tru|fal| // you requested and got rejected
// |yours          |theirs           |not null         |null              |tru|tru| // you requested but diffrent swap happened
// |yours          |theirs           |not null         |not null          |fal|fal| // you requested and got accepted


// |offered_seat_id|requested_seat_id|swap_request_date|swap_approval_date|rej|can| // 
// |theirs         |yours            |not null         |null              |fal|fal| // user has requested
// |theirs         |yours            |not null         |null              |fal|tru| // user has requested and cancelled
// |theirs         |yours            |not null         |null              |tru|fal| // user has requested and got rejected
// |theirs         |yours            |not null         |not null          |fal|fal| // user has requested and got accepted
// |theirs         |yours            |not null         |null              |tru|tru| // user has requested but difffrent swap happened
