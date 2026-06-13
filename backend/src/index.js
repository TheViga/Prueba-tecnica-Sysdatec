import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ZodError } from 'zod';

import ticketsRouter from './routes/tickets.js';
import agentsRouter from './routes/agents.js';
import { seedAgents } from './seed.js';

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-ticket-workspace-backend' });
});

app.use('/api/tickets', ticketsRouter);
app.use('/api/agents', agentsRouter);

// 404 for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: 'Validation failed', details: err.errors });
  }
  // Prisma "record not found" on update/delete
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

// Make sure the support team is in place before the first assignment.
seedAgents().catch((err) => console.error('Agent seed failed:', err.message));
