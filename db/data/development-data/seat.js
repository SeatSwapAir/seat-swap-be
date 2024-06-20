module.exports = [
  // User 1: 1 seat on 2 flights
  { id: 1, user_id: 1, flight_id: 1, number: "12A", legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 2, user_id: 1, flight_id: 2, number: "12A", legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  
  // User 2: 2 seats on 2 flights
  { id: 3, user_id: 2, flight_id: 3, number: "14C", legroom: true, window_position: false, middle: false, aisle: true, front: true, center: false, back: false },
  { id: 4, user_id: 2, flight_id: 3, number: "14D", legroom: true, window_position: false, middle: false, aisle: true, front: true, center: false, back: false },
  { id: 5, user_id: 2, flight_id: 4, number: "14C", legroom: true, window_position: false, middle: false, aisle: true, front: true, center: false, back: false },
  { id: 6, user_id: 2, flight_id: 4, number: "14D", legroom: true, window_position: false, middle: false, aisle: true, front: true, center: false, back: false },
  
  // User 3: 3 seats on 2 flights
  { id: 7, user_id: 3, flight_id: 5, number: "16E", legroom: false, window_position: true, middle: false, aisle: false, front: false, center: true, back: false },
  { id: 8, user_id: 3, flight_id: 5, number: "16F", legroom: false, window_position: true, middle: false, aisle: false, front: false, center: true, back: false },
  { id: 9, user_id: 3, flight_id: 5, number: "16G", legroom: false, window_position: true, middle: false, aisle: false, front: false, center: true, back: false },
  { id: 10, user_id: 3, flight_id: 6, number: "16E", legroom: false, window_position: true, middle: false, aisle: false, front: false, center: true, back: false },
  { id: 11, user_id: 3, flight_id: 6, number: "16F", legroom: false, window_position: true, middle: false, aisle: false, front: false, center: true, back: false },
  { id: 12, user_id: 3, flight_id: 6, number: "16G", legroom: false, window_position: true, middle: false, aisle: false, front: false, center: true, back: false },
  
  // User 4: 4 seats on 2 flights
  { id: 13, user_id: 4, flight_id: 7, number: "18A", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 14, user_id: 4, flight_id: 7, number: "18B", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 15, user_id: 4, flight_id: 7, number: "18C", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 16, user_id: 4, flight_id: 7, number: "18D", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 17, user_id: 4, flight_id: 8, number: "18A", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 18, user_id: 4, flight_id: 8, number: "18B", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 19, user_id: 4, flight_id: 8, number: "18C", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 20, user_id: 4, flight_id: 8, number: "18D", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  
  // User 5: 1 seat on 2 flights
  { id: 21, user_id: 5, flight_id: 9, number: "20A", legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 22, user_id: 5, flight_id: 10, number: "20A", legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  
  // User 6: 2 seats on 2 flights
  { id: 23, user_id: 6, flight_id: 11, number: "22A", legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 24, user_id: 6, flight_id: 11, number: "22B", legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false },
  { id: 25, user_id: 6, flight_id: 12, number: "22A", legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 26, user_id: 6, flight_id: 12, number: "22B", legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false },
  
  // User 7: 3 seats on 2 flights
  { id: 27, user_id: 7, flight_id: 13, number: "24A", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 28, user_id: 7, flight_id: 13, number: "24B", legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false },
  { id: 29, user_id: 7, flight_id: 13, number: "24C", legroom: false, window_position: false, middle: false, aisle: true, front: false, center: false, back: true },
  { id: 30, user_id: 7, flight_id: 14, number: "24A", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 31, user_id: 7, flight_id: 14, number: "24B", legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false },
  { id: 32, user_id: 7, flight_id: 14, number: "24C", legroom: false, window_position: false, middle: false, aisle: true, front: false, center: false, back: true },
  
  // User 8: 4 seats on 2 flights
  { id: 33, user_id: 8, flight_id: 15, number: "26A", legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 34, user_id: 8, flight_id: 15, number: "26B", legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false },
  { id: 35, user_id: 8, flight_id: 15, number: "26C", legroom: false, window_position: false, middle: false, aisle: true, front: false, center: false, back: true },
  { id: 36, user_id: 8, flight_id: 15, number: "26D", legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false },
  { id: 37, user_id: 8, flight_id: 16, number: "26A", legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 38, user_id: 8, flight_id: 16, number: "26B", legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false },
  { id: 39, user_id: 8, flight_id: 16, number: "26C", legroom: false, window_position: false, middle: false, aisle: true, front: false, center: false, back: true },
  { id: 40, user_id: 8, flight_id: 16, number: "26D", legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false },
  
  // User 9: 1 seat on 2 flights
  { id: 41, user_id: 9, flight_id: 17, number: "28A", legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 42, user_id: 9, flight_id: 18, number: "28A", legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  
  // User 10: 2 seats on 2 flights
  { id: 43, user_id: 10, flight_id: 19, number: "30A", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 44, user_id: 10, flight_id: 19, number: "30B", legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false },
  { id: 45, user_id: 10, flight_id: 20, number: "30A", legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false },
  { id: 46, user_id: 10, flight_id: 20, number: "30B", legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false }
];