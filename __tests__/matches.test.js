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
          current_seats: 
            {
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
});
