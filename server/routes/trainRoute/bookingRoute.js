import express from 'express'
import { bookTrain, cancelBooking, getBookingDetailsByPNR, getBookings,  seePastBookings } from '../../controller/trainController/bookTrainController.js';
import { isAuthenticated } from '../../middleware/isAuthenticated.js';
import { adminOnly } from '../../middleware/isAdmin.js';

const router = express.Router();

router.route('/create-booking/:id/:coachType').post(isAuthenticated,bookTrain);
router.route('/getAllBookings').get(isAuthenticated,seePastBookings);  /// for a user
router.route('/get-Bookings').get(isAuthenticated,adminOnly,getBookings);   //// for admin
router.route('/cancel-Booking/:id').get(isAuthenticated,cancelBooking);
// router.route('/cancel-PartialBooking/:bookingId').post(isAuthenticated,partialCancellation);
router.route('/getBookingByPNR').post(getBookingDetailsByPNR);


export default router;

