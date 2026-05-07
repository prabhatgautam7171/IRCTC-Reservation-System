import { WlInventorySnapshot } from "../../model/trainModel/wlQuotaInventory.js";

export async function assignWL({
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
  source,
  session
}) {

  if (limit === 0) return { count: 0, assignedSeats };

  let assignedCount = 0;

  console.log('source :', source);

  const doc = await WlInventorySnapshot.findOne({
    trainId: train._id,
    journeyDate,
    boardingStation: source.toLowerCase()
  }).session(session);


  if (!doc) throw new Error("WLInventory not found");

  const coachInventory = doc.coachWlInventories.find(
    c => c.coachTypeName === selectedCoachType.coachType
  );

  if (!coachInventory) {
    throw new Error("Coach WL inventory not found");
  }

  if (coachInventory.wlLimit < limit) {
    throw new Error("WL quota exhausted");
  }

  for (let i = 0; i < limit; i++) {

    const wlPosition = coachInventory.wlQueue.length + 1;
    const wlStatus = coachInventory.wlQuota;

    coachInventory.wlQueue.push({
      selectedCoachType: {
        coachTypeId: selectedCoachType._id,
        coachTypeName: selectedCoachType.coachType
      },
      fromIndex: sourceIndex,
      toIndex: destIndex,
      bookingId,
      userId,
      wlPosition : wlPosition
    });

    assignedSeats.push({
      ...passengers[i],
      quota: 'WL',
      coach : 'N/A',
      seatBooked: 'N/A',
      seatType: 'N/A',
      status : wlStatus ,
      fare
    });

    assignedCount++
  }

  coachInventory.wlLimit -= assignedCount;

  await doc.save({ session });

  console.log("WL assignedCount:", assignedCount);

  if(limit > assignedSeats.length) {
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
