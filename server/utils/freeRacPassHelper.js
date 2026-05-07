import { SegmentAvailability } from "../model/trainModel/segmentAvailability.js";

export async function removeRACPassengerFromAllSegments(passenger, coachTypeName, trainId, journeyDate, session) {

  const { fromIndex, toIndex } = passenger;

  const segmentDoc = await SegmentAvailability.findOne({
    trainId,
    journeyDate
  }).session(session);

  if (!segmentDoc) throw new Error("Segment doc not found");

  // 🔥 FULL JOURNEY SEGMENTS OF PASSENGER
  const passengerSegments = segmentDoc.segments.filter(
    seg =>
      seg.fromIndex >= fromIndex &&
      seg.toIndex <= toIndex
  );

  for (const seg of passengerSegments) {
    const coach = seg.coachTypes.find(
      c => c.coachTypeName === coachTypeName
    );

    if (!coach) continue;

    coach.racQueue = coach.racQueue.filter(
      p => String(p._id) !== String(passenger._id)
    );
  }

  await segmentDoc.save({ session });
}
