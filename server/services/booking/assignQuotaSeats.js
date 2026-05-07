import { SeatInventory } from "../../model/trainModel/seatInventory.js";
import { SegmentAvailability } from "../../model/trainModel/segmentAvailability.js";

export async function assignQuotaSeats({
  quotaType,
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
  session
}) {



  if (limit === 0) return { count: 0, assignedSeats };

  console.log(limit);

  let assignedCount = 0;

  for (let i = 0; i < limit; i++) {

    const passenger = passengers[i]; // 👈 important
    const preferredSeatType = passenger?.berthPreference; // e.g. "LowerBerth"

    let seat = null;

    // =========================
    // 1️⃣ Try preferred seat
    // =========================
    if (preferredSeatType) {
      seat = await SeatInventory.findOneAndUpdate(
        {
          trainId: train._id,
          journeyDate,
          coachTypeName: selectedCoachType.coachType,
          status,

          seatType: preferredSeatType, // 🔥 preference match

          bookedSegments: {
            $not: {
              $elemMatch: {
                fromIndex: { $lt: destIndex },
                toIndex: { $gt: sourceIndex }
              }
            }
          }
        },
        {
          $push: {
            bookedSegments: { fromIndex: sourceIndex, toIndex: destIndex }
          }
        },
        { session, new: true }
      );
    }

    // =========================
    // 2️⃣ Fallback → any seat
    // =========================
    if (!seat) {
      seat = await SeatInventory.findOneAndUpdate(
        {
          trainId: train._id,
          journeyDate,
          coachTypeName: selectedCoachType.coachType,
          status,

          bookedSegments: {
            $not: {
              $elemMatch: {
                fromIndex: { $lt: destIndex },
                toIndex: { $gt: sourceIndex }
              }
            }
          }
        },
        {
          $push: {
            bookedSegments: { fromIndex: sourceIndex, toIndex: destIndex }
          }
        },
        { session, new: true }
      );
    }

    // ❌ No seat found at all
    if (!seat) break;

    // =========================
    // 3️⃣ Assign seat
    // =========================
    assignedSeats.push({
      ...passenger, // 🔥 full passenger object
      coach: seat.coachName,
      seatBooked: seat.seatNo,
      seatType: seat.seatType,
      status: status || "CNF",
      fare,
      seatRef: seat._id,
      quota: quotaType
    });

    assignedCount++;
  }

  if (assignedCount === 0) {
    throw new Error("No seats available");
  }

  if (assignedCount > limit) {
    throw new Error("OVER-ASSIGN BUG");
  }


  // 🔻 decrement quota ONCE per segment
  const doc = await SegmentAvailability.findOne(
    { trainId: train._id, journeyDate },
    null,
    { session }
  );

  const overlappingSegments = doc.segments.filter(
    seg => seg.fromIndex < destIndex && seg.toIndex > sourceIndex
  );

  for (const seg of overlappingSegments) {
    const coach = seg.coachTypes.find(
      c => c.coachTypeName === selectedCoachType.coachType
    );

    const quota = coach.quota.find(q => q.type === quotaType);

    if (quota.availableSeats < assignedCount) {
      throw new Error("Quota underflow");
    }

    quota.availableSeats -= assignedCount;

    console.log(`updated ${quota} avl seats :`, quota.availableSeats);
  }

  await doc.save({ session });

  console.log('assignedCount :', assignedCount);

  return {
    assignedSeats,
    count: assignedCount
  };
}
