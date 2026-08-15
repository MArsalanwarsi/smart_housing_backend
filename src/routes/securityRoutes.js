import express from 'express';
import {
  verifyPass,
  logWalkInVisitor,
  getActiveVisitors
} from '../controllers/securityController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware, roleMiddleware(['Guard']));

router.post('/verify-pass', verifyPass);
router.post('/walk-in', logWalkInVisitor);
router.get('/active-visitors', getActiveVisitors);

export default router;
