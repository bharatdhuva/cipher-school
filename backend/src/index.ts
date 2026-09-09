import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './infrastructure/db';
import { seedProblems } from './seeds/seed';
import { EvaluationWorker } from './services/EvaluationWorker';
import problemsRouter from './routes/problems';
import attemptsRouter from './routes/attempts';

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '2mb' }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/problems', problemsRouter);
app.use('/api/attempts', attemptsRouter);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Boot ───────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 5000);

async function main(): Promise<void> {
  await connectDB();
  await seedProblems();

  const workerIntervalMs = Number(process.env.EVALUATION_WORKER_INTERVAL_MS ?? 3000);
  EvaluationWorker.start(workerIntervalMs);

  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] Health: http://localhost:${PORT}/health`);
    console.log(`[Server] Problems: http://localhost:${PORT}/api/problems`);
  });
}

main().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

export { app }; // for testing
