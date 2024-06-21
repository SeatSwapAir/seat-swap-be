const db = require("../db/connection.js");

const selectFlightsByUser = async (user_id) => {
  const result = await db.query(
    "SELECT * FROM flight WHERE user_id = $1",
    [user_id]
  );
  if (result.rows.length === 0) {
    return Promise.reject({
      status: 404,
      msg: "Not found",
    });
  }
  return result.rows[0];
};

module.exports = {
  selectFlightsByUser
};