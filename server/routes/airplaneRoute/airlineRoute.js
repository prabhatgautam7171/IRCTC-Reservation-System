import express from 'express';
import { createAirline, deleteAirline, getAllAirlines, updateAirline } from '../../controller/airplaneController/airlineController.js';
import { upload } from '../../middleware/multer.js';


const router = express.Router();

router.route('/create-airline').post(upload.single('logo'),createAirline);
router.route("/update-airline/:id").put(upload.single('logo'),updateAirline);
router.route("/delete-airline/:id").delete(deleteAirline);
router.route('/get-allAirlines').get(getAllAirlines);

export default router;