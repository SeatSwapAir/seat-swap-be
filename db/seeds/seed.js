const format = require("pg-format");
const db = require("../connection");

const seed = async ({ userData, preferencesData, flightsData, seatData, user_flightData, seat_locationData, seat_positionData }) => {
  try {
    await db.query('DROP TABLE IF EXISTS preferences CASCADE;');
    await db.query('DROP TABLE IF EXISTS user_flight CASCADE;');
    await db.query('DROP TABLE IF EXISTS flight CASCADE;');
    await db.query('DROP TABLE IF EXISTS review CASCADE;');
    await db.query('DROP TABLE IF EXISTS swap CASCADE;');
    await db.query('DROP TABLE IF EXISTS seat CASCADE;');
    await db.query('DROP TABLE IF EXISTS seat_location CASCADE;');
    await db.query('DROP TABLE IF EXISTS seat_position CASCADE;');
    await db.query('DROP TABLE IF EXISTS flight_preferences CASCADE;');
    await db.query('DROP TABLE IF EXISTS "user" CASCADE;');
    
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
        user_id INTEGER REFERENCES "user"(id),
        legroom_pref BOOLEAN,
        window_pref BOOLEAN,
        middle_pref BOOLEAN,
        aisle_pref BOOLEAN,
        front_pref BOOLEAN,
        center_pref BOOLEAN,
        back_pref BOOLEAN,
        side_by_side_pref BOOLEAN,
        neighbouring_row_pref BOOLEAN,
        same_row_pref BOOLEAN
      );
    `);
    
    await db.query(`
      CREATE TABLE flight (
        id SERIAL PRIMARY KEY,
        flightNumber VARCHAR(255),
        departureAirport VARCHAR(255),
        arrivalAirport VARCHAR(255),
        departureTime TIMESTAMP,
        arrivalTime TIMESTAMP,
        airline VARCHAR(255)
      );
    `);

    await db.query(`
      CREATE TABLE user_flight (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "user"(id),
        flight_id INTEGER REFERENCES flight(id),
        legroom_pref BOOLEAN,
        window_pref BOOLEAN,
        middle_pref BOOLEAN,
        aisle_pref BOOLEAN,
        front_pref BOOLEAN,
        center_pref BOOLEAN,
        back_pref BOOLEAN,
        side_by_side_pref BOOLEAN,
        neighbouring_row_pref BOOLEAN,
        same_row_pref BOOLEAN
      );
    `);

    await db.query(`
      CREATE TABLE seat_position (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE seat_location (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE seat (
        id SERIAL PRIMARY KEY,
        user_flight_id INTEGER,
        number VARCHAR(255),
        legroom BOOLEAN DEFAULT FALSE,
        seat_position_id INTEGER REFERENCES seat_position(id),
        seat_location_id INTEGER REFERENCES seat_location(id)
      );
    `);

    await db.query(`
      CREATE TABLE swap (
        id SERIAL PRIMARY KEY,
        seat1 INTEGER REFERENCES seat(id),
        seat2 INTEGER REFERENCES seat(id)
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
        review_happened BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const insertSeatLocationQueryStr = format(
      'INSERT INTO seat_location (name) VALUES %L RETURNING *;',
      seat_locationData.map(({ name }) => [name])
    );
    await db.query(insertSeatLocationQueryStr);

    const insertSeatPositionQueryStr = format(
      'INSERT INTO seat_position (name) VALUES %L RETURNING *;',
      seat_positionData.map(({ name }) => [name])
    );
    await db.query(insertSeatPositionQueryStr);

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
      "INSERT INTO preferences (user_id, legroom_pref, window_pref, middle_pref, aisle_pref, front_pref, center_pref, back_pref, side_by_side_pref, neighbouring_row_pref, same_row_pref) VALUES %L RETURNING *;",
      preferencesData.map(
        ({ user_id, legroom_pref, window_pref, middle_pref, aisle_pref, front_pref, center_pref, back_pref, side_by_side_pref, neighbouring_row_pref, same_row_pref }) => [
          user_id,
          legroom_pref,
          window_pref,
          middle_pref,
          aisle_pref,
          front_pref,
          center_pref,
          back_pref,
          side_by_side_pref,
          neighbouring_row_pref,
          same_row_pref,
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
      "INSERT INTO seat (user_flight_id, number, legroom, seat_location_id, seat_position_id) VALUES %L RETURNING *;",
      seatData.map(
        ({ user_flight_id, number, legroom, seat_location_id, seat_position_id }) => [
          user_flight_id,
          number,
          legroom,
          seat_location_id,
          seat_position_id,
        ]
      )
    );
    await db.query(insertSeatQueryStr);

    const insertUserFlightQueryStr = format(
      "INSERT INTO user_flight (user_id, flight_id, legroom_pref, window_pref, middle_pref, aisle_pref, front_pref, center_pref, back_pref, side_by_side_pref, neighbouring_row_pref, same_row_pref) VALUES %L RETURNING *;",
      user_flightData.map(
        ({ user_id, flight_id, legroom_pref, window_pref, middle_pref, aisle_pref, front_pref, center_pref, back_pref, side_by_side_pref, neighbouring_row_pref, same_row_pref }) => [
          user_id,
          flight_id,
          legroom_pref,
          window_pref,
          middle_pref,
          aisle_pref,
          front_pref,
          center_pref,
          back_pref,
          side_by_side_pref,
          neighbouring_row_pref,
          same_row_pref,
        ]
      )
    );
    await db.query(insertUserFlightQueryStr);
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

module.exports = seed;
