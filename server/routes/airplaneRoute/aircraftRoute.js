import express from 'express';
import { createAircraft, deleteAircraft, getAircraftsByAirline, updateAircraft } from '../../controller/airplaneController/aircraftController.js';

const router = express.Router();

router.route('/create-aircraft/:id').post(createAircraft);
router.route('/update-aircraft/:id').post(updateAircraft);
router.route("/delete-aircraft/:id").delete(deleteAircraft);
router.route("/by-airline/:airlineId").get(getAircraftsByAirline);

export default router;