import express from "express";
import { createFlight, deleteFlight, getFlightsByAircraft, getFlightsByAirline, getFlightsForUser, searchAirportSuggestions, updateFlight } from "../../controller/airplaneController/flightConroller.js";


const router = express.Router();

router.route("/create-flight/:airlineId/:aircraftId").post(createFlight);
router.route("/update-flight/:id").post(updateFlight);
router.route("/delete-flight/:id").delete(deleteFlight);
router.route("/flights").get(getFlightsForUser);
router.route("/by-airline/:airlineId").get(getFlightsByAirline);
router.route("/by-aircraft/:aircraftId").get(getFlightsByAircraft);
router.route("/suggestions").get(searchAirportSuggestions);

export default router;
