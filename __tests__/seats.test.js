const { app } = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('PATCH /api/seats/:seat_id', () => {
  test('200: Responds with an updated seat for the seat_id passed', () => {
    const payload = {
      current_user_id: 21,
      extraLegroom: true,
      flight_id: 8,
      id: 432,
      location: 'back',
      original_user_id: 21,
      position: 'aisle',
      previous_user_id: null,
      previous_user_name: null,
      seat_letter: 'A',
      seat_row: 20,
    };

    return request(app)
      .patch('/api/seats/432')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(payload);
      });
  });
  test('400: Responds with a bad request for a non-existent seat_id', () => {
    const payload = {
      current_user_id: 21,
      extraLegroom: true,
      flight_id: 8,
      id: 907342,
      location: 'back',
      original_user_id: 21,
      position: 'aisle',
      previous_user_id: null,
      previous_user_name: null,
      seat_letter: 'A',
      seat_row: 20,
    };
    return request(app)
      .patch('/api/seats/907342')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat id not found');
      });
  });
  test('400: Responds with a bad request for patching a seat that has been swapped', () => {
    const payload = {
      current_user_id: 21,
      extraLegroom: true,
      flight_id: 8,
      id: 453,
      location: 'back',
      original_user_id: 21,
      position: 'aisle',
      previous_user_id: null,
      previous_user_name: null,
      seat_letter: 'D',
      seat_row: 23,
    };
    return request(app)
      .patch('/api/seats/453')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat(s) 23D already swapped, cannot change');
      });
  });
});

describe('DELETE /api/seats/:seat_id', () => {
  test('204: Successfully deletes a seat for given seat_id, responds with a 204 and checks if swaps have been voided', async () => {
    const seatId = 424;

    await request(app).delete('/api/seats/424').expect(204);

    const seatResult = await db.query('SELECT * FROM seat WHERE id = $1', [
      seatId,
    ]);
    expect(seatResult.rows).toHaveLength(0);

    const swapsResult = await db.query(
      'SELECT * FROM swap WHERE requester_seat_id = $1 OR respondent_seat_id = $1',
      [seatId]
    );
    swapsResult.rows.forEach((swap) => {
      expect(swap.status).toBe('voided');
    });
  });
  test('400: Rejects deleting a seat for given seat_id if it has already been swapped', () => {
    return request(app)
      .delete('/api/seats/453')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat(s) 23D already swapped, cannot change');
      });
  });
  test('400: Responds with a bad request for a non-existent seat_id', () => {
    return request(app)
      .delete('/api/seats/907342')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat id not found');
      });
  });
});

describe('POST /api/seats', () => {
  test('200: Responds with the seat added to the journey with the flight and user in the seat object', () => {
    const payload = {
      current_user_id: 21,
      extraLegroom: true,
      flight_id: 1,
      location: 'back',
      position: 'middle',
      seat_letter: 'E',
      seat_row: 30,
    };
    const result = {
      current_user_id: 21,
      extraLegroom: true,
      flight_id: 1,
      id: 516,
      location: 'back',
      original_user_id: 21,
      position: 'middle',
      previous_user_id: null,
      seat_column: 5,
      seat_letter: 'E',
      seat_row: 30,
    };
    return request(app)
      .post('/api/seats')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(result);
      });
  });

  test('400: Responds with error if seat passed is already taken on flight_id', () => {
    const payload = {
      current_user_id: 21,
      extraLegroom: true,
      flight_id: 8,
      location: 'back',
      position: 'middle',
      seat_letter: 'E',
      seat_row: 30,
    };
    return request(app)
      .post('/api/seats')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat(s) 30E already taken by another passenger');
      });
  });
});
