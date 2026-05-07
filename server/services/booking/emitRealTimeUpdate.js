import { SegmentAvailability } from "../../model/trainModel/segmentAvailability.js";
import { WlInventorySnapshot } from "../../model/trainModel/wlQuotaInventory.js";

export const emitRealTimeUpdate = async (io, trainId, journeyDate , boardingStation, sourceIndex, destIndex, selectedCoachType) => {
  console.log('Emitting real-time update for trainId:', trainId, 'journeyDate:', journeyDate);
  try {

         const [segmentDoc, wlDoc] = await Promise.all([
           SegmentAvailability.findOne({ trainId, journeyDate }),
           WlInventorySnapshot.findOne({
             trainId,
             journeyDate,
             boardingStation: boardingStation.toLowerCase()
           })
         ]);

         console.log('Fetched Segment Document:', segmentDoc);
         console.log('Fetched WL Inventory Document:', wlDoc);

         if (!segmentDoc || !wlDoc) {
           throw new Error("Failed to fetch availability data. Please try again later.");
         }

         // =========================
         // 1️⃣ Get ONLY journey segments (NOT affected)
         // =========================
         const coveredSegments = segmentDoc.segments.filter(
           seg =>
             seg.fromIndex >= sourceIndex &&
             seg.toIndex <= destIndex
         );

         // =========================
         // 1️⃣ INIT (ONLY ONE COACH)
         // =========================
         let updatedCoachAvailability = {
           coachType: selectedCoachType.coachType,

           quotas: {
             general: { limit: Infinity, status: "AVAILABLE" },
             ladies: { limit: Infinity, status: "AVAILABLE" },
             senior: { limit: Infinity, status: "AVAILABLE" },
             tatkal: { limit: Infinity, status: "AVAILABLE" },
             premiumTatkal: { limit: Infinity, status: "AVAILABLE" }
           },

           fallback: {
             rac: { queueOccupied: 0, limit: 0, status: "AVAILABLE" },
             wl: { queueOccupied: 0, limit: 0, wlType: 'WL', status: "AVAILABLE" },
             tqwl: { queueOccupied: 0, limit: 0, status: "AVAILABLE" }
           },

           prices: {
             general: 0,
             ladies: 0,
             senior: 0,
             tatkal: 0,
             premiumTatkal: 0
           }
         };

         // =========================
         // 2️⃣ LOOP segments (ONLY selected coach)
         // =========================
         for (const seg of coveredSegments) {

           const coach = seg.coachTypes.find(
             ct => ct.coachTypeName === selectedCoachType.coachType
           );

           if (!coach) continue;

           // =========================
           // CNF → MIN
           // =========================
           for (const q of coach.quota) {
             if (q.type in updatedCoachAvailability.quotas) {

               updatedCoachAvailability.quotas[q.type].limit = Math.min(
                 updatedCoachAvailability.quotas[q.type].limit,
                 q.availableSeats
               );

               updatedCoachAvailability.prices[q.type] = q.pricePerSeat;
             }
           }

           // =========================
           // RAC → SLOT BASED
           // =========================
           const racObj = updatedCoachAvailability.fallback.rac;

           const totalSlots = coach.rac
           const occupiedSlots = coach.racQueue?.length || 0;

           racObj.limit = totalSlots;

           racObj.queueOccupied = Math.max(
             racObj.queueOccupied,
             occupiedSlots
           );

           // =========================
           // TQWL
           // =========================
           const tqwlObj = updatedCoachAvailability.fallback.tqwl;

           tqwlObj.queueOccupied = Math.max(
             tqwlObj.queueOccupied,
             coach.tatkalQueue?.length || 0
           );

           tqwlObj.limit = coach.tatkal || tqwlObj.limit;
         }

         // =========================
         // 3️⃣ WL merge
         // =========================
         if (wlDoc) {
           const coachWL = wlDoc.coachWlInventories.find(
             c => c.coachTypeName === selectedCoachType.coachType
           );

           if (coachWL) {
             updatedCoachAvailability.fallback.wl = {
               queueOccupied: coachWL.wlQueue?.length || 0,
               limit: coachWL.wlLimit || 0,
               wlType: coachWL.wlQuota,
               status: "AVAILABLE"
             };
           }
         }

         // =========================
         // 4️⃣ CLEANUP
         // =========================
         for (const q in updatedCoachAvailability.quotas) {
           if (updatedCoachAvailability.quotas[q].limit === Infinity) {
             updatedCoachAvailability.quotas[q].limit = 0;
           }

           updatedCoachAvailability.quotas[q].status =
             updatedCoachAvailability.quotas[q].limit > 0
               ? "AVAILABLE"
               : "NOT_AVAILABLE";
         }

         // RAC
         const rac = updatedCoachAvailability.fallback.rac;
         rac.status = rac.queueOccupied < rac.limit ? "AVAILABLE" : "FULL";

         // WL
         const wl = updatedCoachAvailability.fallback.wl;
         wl.status = wl.queueOccupied < wl.limit ? "AVAILABLE" : "FULL";

         // TQWL
         const tqwl = updatedCoachAvailability.fallback.tqwl;
         tqwl.status = tqwl.queueOccupied < tqwl.limit ? "AVAILABLE" : "FULL";

         // =========================
         // 5️⃣ FINAL ARRAY (IMPORTANT)
         // =========================
         const availability = [updatedCoachAvailability]; // ✅ SAME STRUCTURE

         // =========================
         // 6️⃣ EMIT
         // =========================
         const room = `${trainId}_${journeyDate}_${sourceIndex}_${destIndex}`;

         const clients = io.sockets.adapter.rooms.get(room);

         console.log("🚀 EMIT ROOM:", room);
         console.log("👥 CLIENTS IN ROOM:", clients);



         setTimeout(() => {
           io.to(room).emit("seatUpdated", {
             trainId,
             journeyDate,
             journey: {
               _fromIndex: sourceIndex,
               _toIndex: destIndex
             },
             availability
           });

           console.log("🔥 EMIT AFTER DELAY:", room);
         }, 2000);

         console.log("Emitted seat update to room:", room, "with availability:", availability);

  } catch (error) {
    throw new Error('Failed to emit real-time update: ' + error.message);
  }
}
