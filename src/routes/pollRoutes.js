import express from 'express';
import { votePoll, getPollResults } from '../controllers/pollController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/:id/vote', votePoll);
router.get('/:id/results', getPollResults);

export default router;
