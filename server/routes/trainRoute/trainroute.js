import express from 'express'
import { addCoach, createTrain, deleteTrain, editTrain, getAllTrains, getChoiceTrains, getStationSuggestions, getTrainById, removeCoach, removeRoute, removeSubCoach, updateCoach } from '../../controller/trainController/trainController.js';
import { adminOnly } from '../../middleware/isAdmin.js';
import { isAuthenticated } from '../../middleware/isAuthenticated.js';

const router = express.Router();

router.route('/create-train').post(isAuthenticated,adminOnly,createTrain );
router.route('/edit-train/:id').put(isAuthenticated,adminOnly,editTrain);
router.route('/delete-train/:id').delete(isAuthenticated,adminOnly,deleteTrain);
router.route('/get-Alltrains').get(getAllTrains);
router.route('/delete-route/:trainId/:routeId').delete(isAuthenticated,adminOnly,removeRoute);
router.route('/add-coach/:id').post(isAuthenticated,adminOnly,addCoach);
router.route('/update-coach/:trainId/:coachId').put(isAuthenticated,adminOnly,updateCoach);
router.route('/remove-coach/:trainId/:coachId').delete(isAuthenticated,adminOnly,removeCoach);
router.route('/remove-subcoach/:trainId/:coachId/:coachNameId').delete(isAuthenticated,adminOnly,removeSubCoach);
router.route('/get-choicetrains').get(getChoiceTrains);
router.route('/get-train/:id').get(getTrainById);
router.get("/stations", getStationSuggestions);




export default router;