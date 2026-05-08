import { User } from "../model/authModel/userModel.js";
import { emitRealTimeUpdate } from "../services/booking/emitRealTimeUpdate.js";
import { generateTicket } from "../templates/ticketTemplate.js";
import { sendTicketEmail } from "./sendTicket.js";

export const runBackgroundTasks = ({
  io,
  train,
  journeyDate,
  source,
  sourceIndex,
  destIndex,
  selectedCoachType,
  userId,
  result
}) => {

  setImmediate(async () => {

    try {

      // =========================
      // EMAIL
      // =========================
      const user = await User.findById(userId);

      const html = generateTicket(result);

      await sendTicketEmail({
        to: user.email,
        subject: "Your IRCTC e-Ticket",
        html,
      });

      console.log("✅ Email sent");

    } catch (err) {
      console.error("❌ Email failed:", err);
    }

    try {

      // =========================
      // REALTIME UPDATE
      // =========================
      await emitRealTimeUpdate(
        io,
        train._id,
        journeyDate,
        source,
        sourceIndex,
        destIndex,
        selectedCoachType
      );

      console.log("✅ Realtime emitted");

    } catch (err) {
      console.error("❌ Emit failed:", err);
    }

  });

};
