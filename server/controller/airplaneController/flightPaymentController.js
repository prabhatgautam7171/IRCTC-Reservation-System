import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSessionForFlight = async (req, res) => {
  console.log("✅ Stripe hit");
  console.log("➡️ Body:", JSON.stringify(req.body, null, 2));
  try {
    const {
      tripType,
      passengers,
      contact,
      aircraftId,
      aircraftId1,
      aircraftId2,
      flight,        // for one-way
      onwardFlight,  // optional for round-trip
      returnFlight,  // optional for round-trip
    } = req.body;
    
    // ------------------------
    // Normalize flight for one-way with safety check
    // ------------------------
    const onward = onwardFlight || flight;
    if (!onward || !passengers?.length) {
      console.log("❌ Missing flight or passengers:", { onward, passengers });
      return res.status(400).json({ message: "Missing flight or passenger details" });
    }
    
    // Add additional safety check for onward object
    if (typeof onward !== 'object') {
      console.log("❌ Invalid flight data:", onward);
      return res.status(400).json({ message: "Invalid flight data" });
    }
    
    const getPrice = (f) => {
      if (!f?.price) return null;
      let raw = f.price;
      if (typeof raw === "object") {
        const cls = (f.preferredClass || "economy").toLowerCase();
        raw = raw[cls] ?? Object.values(raw)[0];
      }
      return Math.round(Number(raw) * 100); // convert to paisa
    };
    
    const buildFlightDescription = (f, passengers, cls) => `
    Airline: ${f.airline?.name || "Airline"}
    Flight No: ${f.flightNo || f.flightNumber}
    From: ${f.from?.city || f.from}
    To: ${f.to?.city || f.to}
    Departure: ${new Date(f.departureTime).toLocaleString()}
    Arrival: ${new Date(f.arrivalTime).toLocaleString()}
    Class: ${f.class}
    Passengers: ${passengers.map(p => `${p.title} ${p.firstName} ${p.lastName}`).join(", ")}
    `;
    
    const line_items = [];
    
    // ------------------------
    // Add onward flight with safe metadata
    // ------------------------
    const onwardPrice = getPrice(onward);
    if (!onwardPrice) return res.status(400).json({ message: "Invalid onward flight price" });
    
    // Safe metadata extraction
    const flightId = onward._id || onward.id || onward;
    const flightNumber = onward.flightNo || onward.flightNumber || 'Unknown';
    const airlineName = onward.airline?.name || 'Airline';
    
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: `${airlineName} - ${flightNumber}`,
          description: buildFlightDescription(onward, passengers),
          metadata: {
            flightType: "onward",
            flightId: flightId ? flightId.toString() : 'unknown-flight-id',
            aircraftId: aircraftId || aircraftId1 || 'unknown-aircraft',
            class: onward.preferredClass || 'economy',
            passengerCount: passengers.length.toString(),
          }
        },
        unit_amount: onwardPrice,
      },
      quantity: 1,
    });
    
    
    
    
    if (tripType === "roundTrip" && returnFlight) {
      const returnPrice = getPrice(returnFlight);
      if (!returnPrice) return res.status(400).json({ message: "Invalid return flight price" });

      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: `${returnFlight.airline?.name || returnFlight.airline} - ${returnFlight.flightNumber || returnFlight.flightNo}`,
            description: buildFlightDescription(returnFlight, passengers),
            metadata: {
              flightType: 'return',
              flightId: returnFlight._id,
              aircraftId: aircraftId2,
              class: returnFlight?.preferredClass,
              passengerCount: passengers.length.toString()
            }
          },
          unit_amount: returnPrice,
        },
        quantity: 1,
      });
    }

    const totalAmount = line_items.reduce((total, item) => total + (item.price_data.unit_amount * item.quantity), 0) / 100;

    const metadata = {
      tripType: tripType || 'oneWay',
      passengerCount: passengers.length.toString(),
      onwardFlightId: onward._id || onward.id || 'unknown-flight-id',
      onwardAircraftId: aircraftId || aircraftId1 || 'unknown-aircraft',
      preferredClass: onward.preferredClass || 'economy',
      totalAmount: totalAmount.toString()
    };
    
    if (tripType === "roundTrip" && returnFlight) {
      metadata.returnFlightId = returnFlight._id || returnFlight.id || 'unknown-return-flight';
      metadata.returnAircraftId = aircraftId2 || 'unknown-aircraft';
    }
    
    if (contact?.email) metadata.customerEmail = contact.email;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      customer_email: contact?.email || undefined,
      metadata,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/flights/payment-success/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/flights/payment-cancel`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    res.status(200).json({ id: session.id, url: session.url });

  } catch (error) {
    console.error("❌ Stripe Checkout Session error:", error);
    res.status(500).json({ message: "Stripe payment session creation failed", error: error.message });
  }
};
