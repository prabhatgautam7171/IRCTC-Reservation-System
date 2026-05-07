// Helper to generate seats
export const generateSeats = (rows, cols) => {
  const seatTypes = ["Window", "Middle", "Aisle"];
  const seats = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seatNumber = `${r}${String.fromCharCode(65 + c)}`; // e.g., 1A, 1B
      let seatType;
      if (c === 0 || c === cols - 1) seatType = "Window";
      else if (cols > 2 && (c === 1 || c === cols - 2)) seatType = "Middle";
      else seatType = "Aisle";

      seats.push({
        row: r,
        col: c + 1,
        seatNumber,
        seatTypes,
        isAvailable: true,
      });
    }
  }
  return seats;
};