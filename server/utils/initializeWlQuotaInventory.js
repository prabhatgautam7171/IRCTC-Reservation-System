import { WlInventorySnapshot } from "../model/trainModel/wlQuotaInventory.js";

export async function initializeWlQuotaForJourney(train, journeyDate) {

  const wlInventoryDocs = [];

  // WL applies per boarding station (not destination)
  for (let routeIndex = 0; routeIndex < train.routes.length - 1; routeIndex++) {

    const boardingStation = train.routes[routeIndex].routeName.toLowerCase();



    const coachWlInventories = [];

    for (const coach of train.coaches) {

      // Find WL policy for this coach + boarding station
      const appliedWlPolicy = coach.wlQuotaMap.find(
        policy => policy.routeName === train.routes[routeIndex].routeName
      );

      // If railway does not define WL here, skip
      if (!appliedWlPolicy) continue;
         console.log("appliedWlPolicy", appliedWlPolicy);

      coachWlInventories.push({
        coachTypeName: coach.coachType,          // SL, 3A, 2A
        wlQuota: appliedWlPolicy.wlQuota,              // GNWL / RLWL / PQWL
        wlLimit: appliedWlPolicy.wlLimit,            // numeric limit
        wlQueue: []                                  // journey-date specific
      });
    }

    // If no coach has WL at this station, skip doc
    if (coachWlInventories.length === 0) continue;

    wlInventoryDocs.push({
      trainId: train._id,
      journeyDate,
      routeIndex,
      boardingStation,
      coachWlInventories
    });
  }

  if (wlInventoryDocs.length > 0) {
    await WlInventorySnapshot.insertMany(wlInventoryDocs);
  }
}
