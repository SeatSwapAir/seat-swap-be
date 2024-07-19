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

module.exports = {
  insertSwap,
};
