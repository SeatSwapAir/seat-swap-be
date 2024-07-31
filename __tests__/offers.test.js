const { app } = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('GET /api/user/:user_id/flight/:flight_id/offers', () => {
  test('200: Responds with object containing offers for a user id and flight id', () => {
    const result = {
      offers: [
        {
          current_seats: {
            id: 405,
            seat_row: 15,
            seat_letter: "D",
            extraLegroom: false,
            position: "aisle",
            location: "center"
          },
          offer_seats: [
            {
              id: 404,
              seat_row: 15,
              seat_letter: "C",
              extraLegroom: false,
              position: "aisle",
              location: "center"
            },
            {
              id: 442,
              seat_row: 21,
              seat_letter: "E",
              extraLegroom: false,
              position: "middle",
              location: "center"
            },
            {
              id: 447,
              seat_row: 22,
              seat_letter: "D",
              extraLegroom: false,
              position: "aisle",
              location: "center"
            }
          ]
        },
        {
          current_seats: {
            id: 432,
            seat_row: 20,
            seat_letter: "A",
            extraLegroom: false,
            position: "window",
            location: "center"
          },
          offer_seats: [
            {
              id: 449,
              seat_row: 22,
              seat_letter: "F",
              extraLegroom: false,
              position: "window",
              location: "center"
            },
            {
              id: 451,
              seat_row: 23,
              seat_letter: "B",
              extraLegroom: false,
              position: "middle",
              location: "back"
            },
            {
              id: 459,
              seat_row: 24,
              seat_letter: "D",
              extraLegroom: false,
              position: "aisle",
              location: "back"
            }
          ]
        }
      ],
      requested: [
        {
          current_seats: {
            id: 405,
            seat_row: 15,
            seat_letter: "D",
            extraLegroom: false,
            position: "aisle",
            location: "center"
          },
          offer_seats: [
            {
              id: 465,
              seat_row: 25,
              seat_letter: "D",
              extraLegroom: false,
              position: "aisle",
              location: "back"
            },
            {
              id: 469,
              seat_row: 26,
              seat_letter: "B",
              extraLegroom: false,
              position: "middle",
              location: "back"
            }
          ]
        },
        {
          current_seats: {
            id: 432,
            seat_row: 20,
            seat_letter: "A",
            extraLegroom: false,
            position: "window",
            location: "center"
          },
          offer_seats: [
            {
              id: 433,
              seat_row: 20,
              seat_letter: "B",
              extraLegroom: false,
              position: "middle",
              location: "center"
            },
            {
              id: 457,
              seat_row: 24,
              seat_letter: "B",
              extraLegroom: false,
              position: "middle",
              location: "back"
            },
            {
              id: 462,
              seat_row: 25,
              seat_letter: "A",
              extraLegroom: false,
              position: "window",
              location: "back"
            },
            {
              id: 467,
              seat_row: 25,
              seat_letter: "F",
              extraLegroom: false,
              position: "window",
              location: "back"
            }
          ]
        }
      ],
      voided: [
        {
          current_seats: {
            id: 405,
            seat_row: 15,
            seat_letter: "D",
            extraLegroom: false,
            position: "aisle",
            location: "center"
          },
          offer_seats: [
            {
              id: 312,
              seat_row: 15,
              seat_letter: "A",
              extraLegroom: true,
              position: "middle",
              location: "front"
            },
            {
              id: 86,
              seat_row: 7,
              seat_letter: "D",
              extraLegroom: true,
              position: "window",
              location: "front"
            },
            {
              id: 124,
              seat_row: 23,
              seat_letter: "C",
              extraLegroom: true,
              position: "window",
              location: "front"
            }
          ]
        },
        {
          current_seats: {
            id: 432,
            seat_row: 20,
            seat_letter: "A",
            extraLegroom: false,
            position: "window",
            location: "center"
          },
          offer_seats: [
            {
              id: 155,
              seat_row: 28,
              seat_letter: "E",
              extraLegroom: true,
              position: "middle",
              location: "front"
            },
            {
              id: 76,
              seat_row: 20,
              seat_letter: "C",
              extraLegroom: true,
              position: "middle",
              location: "center"
            },
            {
              id: 126,
              seat_row: 11,
              seat_letter: "F",
              extraLegroom: true,
              position: "middle",
              location: "center"
            }
          ]
        }
      ],
    };
    return request(app)
      .get('/api/user/21/flight/8/offers')
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject(result);
      });
  });
  test('404: Responds with an error message for a non-existent user id', () => {
    return request(app)
      .get('/api/user/3645634/flight/2/offers')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User not found');
      });
  });

  test('404: Responds with an error message for a non-existent flight id', () => {
    return request(app)
      .get('/api/user/2/flight/3456435/offers')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Flight not found');
      });
  });

  test('400: Responds with a bad request error for an invalid user id', () => {
    return request(app)
      .get('/api/user/invalid-id/flight/2/offers')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
  test('400: Responds with a bad request error for an invalid flight_id', () => {
    return request(app)
      .get('/api/user/2/flight/invalid-id/offers')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});