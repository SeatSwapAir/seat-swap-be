const { app } = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('GET /api/matches/side_by_side/user/:user_id/flight/:flight_id', () => {
  test('200: Responds with an array of side_by_side matches for a user id and flight id', () => {
    const result = {
      side_by_side_matches: [
        {
          current_seats: {
            id: 424,
            seat_row: 18,
            seat_letter: 'E',
            extraLegroom: false,
            position: 'middle',
            location: 'center',
          },
          offer_seats: [
            {
              id: 423,
              seat_row: 18,
              seat_letter: 'D',
              extraLegroom: false,
              position: 'aisle',
              location: 'center',
            },
            {
              id: 425,
              seat_row: 18,
              seat_letter: 'F',
              extraLegroom: false,
              position: 'window',
              location: 'center',
            },
          ],
        },
        {
          current_seats: {
            id: 483,
            seat_row: 28,
            seat_letter: 'D',
            extraLegroom: false,
            position: 'aisle',
            location: 'back',
          },

          offer_seats: [
            {
              id: 482,
              seat_row: 28,
              seat_letter: 'C',
              extraLegroom: false,
              position: 'aisle',
              location: 'back',
            },

            {
              id: 484,
              seat_row: 28,
              seat_letter: 'E',
              extraLegroom: false,
              position: 'middle',
              location: 'back',
            },
          ],
        },
      ],
    };
    return request(app)
      .get('/api/matches/side_by_side/user/2/flight/8')
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject(result);
      });
  });
  test('404: Responds with an error message for a non-existent user id', () => {
    return request(app)
      .get('/api/matches/side_by_side/user/3645634/flight/2')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User not found');
      });
  });

  test('404: Responds with an error message for a non-existent flight id', () => {
    return request(app)
      .get('/api/matches/side_by_side/user/2/flight/3456435')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Flight not found');
      });
  });

  test('400: Responds with a bad request error for an invalid user id', () => {
    return request(app)
      .get('/api/matches/side_by_side/user/invalid-id/flight/2')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
  test('400: Responds with a bad request error for an invalid flight_id', () => {
    return request(app)
      .get('/api/matches/side_by_side/user/2/flight/invalid-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});

describe('GET /api/matches/same_row/user/:user_id/flight/:flight_id', () => {
  test('200: Responds with an array of side_by_side matches for a user id and flight id', () => {
    const result = {
      same_row_matches: [
        {
          current_seats: {
            id: 424,
            seat_row: 18,
            seat_letter: 'E',
            extraLegroom: false,
            position: 'middle',
            location: 'center',
          },
          offer_seats: [
            {
              id: 420,
              seat_row: 18,
              seat_letter: 'A',
              extraLegroom: false,
              position: 'window',
              location: 'center',
            },
            {
              id: 421,
              seat_row: 18,
              seat_letter: 'B',
              extraLegroom: false,
              position: 'middle',
              location: 'center',
            },
            {
              id: 422,
              seat_row: 18,
              seat_letter: 'C',
              extraLegroom: false,
              position: 'aisle',
              location: 'center',
            },
            {
              id: 423,
              seat_row: 18,
              seat_letter: 'D',
              extraLegroom: false,
              position: 'aisle',
              location: 'center',
            },
            {
              id: 425,
              seat_row: 18,
              seat_letter: 'F',
              extraLegroom: false,
              position: 'window',
              location: 'center',
            },
          ],
        },
        {
          current_seats: {
            id: 483,
            seat_row: 28,
            seat_letter: 'D',
            extraLegroom: false,
            position: 'aisle',
            location: 'back',
          },

          offer_seats: [
            {
              id: 480,
              seat_row: 28,
              seat_letter: 'A',
              extraLegroom: false,
              position: 'window',
              location: 'back',
            },
            {
              id: 481,
              seat_row: 28,
              seat_letter: 'B',
              extraLegroom: false,
              position: 'middle',
              location: 'back',
            },
            {
              id: 482,
              seat_row: 28,
              seat_letter: 'C',
              extraLegroom: false,
              position: 'aisle',
              location: 'back',
            },
            {
              id: 484,
              seat_row: 28,
              seat_letter: 'E',
              extraLegroom: false,
              position: 'middle',
              location: 'back',
            },
            {
              id: 485,
              seat_row: 28,
              seat_letter: 'F',
              extraLegroom: false,
              position: 'window',
              location: 'back',
            },
          ],
        },
      ],
    };
    return request(app)
      .get('/api/matches/same_row/user/2/flight/8')
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject(result);
      });
  });
  test('404: Responds with an error message for a non-existent user id', () => {
    return request(app)
      .get('/api/matches/side_by_side/user/3645634/flight/2')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User not found');
      });
  });

  test('404: Responds with an error message for a non-existent flight id', () => {
    return request(app)
      .get('/api/matches/side_by_side/user/2/flight/3456435')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Flight not found');
      });
  });

  test('400: Responds with a bad request error for an invalid user id', () => {
    return request(app)
      .get('/api/matches/side_by_side/user/invalid-id/flight/2')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
  test('400: Responds with a bad request error for an invalid flight_id', () => {
    return request(app)
      .get('/api/matches/side_by_side/user/2/flight/invalid-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});

describe('GET /api/matches/neighbouring_rows/user/:user_id/flight/:flight_id', () => {
  test('200: Responds with an array of neighbouring_rows matches for a user id and flight id', () => {
    const result = {
      neighbouring_rows_matches: [
        {
          current_seats: {
            id: 424,
            seat_row: 18,
            seat_letter: 'E',
            extraLegroom: false,
            position: 'middle',
            location: 'center',
          },
          offer_seats: [
            {
              id: 414,
              seat_row: 17,
              seat_letter: 'A',
              extraLegroom: true,
              position: 'window',
              location: 'center',
            },
            {
              id: 415,
              seat_row: 17,
              seat_letter: 'B',
              extraLegroom: true,
              position: 'middle',
              location: 'center',
            },
            {
              id: 416,
              seat_row: 17,
              seat_letter: 'C',
              extraLegroom: true,
              position: 'aisle',
              location: 'center',
            },
            {
              id: 417,
              seat_row: 17,
              seat_letter: 'D',
              extraLegroom: true,
              position: 'aisle',
              location: 'center',
            },
            {
              id: 418,
              seat_row: 17,
              seat_letter: 'E',
              extraLegroom: true,
              position: 'middle',
              location: 'center',
            },
            {
              id: 419,
              seat_row: 17,
              seat_letter: 'F',
              extraLegroom: true,
              position: 'window',
              location: 'center',
            },
            {
              id: 426,
              seat_row: 19,
              seat_letter: 'A',
              extraLegroom: false,
              position: 'window',
              location: 'center',
            },
            {
              id: 427,
              seat_row: 19,
              seat_letter: 'B',
              extraLegroom: false,
              position: 'middle',
              location: 'center',
            },
            {
              id: 428,
              seat_row: 19,
              seat_letter: 'C',
              extraLegroom: false,
              position: 'aisle',
              location: 'center',
            },
            {
              id: 429,
              seat_row: 19,
              seat_letter: 'D',
              extraLegroom: false,
              position: 'aisle',
              location: 'center',
            },
            {
              id: 430,
              seat_row: 19,
              seat_letter: 'E',
              extraLegroom: false,
              position: 'middle',
              location: 'center',
            },
            {
              id: 431,
              seat_row: 19,
              seat_letter: 'F',
              extraLegroom: false,
              position: 'window',
              location: 'center',
            },
          ],
        },
        {
          current_seats: {
            id: 483,
            seat_row: 28,
            seat_letter: 'D',
            extraLegroom: false,
            position: 'aisle',
            location: 'back',
          },

          offer_seats: [
            {
              id: 474,
              seat_row: 27,
              seat_letter: 'A',
              extraLegroom: false,
              position: 'window',
              location: 'back',
            },
            {
              id: 475,
              seat_row: 27,
              seat_letter: 'B',
              extraLegroom: false,
              position: 'middle',
              location: 'back',
            },
            {
              id: 476,
              seat_row: 27,
              seat_letter: 'C',
              extraLegroom: false,
              position: 'aisle',
              location: 'back',
            },
            {
              id: 477,
              seat_row: 27,
              seat_letter: 'D',
              extraLegroom: false,
              position: 'aisle',
              location: 'back',
            },
            {
              id: 478,
              seat_row: 27,
              seat_letter: 'E',
              extraLegroom: false,
              position: 'middle',
              location: 'back',
            },
            {
              id: 479,
              seat_row: 27,
              seat_letter: 'F',
              extraLegroom: false,
              position: 'window',
              location: 'back',
            },
            {
              id: 486,
              seat_row: 29,
              seat_letter: 'A',
              extraLegroom: false,
              position: 'window',
              location: 'back',
            },
            {
              id: 487,
              seat_row: 29,
              seat_letter: 'B',
              extraLegroom: false,
              position: 'middle',
              location: 'back',
            },
            {
              id: 488,
              seat_row: 29,
              seat_letter: 'C',
              extraLegroom: false,
              position: 'aisle',
              location: 'back',
            },
            {
              id: 489,
              seat_row: 29,
              seat_letter: 'D',
              extraLegroom: false,
              position: 'aisle',
              location: 'back',
            },
            {
              id: 490,
              seat_row: 29,
              seat_letter: 'E',
              extraLegroom: false,
              position: 'middle',
              location: 'back',
            },
            {
              id: 491,
              seat_row: 29,
              seat_letter: 'F',
              extraLegroom: false,
              position: 'window',
              location: 'back',
            },
          ],
        },
      ],
    };
    return request(app)
      .get('/api/matches/neighbouring_rows/user/2/flight/8')
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject(result);
      });
  });
  test('404: Responds with an error message for a non-existent user id', () => {
    return request(app)
      .get('/api/matches/neighbouring_rows/user/3645634/flight/2')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User not found');
      });
  });

  test('404: Responds with an error message for a non-existent flight id', () => {
    return request(app)
      .get('/api/matches/neighbouring_rows/user/2/flight/3456435')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Flight not found');
      });
  });

  test('400: Responds with a bad request error for an invalid user id', () => {
    return request(app)
      .get('/api/matches/neighbouring_rows/user/invalid-id/flight/2')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
  test('400: Responds with a bad request error for an invalid flight_id', () => {
    return request(app)
      .get('/api/matches/neighbouring_rows/user/2/flight/invalid-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});
