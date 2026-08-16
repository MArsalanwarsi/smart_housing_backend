import express from 'express';
import {
  createFlat,
  getFlats,
  onboardResident,
  getResidents,
  generateBills,
  getBills,
  broadcastNotice,
  getNotices,
  getComplaints,
  updateComplaintStatus,
  getVisitorLogs,
  getFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
  getPollsAdmin,
  createPoll,
  updatePoll,
  getEmergencies,
  createEmergency,
  updateEmergency
} from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware, roleMiddleware(['Admin']));

router.post('/flat', createFlat);
router.get('/flats', getFlats);

router.post('/resident', onboardResident);
router.get('/residents', getResidents);

router.post('/bills', generateBills);
router.get('/bills', getBills);

router.post('/notice', broadcastNotice);
router.get('/notices', getNotices);

router.get('/complaints', getComplaints);
router.patch('/complaints/:id', updateComplaintStatus);

router.get('/visitor-logs', getVisitorLogs);

router.get('/facilities', getFacilities);
router.post('/facility', createFacility);
router.patch('/facility/:id', updateFacility);
router.delete('/facility/:id', deleteFacility);

router.get('/polls', getPollsAdmin);
router.post('/poll', createPoll);
router.patch('/poll/:id', updatePoll);

router.get('/emergencies', getEmergencies);
router.post('/emergency', createEmergency);
router.patch('/emergency/:id', updateEmergency);

export default router;
