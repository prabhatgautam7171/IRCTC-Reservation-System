import { User } from "../../model/authModel/userModel.js";
import { Booking } from "../../model/trainModel/bookingModel.js";
import { generateTicket } from "../../templates/ticketTemplate.js";
import { sendTicketEmail } from "../../utils/sendTicket.js";
import { SegmentAvailability } from "../../model/trainModel/segmentAvailability.js";
import { WlInventorySnapshot } from "../../model/trainModel/wlQuotaInventory.js";

export async function finalizeBooking({
  io,
  trainId,
  journeyDate,
  bookingId,
  passengers,
  assignedSeats,
  userId,
  session,
  sourceIndex,
  destIndex,
  boardingStation,
  selectedCoachType
}) {

  try {

    /// Finalizing Booking ✅

    console.log('assignedSeats', assignedSeats);


    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        passengers: assignedSeats,
        totalFare: assignedSeats.reduce((sum, s) => sum + s.fare, 0),
        status: "CONFIRMED"
      },
      { session, new: true }
    );

    console.log('Booking Confirmed ✅:', updatedBooking);
    console.log('trainId', trainId);
    console.log('journeyDate', journeyDate);
    console.log('sourceIndex', sourceIndex);
    console.log('destIndex', destIndex);
    console.log('selectedCoachType', selectedCoachType);
    console.log('boardingStation', boardingStation);

    const user = await User.findById(userId);

if (!user) {
  throw new Error("User not found");
}

user.bookings.push(bookingId);

await user.save({ session });
    const bookingData = await Booking.findById(bookingId)
      .populate("train")
      .session(session);

    console.log('Booking Data :', bookingData);

    const html = generateTicket(bookingData);
    await sendTicketEmail({ to: user.email, subject: "Your IRCTC e-Ticket", html, });


    console.log("✅ CNF Booking Done for", bookingId);



    return bookingData;

  } catch (err) {
    console.error("❌ CNF Booking Failed:", err);
    throw err;
  }


}


