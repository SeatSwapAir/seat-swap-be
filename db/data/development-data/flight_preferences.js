module.exports = [
  // User 1: 1 seat on 2 flights
  { id: 1, user_id: 1, flight_id: 1, legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false, side_by_side: true, neighbouring_row: false, same_row: true },
  { id: 2, user_id: 1, flight_id: 2, legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false, side_by_side: true, neighbouring_row: false, same_row: true },
  
  // User 2: 2 seats on 2 flights
  { id: 3, user_id: 2, flight_id: 3, legroom: true, window_position: false, middle: false, aisle: true, front: true, center: false, back: false, side_by_side: true, neighbouring_row: true, same_row: true },
  { id: 4, user_id: 2, flight_id: 4, legroom: true, window_position: false, middle: false, aisle: true, front: true, center: false, back: false, side_by_side: true, neighbouring_row: true, same_row: true },
  
  // User 3: 3 seats on 2 flights
  { id: 5, user_id: 3, flight_id: 5, legroom: false, window_position: true, middle: false, aisle: false, front: false, center: true, back: false, side_by_side: true, neighbouring_row: true, same_row: false },
  { id: 6, user_id: 3, flight_id: 6, legroom: false, window_position: true, middle: false, aisle: false, front: false, center: true, back: false, side_by_side: true, neighbouring_row: true, same_row: false },
  
  // User 4: 4 seats on 2 flights
  { id: 7, user_id: 4, flight_id: 7, legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false, side_by_side: true, neighbouring_row: false, same_row: true },
  { id: 8, user_id: 4, flight_id: 8, legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false, side_by_side: true, neighbouring_row: false, same_row: true },
  
  // User 5: 1 seat on 2 flights
  { id: 9, user_id: 5, flight_id: 9, legroom: true, window_position: false, middle: false, aisle: true, front: false, center: true, back: false, side_by_side: true, neighbouring_row: false, same_row: true },
  { id: 10, user_id: 5, flight_id: 10, legroom: true, window_position: false, middle: false, aisle: true, front: false, center: true, back: false, side_by_side: true, neighbouring_row: false, same_row: true },
  
  // User 6: 2 seats on 2 flights
  { id: 11, user_id: 6, flight_id: 11, legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false, side_by_side: true, neighbouring_row: true, same_row: false },
  { id: 12, user_id: 6, flight_id: 12, legroom: false, window_position: true, middle: false, aisle: false, front: true, center: false, back: false, side_by_side: true, neighbouring_row: true, same_row: false },
  
  // User 7: 3 seats on 2 flights
  { id: 13, user_id: 7, flight_id: 13, legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false, side_by_side: true, neighbouring_row: false, same_row: true },
  { id: 14, user_id: 7, flight_id: 14, legroom: true, window_position: false, middle: true, aisle: false, front: false, center: true, back: false, side_by_side: true, neighbouring_row: false, same_row: true },
  
  // User 8: 4 seats on 2 flights
  { id: 15, user_id: 8, flight_id: 15, legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false, side_by_side: true, neighbouring_row: true, same_row: true },
  { id: 16, user_id: 8, flight_id: 16, legroom: true, window_position: true, middle: false, aisle: false, front: true, center: false, back: false, side_by_side: true, neighbouring_row: true, same_row: true },
  
  // User 9: 1 seat on 2 flights
  { id: 17, user_id: 9, flight_id: 17, legroom: false, window_position: false, middle: true, aisle: false, front: false, center: true, back: false, side_by_side: true, neighbouring_row: false, same_row: true },
  { id: 18, user_id: 9, flight_id: 18, legroom: false, window_position: false, middle: true, aisle: false, front: false, center: true, back: false, side_by_side: true, neighbouring_row: false, same_row: true },
  
  // User 10: 2 seats on 2 flights
  { id: 19, user_id: 10, flight_id: 19, legroom: true, window_position: true, middle: false, aisle: false, front: false, center: true, back: false, side_by_side: true, neighbouring_row: true, same_row: false },
  { id: 20, user_id: 10, flight_id: 20, legroom: true, window_position: true, middle: false, aisle: false, front: false, center: true, back: false, side_by_side: true, neighbouring_row: true, same_row: false }
];