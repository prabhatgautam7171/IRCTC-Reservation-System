export const generateTicket = (bookingData) => {
  const train = bookingData.train;

  const passengersRows = bookingData.passengers
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.age}</td>
        <td>${p.gender}</td>
        <td>${p.coach}-${p.seatBooked} (${p.seatType})</td>
        <td>${p.status}</td>
      </tr>
    `
    )
    .join("");

  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">

    <!-- MAIN CONTAINER -->
    <div style="max-width:900px; margin:auto; background:white; border:1px solid #ddd; box-shadow:0 5px 20px rgba(0,0,0,0.08);">

      <!-- HEADER -->
      <div style="background:#d2232a; color:white; padding:15px 20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="margin:0;">IRCTC E-Ticket</h2>
          <p style="margin:0; font-size:12px;">Indian Railway Catering and Tourism Corporation</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;"><strong>PNR:</strong> ${bookingData.PNR}</p>
          <p style="margin:0; font-size:12px;">Status: CONFIRMED</p>
        </div>
      </div>

      <!-- JOURNEY DETAILS -->
      <div style="padding:20px;">
        <h3 style="border-bottom:2px solid #eee; padding-bottom:5px;">Journey Details</h3>

        <table style="width:100%; font-size:14px; margin-top:10px;">
          <tr>
            <td><strong>Train</strong></td>
            <td>${train.trainNo} - ${train.trainName}</td>
            <td><strong>Date</strong></td>
            <td>${new Date(bookingData.journeyDate).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td><strong>From</strong></td>
            <td>${bookingData.source}</td>
            <td><strong>To</strong></td>
            <td>${bookingData.destination}</td>
          </tr>
          <tr>
            <td><strong>Departure</strong></td>
            <td>${bookingData.departureTime}</td>
            <td><strong>Arrival</strong></td>
            <td>${bookingData.arrivalTime}</td>
          </tr>
          <tr>
            <td><strong>Class</strong></td>
            <td>${bookingData.passengers[0].coach}</td>
            <td><strong>Quota</strong></td>
            <td>General</td>
          </tr>
        </table>
      </div>

      <!-- PASSENGERS -->
      <div style="padding:20px;">
        <h3 style="border-bottom:2px solid #eee; padding-bottom:5px;">Passenger Details</h3>

        <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:13px;">
          <thead style="background:#f2f2f2;">
            <tr>
              <th style="border:1px solid #ddd; padding:8px;">#</th>
              <th style="border:1px solid #ddd; padding:8px;">Name</th>
              <th style="border:1px solid #ddd; padding:8px;">Age</th>
              <th style="border:1px solid #ddd; padding:8px;">Gender</th>
              <th style="border:1px solid #ddd; padding:8px;">Seat</th>
              <th style="border:1px solid #ddd; padding:8px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${passengersRows}
          </tbody>
        </table>
      </div>

      <!-- PAYMENT -->
      <div style="padding:20px;">
        <h3 style="border-bottom:2px solid #eee; padding-bottom:5px;">Payment Details</h3>

        <table style="width:100%; font-size:14px; margin-top:10px;">
          <tr>
            <td><strong>Total Fare</strong></td>
            <td>₹ ${bookingData.totalFare}</td>
          </tr>
          <tr>
            <td><strong>Payment Mode</strong></td>
            <td>Online</td>
          </tr>
          <tr>
            <td><strong>Transaction ID</strong></td>
            <td>${bookingData.paymentId || "N/A"}</td>
          </tr>
        </table>
      </div>

      <!-- FOOTER -->
      <div style="background:#f9f9f9; padding:15px; font-size:12px; color:#555; border-top:1px solid #ddd;">
        <p>• Carry a valid ID proof during travel.</p>
        <p>• This is a system-generated ticket and does not require a signature.</p>
        <p>• Visit <a href="https://www.irctc.co.in">www.irctc.co.in</a> for support.</p>
      </div>

    </div>
  </div>
  `;
};
