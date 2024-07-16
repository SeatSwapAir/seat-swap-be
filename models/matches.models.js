const db = require('../db/connection.js');
const pgformat = require('pg-format');
const dayjs = require('dayjs');

const selectSideBySideMatches = async (user_id, flight_id) => {
  try {
    const usersSeats = await db.query(
      `SELECT * FROM seat WHERE flight_id = $1 AND user_id = $2;`,
      [flight_id, user_id]
    );

    const neighbouringSeats = usersSeats.rows.map((seat) => {
      return {
        seat_row: seat.seat_row,
        seat_column: seat.seat_column + 1,
      };
    }).concat(usersSeats.rows.map((seat) => {
      return {
        seat_row: seat.seat_row,
        seat_column: seat.seat_column - 1,
      };
    }));


    const sqlNeighbouringSeats = pgformat(
      'SELECT * FROM seat WHERE flight_id = %s AND seat_row IN (%L) AND seat_column IN (%L);',
      flight_id,
      neighbouringSeats.map((seat) => seat.seat_row),
      neighbouringSeats.map((seat) => seat.seat_column)
    );

    console.log("🚀 ~ neighbouringSeats ~ neighbouringSeats:", sqlNeighbouringSeats)



    // const sqlRightNeighbor = pgformat(
    // console.log("🚀 ~ selectSideBySideMatches ~ sqlNeighbouringSeats:", sqlNeighbouringSeats)
    // console.log("🚀 ~ selectSideBySideMatches ~ sqlNeighbouringSeats:", sqlNeighbouringSeats)
    // //   'SELECT * FROM seat WHERE flight_id = %s AND seat_row = %s AND seat_column IN (%L);',
    //   flight_id,
    //   usersSeatsCoordinates[0].seat_row,
    //   usersSeatsCoordinates.map((seat) => seat.seat_column + 1)
    // );
    // const sqlLeftNeighbor = pgformat(
    //   'SELECT * FROM seat WHERE flight_id = %s AND seat_row = %s AND seat_column IN (%L);',
    //   flight_id,
    //   usersSeatsCoordinates[0].seat_row,
    //   usersSeatsCoordinates.map((seat) => seat.seat_column - 1)
    // );

    // const rightNeighbour = await db.query(sqlRightNeighbor);
    // const leftNeighbour = await db.query(sqlLeftNeighbor);

    // const neighbouringSeats = leftNeighbour.rows.concat(rightNeighbour.rows);
    // console.log("🚀 ~ selectSideBySideMatches ~ neighbouringSeats:", neighbouringSeats)


    
  } catch (err) {
    throw err;
  }
};

module.exports = {
  selectSideBySideMatches,
};
