const db = require('../db/connection.js');
const dayjs = require('dayjs');
const pgformat = require('pg-format');
const {
  doesUserExist,
  doesFlightExist,
  isSeatDuplicate,
  isSeatTaken,
  seatsInsertedFormatted,
} = require('../helpers/errorChecks');

const selectOffers = async (user_id, flight_id) => {
  // console.log("🚀 ~ selectOffers ~ user_id:", user_id)
  try {
    await doesUserExist(user_id);
    await doesFlightExist(flight_id);

    const usersSeats = await db.query(
      `SELECT id FROM seat WHERE flight_id = $1 AND current_user_id = $2;`,
      [flight_id, user_id]
    );

    if (usersSeats.rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: 'No seats found for user',
      });
    }

    const usersSeatsIds = usersSeats.rows.map((seat) => seat.id);
    const usersOffersSql = pgformat(
      `SELECT * FROM swap WHERE (requester_id = %s OR respondent_id = %s) AND (requester_seat_id IN %L OR respondent_seat_id IN %L) AND status != 'accepted' AND status != 'cancelled';`,
      user_id,
      user_id,
      [usersSeatsIds],
      [usersSeatsIds]
    );
    const usersOffers = await db.query(usersOffersSql);

    // const x = usersSeatsIds.map((seat_id) => {
    //   const offers = usersOffers.rows.filter((offer) => offer.requester_seat_id === seat_id || offer.respondent_seat_id === seat_id)
    //   return offers
    // })
    // console.log("🚀 ~ x ~ x:", x)

    const offeredSwaps = usersOffers.rows.filter((offer) => {
      return offer.respondent_id === +user_id;
    });

    const requestedSwaps = usersOffers.rows.filter((offer) => {
      return offer.requester_id === +user_id && offer.status === 'requested';
    });

    const voidedSwaps = usersOffers.rows.filter((offer) => {
      return offer.requester_id === +user_id && offer.status === 'voided';
    });

    // const seat = await db.query(
    //   `SELECT * FROM seat WHERE id = $1;`,
    //   [seat_id]
    // );
const seatSql = 
  `SELECT 
    seat.id, 
    seat_row, 
    seat_letter, 
    legroom AS "extraLegroom", 
    position_name AS position, 
    location_name AS location 
  FROM seat 
  INNER JOIN seat_position ON seat.seat_position_id = seat_position.id 
  INNER JOIN seat_location ON seat.seat_location_id = seat_location.id
  WHERE seat.id = $1;`

    const offeredSeats = usersSeatsIds.map(async(seat_id) => {
      const {rows} = await db.query(seatSql,[seat_id]);  
      const current_seats = rows[0];
      const offer_seats = offeredSwaps.filter(
        (offer) => offer.respondent_seat_id === seat_id
      ).map(offer => offer.requester_seat_id).map(async (seat_id) => {
        const {rows} = await db.query(seatSql,[seat_id]);  
        return rows[0];
      }) 
      return {
        current_seats,
        offer_seats: await Promise.all(offer_seats)
      };
    });
    const requestedSeats = usersSeatsIds.map(async(seat_id) => {
      const {rows} = await db.query(seatSql,[seat_id]);  
      const current_seats = rows[0];
      const offer_seats = requestedSwaps.filter(
        (offer) => offer.requester_seat_id === seat_id 
      ).map(offer => offer.respondent_seat_id).map(async (seat_id) => {
        const {rows} = await db.query(seatSql,[seat_id]);  
        return rows[0];
      }) 
      return {
        current_seats,
        offer_seats: await Promise.all(offer_seats)
      };
    });
    const voidedSeats = usersSeatsIds.map(async(seat_id) => {
      const {rows} = await db.query(seatSql,[seat_id]);  
      const current_seats = rows[0];
      const offer_seats = voidedSwaps.filter(
        (offer) => offer.requester_seat_id === seat_id 
      ).map(offer => offer.respondent_seat_id).map(async (seat_id) => {
        const {rows} = await db.query(seatSql,[seat_id]);  
        return rows[0];
      }) 
      return {
        current_seats,
        offer_seats: await Promise.all(offer_seats)
      };
    });



    const result = { 
      offers: await Promise.all(offeredSeats),
      requested: await Promise.all(requestedSeats),
      voided: await Promise.all(voidedSeats)
    };
    return result;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  selectOffers,
};

// swaps where user is responses and status is requestded
// swaps where user is reuqestor and status is requested //so you can cancel
//swaps where user is requester and status is voided // so you can request it again
