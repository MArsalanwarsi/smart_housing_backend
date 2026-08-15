import express from 'express';
import {
  getBills,
  payBill,
  generateVisitorPass,
  raiseComplaint
} from '../controllers/residentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(authMiddleware, roleMiddleware(['Resident']));

router.get('/bills', getBills);
router.post('/bills/:id/pay', payBill);
router.post('/visitor-pass', generateVisitorPass);
router.post('/complaints', upload.single('photo'), raiseComplaint);

export default router;
