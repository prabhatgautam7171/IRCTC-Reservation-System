export const assignSeats = (aircraft, passengers, preferredClass) => {
  const selectedClass = aircraft.classes.find(
    (c) => c.classType.toLowerCase() === preferredClass.toLowerCase()
  );

  if (!selectedClass) {
    throw new Error("Class not available in this aircraft.");
  }

  const assignedSeatNumbers = [];



  for (let i = 0; i < passengers.length; i++) {
    let seatAssigned = false;

    // 1️⃣ Try preferred seat type
    if (passengers[i].seatPreference) {
      for (let row of selectedClass.rows) {
        for (let seat of row.seats) {
          if (seat.isAvailable && seat.seatNo === passengers[i].seatPreference.toLowerCase()) {
            const seatNumber = `${seat.seatNo}`;
            passengers[i].seatNumber = seatNumber;
            passengers[i].seatType = seat.seatType;
            passengers[i].seatClass = preferredClass;

            seat.isAvailable = false;
            assignedSeatNumbers.push(seatNumber);
            seatAssigned = true;
            break;
          }
        }
        if (seatAssigned) break;
      }
    }

    // 2️⃣ If no preference, assign any available seat
    if (!seatAssigned) {
      for (let row of selectedClass.rows) {
        for (let seat of row.seats) {
          if (seat.isAvailable) {
            const seatNumber = `${seat.seatNo}`;
            passengers[i].seatNumber = seatNumber;
            passengers[i].seatType = seat.seatType;
            passengers[i].seatClass = preferredClass;

            seat.isAvailable = false;
            assignedSeatNumbers.push(seatNumber);
            seatAssigned = true;
            break;
          }
        }
        if (seatAssigned) break;
      }
    }

    if (!seatAssigned) {
      throw new Error(
        `No available seats for passenger ${passengers[i].firstName} ${passengers[i].lastName}.`
      );
    }
  }
  return assignedSeatNumbers; // ✅ Only seat numbers as strings
} 
  

 

