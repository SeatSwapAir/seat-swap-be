const db = require('../db/connection.js');
const { doesUserExist, doesFlightExist } = require('../helpers/errorChecks.js');
const {
  getPositionName,
  getLocationName,
} = require('../helpers/seatsArrayTranformer.js');

const { seatSwapChecker } = require('../models/users.models.js');

async function seatsAfterSwaps(user_id, flight_id) {
  try {
    await doesUserExist(user_id);
    await doesFlightExist(flight_id);
    const usersSeats = await db.query(
      `SELECT * FROM seat WHERE flight_id = $1 AND user_id = $2;`,
      [flight_id, user_id]
    );

    const usersSeatsAfterSwaps = await Promise.all(
      usersSeats.rows.map(async (seat) => {
        const isSwapped = await seatSwapChecker(seat.id);
        if (isSwapped) {
          return {
            id: isSwapped.id,
            flight_id: flight_id,
            user_id: user_id,
            seat_row: isSwapped.seat_row,
            seat_letter: isSwapped.seat_letter,
            seat_column: isSwapped.seat_column,
            legroom: isSwapped.legroom,
            seat_position_id: isSwapped.seat_position_id,
            seat_location_id: isSwapped.seat_location_id,
          };
        } else {
          return {
            id: seat.id,
            flight_id: flight_id,
            user_id: user_id,
            seat_row: seat.seat_row,
            seat_letter: seat.seat_letter,
            seat_column: seat.seat_column,
            legroom: seat.legroom,
            seat_position_id: seat.seat_position_id,
            seat_location_id: seat.seat_location_id,
          };
        }
      })
    );

    return usersSeatsAfterSwaps;
  } catch (err) {
    throw err;
  }
}
module.exports = { seatsAfterSwaps };
