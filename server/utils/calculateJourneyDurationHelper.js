export function getDuration(departure, arrival) {
  const parseTime = (t) => {
    let [time, meridian] = t.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (meridian === "PM" && hours !== 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const start = parseTime(departure);
  const end = parseTime(arrival);

  let diff = end - start;
  if (diff < 0) diff += 24 * 60; // next day trains

  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;

  return `${hrs}h ${mins}m`;
}
