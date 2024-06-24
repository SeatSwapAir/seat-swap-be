const format = require("pg-format");
const db = require("../connection");

const seed = async ({ userData, preferencesData, flightsData, seatData, flightPreferencesData, locationData, positionData }) => {
  try {
    await db.query("DROP TABLE IF EXISTS review;");
    await db.query("DROP TABLE IF EXISTS swap;");
    await db.query("DROP TABLE IF EXISTS seat;");
    await db.query("DROP TABLE IF EXISTS flight;");
    await db.query("DROP TABLE IF EXISTS flight_preferences;");
    await db.query("DROP TABLE IF EXISTS preferences;");
    await db.query('DROP TABLE IF EXISTS "user";');
    await db.query("DROP TABLE IF EXISTS location;");
    await db.query("DROP TABLE IF EXISTS position;");

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
      CREATE TABLE location (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE position (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        legroom BOOLEAN DEFAULT FALSE,
        location_id INTEGER REFERENCES location(id),
        position_id INTEGER REFERENCES position(id),
        side_by_side BOOLEAN DEFAULT FALSE,
        neighbouring_row BOOLEAN DEFAULT FALSE,
        same_row BOOLEAN DEFAULT FALSE
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
      CREATE TABLE seat (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        flight_id INTEGER,
        number VARCHAR(255),
        legroom BOOLEAN DEFAULT FALSE,
        location_id INTEGER REFERENCES location(id),
        position_id INTEGER REFERENCES position(id)
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
        review_happened BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);


    await db.query(`
      CREATE TABLE flight_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        flight_id INTEGER,
        legroom BOOLEAN DEFAULT FALSE,
        location_id INTEGER REFERENCES location(id),
        position_id INTEGER REFERENCES position(id),
        side_by_side BOOLEAN DEFAULT FALSE,
        neighbouring_row BOOLEAN DEFAULT FALSE,
        same_row BOOLEAN DEFAULT FALSE
      );
    `);

    const insertLocationQueryStr = format(
      'INSERT INTO location (name) VALUES %L RETURNING *;',
      locationData.map(({ name }) => [name])
    );
    await db.query(insertLocationQueryStr);

    const insertPositionQueryStr = format(
      'INSERT INTO position (name) VALUES %L RETURNING *;',
      positionData.map(({ name }) => [name])
    );
    await db.query(insertPositionQueryStr);

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
      "INSERT INTO preferences (user_id, legroom, location_id, position_id, side_by_side, neighbouring_row, same_row) VALUES %L RETURNING *;",
      preferencesData.map(
        ({ user_id, legroom, location_id, position_id, side_by_side, neighbouring_row, same_row }) => [
          user_id,
          legroom,
          location_id,
          position_id,
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
      "INSERT INTO seat (user_id, flight_id, number, legroom, location_id, position_id) VALUES %L RETURNING *;",
      seatData.map(
        ({ user_id, flight_id, number, legroom, location_id, position_id }) => [
          user_id,
          flight_id,
          number,
          legroom,
          location_id,
          position_id,
        ]
      )
    );
    await db.query(insertSeatQueryStr);

    const insertFlightPreferencesQueryStr = format(
      "INSERT INTO flight_preferences (user_id, flight_id, legroom, location_id, position_id, side_by_side, neighbouring_row, same_row) VALUES %L RETURNING *;",
      flightPreferencesData.map(
        ({ user_id, flight_id, legroom, location_id, position_id, side_by_side, neighbouring_row, same_row }) => [
          user_id,
          flight_id,
          legroom,
          location_id,
          position_id,
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
