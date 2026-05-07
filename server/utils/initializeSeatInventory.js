

export async function initializeSeatInventory(train, journeyDate) {

  console.log('Creating Seat Inventory for Train:', train.trainName, 'on', journeyDate);

  const seatDocs = [];



  for (const coachType of train.coaches) {
    for (const coach of coachType.coachList) {

      let seatCounter = 1;

      for (const seatType of coach.seatType) {
        for (const seat of seatType.seatMap) {

          seatDocs.push({
            trainId: train._id,
            journeyDate,
            coachTypeName: coachType.coachType,
            coachName: coach.coachName,
            seatNo: seatCounter++,
            seatType: seatType.seatType.toLowerCase(),
            status: seat.rac ? "RAC" : "CNF",
            bookedSegments: [],
            racMeta: []
          });

        }
      }
    }
  }

  // await SeatInventory.insertMany(seatDocs);

  console.log('Seat Inventory created with', seatDocs.length, 'seats.');

  return seatDocs; // Return the created seat documents for further processing if needed
};
