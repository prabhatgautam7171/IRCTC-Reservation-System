import mongoose from "mongoose";
import { SeatInventory } from "../../model/trainModel/seatInventory.js";
import { SegmentAvailability } from "../../model/trainModel/segmentAvailability.js";


export async function assignRACSeats({
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

  let assignedCount = 0;
  let bookToRAC = limit;
  let assignedRACSeats = [];
  let racConsumed = 0;

  for (let i = 0; i < limit && bookToRAC > 0;) {

    // =========================
    // 🟢 TRY DOUBLE SEAT (BEST CASE)
    // =========================
    if (bookToRAC >= 1 && i + 1 < passengers.length) {

      const doubleSeat = await SeatInventory.findOneAndUpdate(
        {
          trainId: train._id,
          journeyDate,
          coachTypeName: selectedCoachType.coachType,
          status: status || 'RAC',

          "racMeta.slot1.bookingId": null,
          "racMeta.slot2.bookingId": null,

          // 🔥 IMPORTANT: check segment overlap for BOTH slots
          $and: [
            {
              "racMeta.slot1.bookedSegments": {
                $not: {
                  $elemMatch: {
                    fromIndex: { $lt: destIndex },
                    toIndex: { $gt: sourceIndex }
                  }
                }
              }
            },
            {
              "racMeta.slot2.bookedSegments": {
                $not: {
                  $elemMatch: {
                    fromIndex: { $lt: destIndex },
                    toIndex: { $gt: sourceIndex }
                  }
                }
              }
            }
          ]
        },
        {
          $set: {
            "racMeta.slot1": {
              bookingId,
              userId,
              racPosition: 1,
              bookedSegments: [{ fromIndex: sourceIndex, toIndex: destIndex }]
            },
            "racMeta.slot2": {
              bookingId,
              userId,
              racPosition: 2,
              bookedSegments: [{ fromIndex: sourceIndex, toIndex: destIndex }]
            }
          }
        },
        { session, new: true }
      );

      console.log('doubleSeat found:', doubleSeat);

      if (doubleSeat) {

        assignedRACSeats.push(
          {
            ...passengers[i],
            coach: doubleSeat.coachName,
            seatBooked: doubleSeat.seatNo,
            seatType: doubleSeat.seatType,
            status: 'RAC',
            fare,
            seatRef: doubleSeat._id,
            assignedSlot: 1
          },
          {
            ...passengers[i + 1],
            coach: doubleSeat.coachName,
            seatBooked: doubleSeat.seatNo,
            seatType: doubleSeat.seatType,
            status: 'RAC',
            fare,
            seatRef: doubleSeat._id,
            assignedSlot: 2
          }
        );

        assignedCount += 2;
        racConsumed += 2;   // ✅ ONE RAC seat consumed
        bookToRAC -= 2;     // ✅ reduce ONLY 1

        i += 2;
        continue;
      }
    }

    // =========================
    // 🟡 SINGLE SLOT (SAFE)
    // =========================

    let seat = await SeatInventory.findOneAndUpdate(
      {
        trainId: train._id,
        journeyDate,
        coachTypeName: selectedCoachType.coachType,
        status: status || 'RAC',

        $or: [
          {
            // ✅ SLOT 1 available + segment safe
            "racMeta.slot1.bookingId": null,
            "racMeta.slot1.bookedSegments": {
              $not: {
                $elemMatch: {
                  fromIndex: { $lt: destIndex },
                  toIndex: { $gt: sourceIndex }
                }
              }
            }
          },
          {
            // ✅ SLOT 2 available + segment safe
            "racMeta.slot2.bookingId": null,
            "racMeta.slot2.bookedSegments": {
              $not: {
                $elemMatch: {
                  fromIndex: { $lt: destIndex },
                  toIndex: { $gt: sourceIndex }
                }
              }
            }
          }
        ]
      },
      [
        {
          $set: {
            // 🔥 Decide dynamically which slot to assign
            "racMeta.slot1": {
              $cond: [
                { $eq: ["$racMeta.slot1.bookingId", null] },
                {
                  bookingId,
                  userId,
                  racPosition: 1,
                  bookedSegments: [{ fromIndex: sourceIndex, toIndex: destIndex }]
                },
                "$racMeta.slot1"
              ]
            },
            "racMeta.slot2": {
              $cond: [
                {
                  $and: [
                    { $ne: ["$racMeta.slot1.bookingId", null] }, // slot1 already occupied
                    { $eq: ["$racMeta.slot2.bookingId", null] }
                  ]
                },
                {
                  bookingId,
                  userId,
                  racPosition: 2,
                  bookedSegments: [{ fromIndex: sourceIndex, toIndex: destIndex }]
                },
                "$racMeta.slot2"
              ]
            }
          }
        }
      ],
      { session, new: true }
    );

    console.log('single RAC seat found:', seat);

    if (!seat) break;

    const s1 = seat.racMeta.slot1;
    const s2 = seat.racMeta.slot2;

    assignedRACSeats.push({
      ...passengers[i],
      coach: seat.coachName,
      seatBooked: seat.seatNo,
      seatType: seat.seatType,
      status: 'RAC',
      fare,
      seatRef: seat._id,
      assignedSlot: s1.bookingId === bookingId ? 1 : 2
    });

    assignedCount += 1;
    racConsumed += 1;
    bookToRAC -= 1;


    i += 1;
  }

  // for(int i = 0; i<= limit; i++) {
  // try seat with both slots empty -> assign 2 passengers
  // if(doubleseat found) {
  // assignedCount += 2;
  // limit -= 2;
  // }
  // else {
  // try seat with slot1 empty -> assign 1 passenger
  // if(seat found) {
  // assignedCount += 1;
  // then dont need to decrement limit as we are assigning only 1 passenger
  // }
  // else {
  // try seat with slot2 empty -> assign 1 passenger
  // if(seat found) {
  // assignedCount += 1;
  // then dont need to decrement limit as we are assigning only 1 passenger
  // }
  // else {
  // break; // no more seats safely available
  // }
  // }
  // }


  console.log("RAC assignedCount:", assignedCount, "RAC consumed:", racConsumed);

  console.log('assignedRACSeats :', assignedRACSeats);

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

    const racAvl = coach.rac;


    if (racAvl < assignedCount) {
      throw new Error("racAvl underflow");
    }

    console.log(` Before updation ${seg} -> ${coach} -> rac : `, coach.rac)

    coach.rac -= racConsumed

    console.log(` After updation ${seg} -> ${coach} -> rac : `, coach.rac)

    if (!coach.racQueue) {
      throw new Error(`RAC Queue doesn't exist for ${coach} coach at ${seg} `);
    }

    console.log('assignedSeats :', assignedRACSeats);

    for (const seat of assignedRACSeats) {

      const nextRacPosition =
        coach.racQueue.length > 0
          ? coach.racQueue[coach.racQueue.length - 1].racPosition + 1
          : 1;

      coach.racQueue.push({
        selectedCoachType: {
          coachTypeId: selectedCoachType._id,
          coachTypeName: selectedCoachType.coachType
        },

        fromIndex: sourceIndex,   // 🔑 use segment values
        toIndex: destIndex,

        seatId: seat.seatRef,

        slot: seat.assignedSlot,

        racPosition: nextRacPosition,

        userId: userId,
        bookingId: bookingId
      });
    }

    console.log(` Rac Queue of ${seg} -> ${coach}  : `, coach.racQueue);



    console.log(`updated rac avl seats :`, coach.rac);
  }

  doc.markModified('segments');
  await doc.save({ session });

  console.log('assignedCount :', assignedCount);

  assignedSeats.push(...assignedRACSeats);

  console.log('assigned seats', assignedRACSeats.length);

  return {
    assignedSeats: assignedSeats,
    count: assignedSeats.length
  };

}
