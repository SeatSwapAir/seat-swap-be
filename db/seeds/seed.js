const format = require("pg-format");
const db = require("../connection");

const seed = async ({
  userData,
  preferencesData,
  flightsData,
  seatData,
  flightPreferencesData,
}) => {
  try {
    await db.query("DROP TABLE IF EXISTS review;");
    await db.query("DROP TABLE IF EXISTS swap;");
    await db.query("DROP TABLE IF EXISTS seat;");
    await db.query("DROP TABLE IF EXISTS flight;");
    await db.query("DROP TABLE IF EXISTS flight_preferences;");
    await db.query("DROP TABLE IF EXISTS preferences;");
    await db.query('DROP TABLE IF EXISTS "user";');

    await db.query(`
  CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    phone VARCHAR(255),
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

await db.query(`
  CREATE TABLE preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    legroom BOOLEAN,
    window_position BOOLEAN,
    middle BOOLEAN,
    aisle BOOLEAN,
    front BOOLEAN,
    center BOOLEAN,
    back BOOLEAN,
    side_by_side BOOLEAN,
    neighbouring_row BOOLEAN,
    same_row BOOLEAN
  );
`);

await db.query(`
  CREATE TABLE flight_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    flight_id INTEGER,
    legroom BOOLEAN,
    window_position BOOLEAN,
    middle BOOLEAN,
    aisle BOOLEAN,
    front BOOLEAN,
    center BOOLEAN,
    back BOOLEAN,
    side_by_side BOOLEAN,
    neighbouring_row BOOLEAN,
    same_row BOOLEAN
  );
`);

await db.query(`
  CREATE TABLE flight (
    id SERIAL PRIMARY KEY,
    flightNumber VARCHAR(255),
    departureAirport VARCHAR(255),
    arrivalAirport VARCHAR(255),
    departureTime DATE,
    arrivalTime DATE,
    airline VARCHAR(255)
  );
`);

await db.query(`
  CREATE TABLE seat (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    flight_id INTEGER,
    number VARCHAR(255),
    legroom BOOLEAN,
    window_position BOOLEAN,
    middle BOOLEAN,
    aisle BOOLEAN,
    front BOOLEAN,
    center BOOLEAN,
    back BOOLEAN
  );
`);

await db.query(`
  CREATE TABLE swap (
    id SERIAL PRIMARY KEY,
    seat1 INTEGER,
    seat2 INTEGER
  );
`);

await db.query(`
  CREATE TABLE review (
    id SERIAL PRIMARY KEY,
    rating INTEGER,
    comment TEXT,
    reviewer_id INTEGER,
    reviewed_id INTEGER,
    swap_id INTEGER,
    review_happened BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

const test = userData.map(
  ({ email, firstname, lastname, phone, password, created_at }) => [
    email,
    firstname,
    lastname,
    phone,
    password,
    created_at,
  ]
)
const insertUserQueryStr = format(
  'INSERT INTO "user" (email, firstname, lastname, phone, password, created_at) VALUES %L RETURNING *;',
  userData.map(
    ({ email, firstname, lastname, phone, password, created_at }) => [
      email,
      firstname,
      lastname,
      phone,
      password,
      created_at,
    ]
  )
);
await db.query(insertUserQueryStr);

const insertPreferencesQueryStr = format(
  "INSERT INTO preferences (user_id, legroom, window_position, middle, aisle, front, center, back, side_by_side, neighbouring_row, same_row) VALUES %L RETURNING *;",
  preferencesData.map(
    ({ user_id, legroom, window_position, middle, aisle, front, center, back, side_by_side, neighbouring_row, same_row }) => [
      user_id,
      legroom,
      window_position,
      middle,
      aisle,
      front,
      center,
      back,
      side_by_side,
      neighbouring_row,
      same_row,
    ]
  )
);
await db.query(insertPreferencesQueryStr);

const insertFlightQueryStr = format(
  "INSERT INTO flight (flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, airline) VALUES %L RETURNING *;",
  flightsData.map(
    ({ flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, airline }) => [
      flightNumber,
      departureAirport,
      arrivalAirport,
      departureTime,
      arrivalTime,
      airline,
    ]
  )
);
await db.query(insertFlightQueryStr);

const insertSeatQueryStr = format(
  "INSERT INTO seat (user_id, flight_id, number, legroom, window_position, middle, aisle, front, center, back) VALUES %L RETURNING *;",
  seatData.map(
    ({ user_id, flight_id, number, legroom, window_position, middle, aisle, front, center, back }) => [
      user_id,
      flight_id,
      number,
      legroom,
      window_position,
      middle,
      aisle,
      front,
      center,
      back,
    ]
  )
);
await db.query(insertSeatQueryStr);


const insertFlightPreferencesQueryStr = format(
  "INSERT INTO flight_preferences (user_id, flight_id, legroom, window_position, middle, aisle, front, center, back, side_by_side, neighbouring_row, same_row) VALUES %L RETURNING *;",
  flightPreferencesData.map(
    ({ user_id, flight_id, legroom, window_position, middle, aisle, front, center, back, side_by_side, neighbouring_row, same_row }) => [
      user_id,
      flight_id,
      legroom,
      window_position,
      middle,
      aisle,
      front,
      center,
      back,
      side_by_side,
      neighbouring_row,
      same_row,
    ]
  )
);
await db.query(insertFlightPreferencesQueryStr);

  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

module.exports = seed;
