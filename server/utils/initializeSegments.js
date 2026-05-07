import { SegmentAvailability } from "../model/trainModel/segmentAvailability.js";

export async function initializeSegmentsForJourney(train, journeyDate) {



  const segments = [];

  for (let i = 0; i < train.routes.length - 1; i++) {

    console.log(train.routes);

    segments.push({
      segmentIndex: i,
      fromIndex: i,
      toIndex: i + 1,
      coachTypes: train.coaches.map(coach => ({

        coachTypeName: coach.coachType, // e.g. SL, 3A, 2A

        quota : coach.quota.map(q => ({
          type: q.type,
          availableSeats: q.totalSeats, // Initially, all seats are available
          isEnabled: q.isEnabled,
          pricePerSeat: q.basePrice
        })),

        tatkal : coach.tatkalLimit|| 0,
        tatkalQueue : [],
        rac: coach.racLimit * 2, // Assuming each RAC slot can accommodate 2 passengers
        racQueue : []
      }))
    });
  }

  console.log('Initialized Segments:', segments);



  await SegmentAvailability.create({
    trainId: train._id,
    journeyDate,
    segments
  });
}
