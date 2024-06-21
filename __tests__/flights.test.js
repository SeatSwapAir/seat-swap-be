const { app } = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('GET /api/flights/:user_id', () => {
  test('200: Responds with array of flight objects for a user id', () => {
    return request(app)
      .get('/api/flights/2')
      .expect(200)
      .then(({ body }) => {
        const { flights } = body;
        console.log(flights);
        const expected = {
          id: expect.any(Number),
        };
        expect(flights).toHaveLength(2);
        flights.forEach((flight) => {
          expect(flight).toMatchObject(expected);
        });
      });
  });
  xtest('400: Returns Bad request when given invalid teacher_id', () => {
    return request(app)
      .get('/api/assignments/test/1')
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;

        expect(msg).toEqual('Bad request');
      });
  });
  xtest('400: Returns Bad request when given invalid class_id', () => {
    return request(app)
      .get('/api/assignments/101/test')
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;

        expect(msg).toEqual('Bad request');
      });
  });
  xtest('404: Returns Not found when given non-existent teacher_id', () => {
    return request(app)
      .get('/api/assignments/1000000/1')
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;

        expect(msg).toEqual('Not found');
      });
  });
  xtest('404: Returns Not found when given non-existent class_id', () => {
    return request(app)
      .get('/api/assignments/101/2000')
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;

        expect(msg).toEqual('Not found');
      });
  });
});
