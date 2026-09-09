import { Router, Request, Response } from 'express';
import { AttemptService } from '../services/AttemptService';

const router = Router();

// POST /api/attempts — create a new attempt (draft)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { learnerId, problemId } = req.body;
    if (!learnerId || !problemId) {
      return res.status(400).json({ error: 'learnerId and problemId are required.' });
    }
    const attempt = await AttemptService.createAttempt(learnerId, problemId);
    res.status(201).json({ attempt });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/attempts/:id/submit — submit an attempt
router.post('/:id/submit', async (req: Request, res: Response) => {
  try {
    const { learnerId, submission } = req.body;
    if (!learnerId || !submission?.type) {
      return res.status(400).json({ error: 'learnerId and submission.type are required.' });
    }
    const attempt = await AttemptService.submitAttempt(req.params['id'] as string, learnerId, submission);
    res.json({ attempt });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404
                 : err.message.includes('authorised') ? 403
                 : 400;
    res.status(status).json({ error: err.message });
  }
});

// GET /api/attempts/:id — get single attempt (includes result when ready)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const attempt = await AttemptService.getAttempt(req.params['id'] as string);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    res.json({ attempt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attempts?learnerId=&problemId= — history
router.get('/', async (req: Request, res: Response) => {
  try {
    const { learnerId, problemId } = req.query as { learnerId?: string; problemId?: string };
    if (!learnerId) {
      return res.status(400).json({ error: 'learnerId query param is required.' });
    }
    const attempts = problemId
      ? await AttemptService.getHistory(learnerId, problemId)
      : await AttemptService.getAllAttempts(learnerId);
    res.json({ attempts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
