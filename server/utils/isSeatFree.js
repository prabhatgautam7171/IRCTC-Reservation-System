export function canPassengerFitSeat({
  seat,
  passenger,
  mode = "CNF" // "CNF" | "RAC"
}) {
  if (!seat || !passenger) return false;

  const pFrom = Number(passenger.fromIndex);
  const pTo = Number(passenger.toIndex);

  if (isNaN(pFrom) || isNaN(pTo)) return false;
  if (pFrom >= pTo) return false;

  // =========================
  // 🔥 STEP 1: CNF BLOCK CHECK
  // =========================
  for (const seg of seat.bookedSegments || []) {

    const sFrom = seg.fromIndex;
    const sTo = seg.toIndex;

    const overlap = !(pTo <= sFrom || pFrom >= sTo);

    if (overlap) {
      return false; // ❌ CNF always blocks
    }
  }

  // =========================
  // 🔥 STEP 2: RAC MODE LOGIC
  // =========================
  if (mode === "RAC") {

    const slots = [
      seat.racMeta?.slot1,
      seat.racMeta?.slot2
    ];

    for (const slot of slots) {

      if (!slot) continue;

      let hasOverlap = false;

      for (const seg of slot.bookedSegments || []) {

        const sFrom = seg.fromIndex;
        const sTo = seg.toIndex;

        const overlap = !(pTo <= sFrom || pFrom >= sTo);

        if (overlap) {
          hasOverlap = true;
          break;
        }
      }

      // ✅ if this slot is free for this passenger
      if (!hasOverlap) {
        return true;
      }
    }

    return false; // ❌ no slot available
  }

  
  return false;
}
