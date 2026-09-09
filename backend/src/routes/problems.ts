import { Router, Request, Response } from 'express';
import { ProblemRepository } from '../infrastructure/ProblemRepository';

const router = Router();

// GET /api/problems — list all problems
router.get('/', async (_req: Request, res: Response) => {
  try {
    const problems = await ProblemRepository.findAll();
    res.json({ problems });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/problems/:id — get single problem
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const problem = await ProblemRepository.findById(req.params['id'] as string);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json({ problem });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
