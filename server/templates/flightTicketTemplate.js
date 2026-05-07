export const generateAirlineTicket = (bookingData) => {
    const { PNR, flights, passengers, totalFare, tripType, contact } = bookingData;
  
    const flightDetails = flights
      .map(
        (f, i) => `
        <div style="border: 1px solid #ccc; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
          <h3 style="color: #0b5394; margin: 0 0 8px 0;">✈️ Flight ${i + 1}: ${f.flightNo} (${f.airline.name})</h3>
          <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <div>
              <p><strong>From:</strong> ${f.from.city} (${f.from.code})</p>
              <p><strong>Terminal:</strong> ${f.from.terminal}</p>
              <p><strong>Departure:</strong> ${new Date(f.departureTime).toLocaleString()}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>To:</strong> ${f.to.city} (${f.to.code})</p>
              <p><strong>Terminal:</strong> ${f.to.terminal}</p>
              <p><strong>Arrival:</strong> ${new Date(f.arrivalTime).toLocaleString()}</p>
            </div>
          </div>
          <p style="margin-top: 6px;"><strong>Duration:</strong> ${f.duration}</p>
          <p><strong>Class:</strong> ${f.class}</p>
        </div>
      `
      )
      .join("");
  
    const passengerDetails = passengers
      .map(
        (p, index) => `
        <div style="margin-bottom: 10px;">
          <p><strong>Passenger ${index + 1}:</strong> ${p.title} ${p.firstName} ${p.lastName}</p>
          <p>${p.gender} | DOB: ${p.dob}</p>
          <p><strong>Seat:</strong> ${p.seatNumber} (${p.seatType}) | <strong>Status:</strong> ${p.status}</p>
          <p><strong>Meal:</strong> ${p.mealPreference} | <strong>Nationality:</strong> ${p.nationality}</p>
          <hr style="border: 0.5px solid #ddd;">
        </div>
      `
      )
      .join("");
  
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ccc; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #004aad, #007bff); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">E-AIR TICKET</h1>
        <p style="margin: 4px 0;">Your flight booking is confirmed ✈️</p>
        <h3 style="margin: 5px 0;">PNR: ${PNR}</h3>
      </div>
  
      <!-- Booking Summary -->
      <div style="padding: 20px;">
        <h3 style="background-color: #f2f6fc; padding: 8px; border-radius: 6px;">🧾 Booking Summary</h3>
        <p><strong>Trip Type:</strong> ${tripType}</p>
        <p><strong>Booked On:</strong> ${new Date(bookingData.createdAt).toLocaleString()}</p>
        <p><strong>Contact:</strong> ${contact.email} | ${contact.countryCode}-${contact.phone}</p>
      </div>
  
      <!-- Flight Details -->
      <div style="padding: 0 20px 20px;">
        <h3 style="background-color: #f2f6fc; padding: 8px; border-radius: 6px;">✈️ Flight Details</h3>
        ${flightDetails}
      </div>
  
      <!-- Passenger Details -->
      <div style="padding: 0 20px 20px;">
        <h3 style="background-color: #f2f6fc; padding: 8px; border-radius: 6px;">👤 Passenger Details</h3>
        ${passengerDetails}
      </div>
  
      <!-- Fare Details -->
      <div style="padding: 0 20px 20px;">
        <h3 style="background-color: #f2f6fc; padding: 8px; border-radius: 6px;">💳 Payment Summary</h3>
        <p><strong>Total Fare:</strong> ₹ ${totalFare}</p>
        <p><strong>Payment Mode:</strong> Online</p>
        <p><strong>Transaction ID:</strong> ${bookingData.paymentId || "N/A"}</p>
      </div>
  
      <!-- Footer -->
      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #555;">
        <p>Please carry a valid photo ID proof for all passengers during check-in.</p>
        <p>This is a system-generated e-ticket. No signature required.</p>
        <p>For support, contact <a href="mailto:${contact.email}" style="color:#004aad;">${contact.email}</a></p>
        <p>© ${new Date().getFullYear()} SkyBook Air Services</p>
      </div>
    </div>
    `;
  };
  