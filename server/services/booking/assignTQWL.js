import { SegmentAvailability } from "../../model/trainModel/segmentAvailability.js";

export async function assignTQWL({
  limit,
  fare,
  status,
  assignedSeats,
  passengers,
  train,
  selectedCoachType,
  journeyDate,
  sourceIndex,
  destIndex,
  bookingId,
  userId,
  session
}) {

  if (limit === 0) return { count: 0, assignedSeats };

  console.log('limit at TQWL:', limit);

  let assignedCount = 0;


  const doc = await SegmentAvailability.findOne(
    { trainId: train._id, journeyDate },
    null,
    { session }
  );

  if (!doc) throw new Error("SegmentAvailability not found");

  const overlappingSegments = doc.segments.filter(
    seg => seg.fromIndex < destIndex && seg.toIndex > sourceIndex
  );

  for (const seg of overlappingSegments) {

    const coach = seg.coachTypes.find(
      c => c.coachTypeName === selectedCoachType.coachType
    );

    if (!coach) continue;

    if (coach.tatkal < limit) {
      throw new Error("Tatkal WL limit exceeded");
    }

    for (let i = 0; i < limit; i++) {


      const wlPosition =
        coach.tatkalQueue.length > 0
          ? coach.tatkalQueue[coach.tatkalQueue.length - 1].tatkalPosition + 1
          : 1;

      coach.tatkalQueue.push({
        selectedCoachType: {
          coachTypeId: selectedCoachType._id,
          coachTypeName: selectedCoachType.coachType
        },
        fromIndex: sourceIndex,
        toIndex: destIndex,
        userId,
        bookingId,
        tatkalPosition: wlPosition
      });

      assignedSeats.push({
        ...passengers[i],
        quota: 'tatkal',
        coach: 'N/A',
        seatBooked: 'N/A',
        seatType: 'N/A',
        status: status || 'TQWL',
        fare,
        // seatRef: seat._id,      /// These are RAC properties that are no requirement for TQWL
        // assignedSlot: s1.bookingId === bookingId ? 1 : 2
      });


      console.log(`Assigned TQWL for passenger ${passengers[i].name} at segment ${seg.fromIndex}-${seg.toIndex} in coach ${coach.coachTypeName} with tatkal position ${wlPosition}`);
    }

    coach.tatkal -= limit; // reduce availability once
  }

  doc.markModified("segments");
  await doc.save({ session });

  /// remove duplicates passengers in assignedSeats (can happen in case of multiple overlapping segments)

  const uniquePassengersMap = new Map();
  assignedSeats.forEach(p => {
    uniquePassengersMap.set(p.id, p);
  });
  assignedSeats = Array.from(uniquePassengersMap.values());

  console.log('Unique assignedSeats after removing duplicates :', assignedSeats);

  console.log("TQWL assignedCount:", assignedCount);

  if (limit > assignedSeats.length) {
    throw new Error("Assigned seats less than limit, something went wrong");
  }
  else if (assignedSeats.length > limit) {
    throw new Error("Assigned seats more than limit, something went wrong");
  }

  assignedCount = assignedSeats.length;


  return {
    assignedSeats,
    count: assignedCount
  };
}
