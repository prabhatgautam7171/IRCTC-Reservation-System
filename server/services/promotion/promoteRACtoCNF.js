import { canPassengerFitSeat } from "../../utils/isSeatFree.js";


export async function promoteRACToCNF({
  cancelledCNFSeats,
  cancelledCoveredSegments,
  booking,
  coachTypeName,
  segmentDoc,
  trainId,
  journeyDate,
  session
}) {
  // =========================
  // 1️⃣ FILTER NON-TATKAL SEATS
  // =========================
  const cancelledNonTatkalPass = cancelledCNFSeats.filter(
    c =>
      c.passenger.quota !== "tatkal" &&
      c.passenger.quota !== "premiumTatkal"
  );

  const eligibleRAC = [];
  const usedPassengers = new Set();


  // =========================
  // 2️⃣ FIND ELIGIBLE RAC PASSENGERS
  // =========================
  for (const seg of cancelledCoveredSegments) {
    const coach = seg.coachTypes.find(
      c => c.coachTypeName === coachTypeName
    );

    if (!coach || !coach.racQueue?.length) continue;

    for (const racPass of coach.racQueue) {
      const passId = String(racPass._id);

      ///skipp same pass
      if (usedPassengers.has(passId)) continue;

      for (const seatObj of cancelledNonTatkalPass) {
        const seat = seatObj.seat;
        const seatId = String(seat._id);

        const canFit = canPassengerFitSeat({seat, passenger : racPass});

        if (canFit) {
          eligibleRAC.push({
            passenger: racPass,
            seat
          });

          usedPassengers.add(passId);


          break;
        }
      }
    }
  }

  // =========================
  // 3️⃣ ASSIGN CNF SEATS
  // =========================
  for (const { passenger, seat } of eligibleRAC) {
    await assignSeatToPassenger(seat, passenger, session);
  }

  // =========================
  // 4️⃣ REMOVE FROM ALL SEGMENTS (CRITICAL)
  // =========================
  for (const { passenger } of eligibleRAC) {
    await removeRACPassengerFromAllSegments({
      passenger,
      coachTypeName,
      segmentDoc,
      session
    });
  }

  // =========================
  // 5️⃣ FREE RAC SLOTS
  // =========================
  const bookingIds = eligibleRAC.map(e => e.passenger.bookingId);

  await SeatInventory.updateMany(
    {
      $or: [
        { "racMeta.slot1.bookingId": { $in: bookingIds } },
        { "racMeta.slot2.bookingId": { $in: bookingIds } }
      ]
    },
    {
      $set: {
        "racMeta.slot1": null,
        "racMeta.slot2": null
      }
    }
  ).session(session);

  // =========================
  // 6️⃣ UPDATE REMAINING AVAILABILITY
  // =========================
  const remainingSeats =
    cancelledNonTatkalPass.length - eligibleRAC.length;

  if (remainingSeats > 0) {
    updateSegmentAvailability({
      segmentDoc,
      coachTypeName,
      remainingSeats
    });
  }

  // =========================
  // 7️⃣ RETURN FOR WL PROMOTION
  // =========================
  return {
    promotedRAC: eligibleRAC,       // CNF upgraded passengers
    freedRACSlots: eligibleRAC.length // for WL → RAC
  };
}
