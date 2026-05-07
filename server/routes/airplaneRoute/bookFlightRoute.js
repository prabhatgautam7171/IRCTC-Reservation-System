import express from "express";
import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { bookFlight } from "../../controller/airplaneController/bookFlightController.js";


const router = express.Router();


router.post("/book", isAuthenticated, bookFlight);

export default router;