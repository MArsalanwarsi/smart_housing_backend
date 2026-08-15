import express from 'express';
import {
  createFlat,
  onboardResident,
  generateBills,
  broadcastNotice
} from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware, roleMiddleware(['Admin']));

router.post('/flat', createFlat);
router.post('/resident', onboardResident);
router.post('/bills', generateBills);
router.post('/notice', broadcastNotice);

export default router;
