import express from 'express';
import { createCheckoutSessionForFlight } from '../../controller/airplaneController/flightPaymentController.js';



const router = express.Router();

router.post('/create-checkout-session', createCheckoutSessionForFlight);

export default router;
