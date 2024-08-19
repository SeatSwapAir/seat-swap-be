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
