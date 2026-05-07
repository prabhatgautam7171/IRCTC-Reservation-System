async function promoteTQWLToTatkal({
  cancelledTatkalSeats,
  cancelledCoveredSegments,
  coachTypeName,
  segmentDoc,
  session
}) {
  const eligibleTQWL = [];
  const usedPassengers = new Set();

  for (const seg of cancelledCoveredSegments) {

    const coach = seg.coachTypes.find(
      c => c.coachTypeName === coachTypeName
    );

    if (!coach) continue;

    // 🚫 No TQWL queue
    if (!coach.tatkalQueue || coach.tatkalQueue.length === 0) continue;

    for (const tqwlPass of coach.tatkalQueue) {

      const passId = String(tqwlPass._id);

      // ✅ prevent duplicate passenger usage
      if (usedPassengers.has(passId)) continue;

      for (const seatObj of cancelledTatkalSeats) {

        const seat = seatObj.seat;

        // 🔥 IMPORTANT: must fit full journey
        const canFit = canPassengerFitSeat(seat, tqwlPass);

        if (canFit) {
          eligibleTQWL.push({
            passenger: tqwlPass,
            seat
          });

          usedPassengers.add(passId);
          break;
        }
      }
    }
  }

  // =========================
  // 🔥 STEP 2: ASSIGN SEATS
  // =========================
  for (const { passenger, seat } of eligibleTQWL) {
    await assignSeatToPassenger(seat, passenger, session);
  }

  // =========================
  // 🔥 STEP 3: REMOVE FROM TQWL QUEUE (ALL SEGMENTS)
  // =========================
  await removeTQWLPassengerFromAllSegments({
    passengers: eligibleTQWL.map(e => e.passenger),
    coachTypeName,
    segmentDoc,
    session
  });

  // =========================
  // 🔥 STEP 4: UPDATE AVAILABILITY
  // =========================
  const remainingSeats =
    cancelledTatkalSeats.length - eligibleTQWL.length;

  if (remainingSeats > 0) {
    updateTatkalAvailability(remainingSeats);
  }

  // =========================
  // 🔥 STEP 5: RETURN
  // =========================
  return {
    promotedTQWL: eligibleTQWL,
    remainingTatkalSeats: remainingSeats
  };
}
