const db = require('../db/connection.js');
const pgformat = require('pg-format');
const moment = require('moment');

const { doesSeatIdExist } = require('../helpers/errorChecks');

const insertSwap = async (requester_seat_id, respondent_seat_id) => {
  try {
    await doesSeatIdExist(requester_seat_id);
    await doesSeatIdExist(respondent_seat_id);
    const doesSwapExist = await db.query(
      'SELECT * FROM swap WHERE requester_seat_id=$1 AND respondent_seat_id= $2;',
      [requester_seat_id, respondent_seat_id]
    );

    // if (
    //   doesSwapExist.rowCount !== 0 &&
    //   doesSwapExist.rows[0].cancelled === true
    // ) {
    //   return await updateSwap('request', doesSwapExist.rows[0].id);
    // }

    if (doesSwapExist.rowCount !== 0) {
      return Promise.reject({
        status: 400,
        msg: 'Swap already exists',
      });
    }

    const insertSwapQueryStr = pgformat(
      `INSERT INTO swap (requester_seat_id, respondent_seat_id) VALUES (%L) RETURNING *;`,
      [requester_seat_id, respondent_seat_id]
    );
    // console.log('🚀 ~ insertSwap ~ insertSwapQueryStr:', insertSwapQueryStr);

    const swap = await db.query(insertSwapQueryStr);

    const swapFormatted = {
      requester_seat_id: swap.rows[0].requester_seat_id,
      respondent_seat_id: swap.rows[0].respondent_seat_id,
      created_at: swap.rows[0].created_at,
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
        `UPDATE swap SET updated_at = CURRENT_TIMESTAMP, status = 'accepted' WHERE id=$1 RETURNING *;`,
        [swap_id]
      );

      const updateRequestedSeat = await db.query(
        'UPDATE seat SET current_user_id = $1, previous_user_id = $2 WHERE id=$3 RETURNING *;',
        [
          updatedSwap.rows[0].requester_id,
          updatedSwap.rows[0].respondent_id,
          updatedSwap.rows[0].respondent_seat_id,
        ]
      );

      const updateRespondentSeat = await db.query(
        'UPDATE seat SET current_user_id = $1, previous_user_id = $2 WHERE id=$3 RETURNING *;',
        [
          updatedSwap.rows[0].respondent_id,
          updatedSwap.rows[0].requester_id,
          updatedSwap.rows[0].requester_seat_id,
        ]
      );

      const findSwapUsers = await db.query(
        'SELECT flight_id, current_user_id FROM seat WHERE id IN ($1,$2);',
        [
          updatedSwap.rows[0].requester_seat_id,
          updatedSwap.rows[0].respondent_seat_id,
        ]
      );

      const findUsersSeats = await db.query(
        'SELECT id FROM seat WHERE flight_id=$1 AND current_user_id IN ($2,$3);',
        [
          findSwapUsers.rows[0].flight_id,
          findSwapUsers.rows[0].current_user_id,
          findSwapUsers.rows[1].current_user_id,
        ]
      );

      const userSeatsFormatted = findUsersSeats.rows.map((seat) => seat.id);

      const voidSwapsQuery = pgformat(
        `UPDATE swap SET status = 'voided' WHERE (requester_seat_id IN %L OR respondent_seat_id IN %L) AND status != 'accepted' RETURNING *;`,
        [userSeatsFormatted],
        [userSeatsFormatted]
      );

      const voidedSwaps = await db.query(voidSwapsQuery);
      const result = {
        accepted: updatedSwap.rows[0],
        voided: voidedSwaps.rows,
      };

      return result;
    }
    if (action === 'reject') {
      const updatedSwap = await db.query(
        `UPDATE swap SET updated_at = CURRENT_TIMESTAMP, status = 'rejected' WHERE id=$1 RETURNING requester_seat_id, respondent_seat_id, status;`,
        [swap_id]
      );
      return updatedSwap.rows[0];
    }
    if (action === 'cancel') {
      const updatedSwap = await db.query(
        `UPDATE swap SET updated_at = CURRENT_TIMESTAMP, status = 'cancelled' WHERE id=$1 RETURNING requester_seat_id, respondent_seat_id, status;`,
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

    const user_id = await db.query(
      'SELECT current_user_id FROM seat WHERE id = $1;',
      [your_seat_id]
    );

    const swapExistQuery = await db.query(
      'SELECT * FROM swap WHERE requester_seat_id IN ($1, $2) AND respondent_seat_id IN ($1, $2) AND (requester_id = $3 OR respondent_id = $3);',
      [your_seat_id, matched_seat_id, user_id.rows[0].current_user_id]
    );
    console.log('🚀 ~ selectSwap ~ swapExistQuery:', swapExistQuery.rows);

    if (swapExistQuery.rowCount === 0) {
      return {
        actions: ['request'],
      };
    }

    const gotAccepted = swapExistQuery.rows[0].status === 'accepted';
    console.log('🚀 ~ selectSwap ~ gotAccepted:', gotAccepted);
    const gotRejected =
      swapExistQuery.rows[0].status === 'rejected' &&
      swapExistQuery.rows[0].requester_id === user_id.rows[0].current_user_id;
    console.log('🚀 ~ selectSwap ~ gotRejected:', gotRejected);

    // if (swapExistQuery.rows[0].status)
    // if (
    //   didRequestQuery.rowCount !== 0 &&
    //   didRequestQuery.rows[0].swap_request_date &&
    //   didRequestQuery.rows[0].rejected &&
    //   didRequestQuery.rows[0].cancelled
    // )
    //   return { actions: ['rejected'], swap_id: didRequestQuery.rows[0].id };
    // if (
    //   didRequestQuery.rowCount !== 0 &&
    //   didRequestQuery.rows[0].swap_request_date &&
    //   didRequestQuery.rows[0].cancelled
    // )
    //   return { actions: ['request'], swap_id: didRequestQuery.rows[0].id };
    // if (
    //   didRequestQuery.rowCount !== 0 &&
    //   didRequestQuery.rows[0].swap_request_date &&
    //   didRequestQuery.rows[0].rejected
    // )
    //   return { actions: ['rejected'], swap_id: didRequestQuery.rows[0].id };
    // if (
    //   didRequestQuery.rowCount !== 0 &&
    //   didRequestQuery.rows[0].swap_request_date &&
    //   didRequestQuery.rows[0].swap_approval_date
    // )
    //   return { actions: ['accepted'], swap_id: didRequestQuery.rows[0].id };
    // if (
    //   didRequestQuery.rowCount !== 0 &&
    //   didRequestQuery.rows[0].swap_request_date
    // )
    //   return { actions: ['cancel'], swap_id: didRequestQuery.rows[0].id };

    // if (
    //   seatRequestedQuery.rowCount !== 0 &&
    //   seatRequestedQuery.rows[0].swap_request_date &&
    //   seatRequestedQuery.rows[0].rejected &&
    //   seatRequestedQuery.rows[0].cancelled
    // )
    //   return { actions: ['rejected'], swap_id: seatRequestedQuery.rows[0].id };
    // if (
    //   seatRequestedQuery.rowCount !== 0 &&
    //   seatRequestedQuery.rows[0].swap_request_date &&
    //   seatRequestedQuery.rows[0].cancelled
    // )
    //   return { actions: ['request'], swap_id: seatRequestedQuery.rows[0].id };
    // if (
    //   seatRequestedQuery.rowCount !== 0 &&
    //   seatRequestedQuery.rows[0].swap_request_date &&
    //   seatRequestedQuery.rows[0].rejected
    // )
    //   return { actions: ['rejected'], swap_id: seatRequestedQuery.rows[0].id };
    // if (
    //   seatRequestedQuery.rowCount !== 0 &&
    //   seatRequestedQuery.rows[0].swap_request_date &&
    //   seatRequestedQuery.rows[0].swap_approval_date
    // )
    //   return { actions: ['accepted'], swap_id: seatRequestedQuery.rows[0].id };
    // if (
    //   seatRequestedQuery.rowCount !== 0 &&
    //   seatRequestedQuery.rows[0].swap_request_date
    // )
    //   return {
    //     actions: ['accept', 'reject'],
    //     swap_id: seatRequestedQuery.rows[0].id,
    //   };
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

// swap for the seats not foud in db at all // you can request
// |req_id |res_id |req_s_id | res_s_id | status
// |you    |them   |your     |theirs    | requested // you can cancel
// |you    |them   |your     |theirs    | cancelled 1. // you can request again // creates new entry canceled entries are ignored
// |you    |them   |your     |theirs    | accepted  // nothing can be done
// |you    |them   |your     |theirs    | voided    1. // you can request again // creates new entry canceled entries are ignored
// |you    |them   |your     |theirs    | rejected  // you cannot! request again

// |req_id |res_id |req_s_id | res_s_id | status
// |them    |you   |theirs     |your    | requested // we can accept or reject
// |them    |you   |theirs     |your    | cancelled 1. // we can request //new entry// row ignored
// |them    |you   |theirs     |your    | accepted  // nothoing can be done
// |them    |you   |theirs     |your    | voided    1. // we can request //new entry// row ignored
// |them    |you   |theirs     |your    | rejected  1. // we can request //new entry// row ignored

// if its  even there. if not action: request
// if its there and status voided or cancelled // action request
// its there and status rejected and res-id is you // status request
// its there req-id is you // actio cancel
// its there and status accept // already accepted (in theory it should not display) error?
// its there and req-id is you and status rejected // you cannot do anything you get infor that this has been rejected

//its there you are responded // action reject or accept
//1. those rows are treate like they not there and you can request
// Check if either swap exists
// If neither exists, then can be requested
// If either swap exists, if it is cancelled, then you can request again
// If either swap exists, and it has been requested by you, return cancel action
// If either swap exists, and it has been requested by other party, return accept and cancel actions
// If either swap exists, but has been rejected by the other party, cannot be requested again, return rejected
// If either swap exists, and you are the one who has rejected, you can request again
// If either swap exists, and it has been accepted, no actions, return accepted
