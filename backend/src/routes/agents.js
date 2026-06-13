import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// Wrap async handlers so thrown/rejected errors reach the error middleware.
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/agents — the support team available to own tickets.
router.get(
  '/',
  wrap(async (_req, res) => {
    const agents = await prisma.agent.findMany({ orderBy: { name: 'asc' } });
    res.json(agents);
  })
);

export default router;
