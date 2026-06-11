import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

const router = Router();

// Wrap async handlers so thrown/rejected errors reach the error middleware.
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ---- Validation schemas -------------------------------------------------

const createTicketSchema = z.object({
  customerName: z.string().trim().min(1, 'customerName is required'),
  requestText: z.string().trim().min(1, 'requestText is required'),
  attachmentUrl: z
    .string()
    .trim()
    .url('attachmentUrl must be a valid URL')
    .optional()
    .or(z.literal('')),
});

const updateTicketSchema = z
  .object({
    status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).optional(),
    owner: z.string().trim().min(1).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update (status or owner)',
  });

const commentSchema = z.object({
  author: z.string().trim().min(1, 'author is required'),
  body: z.string().trim().min(1, 'body is required'),
});

// ---- Routes -------------------------------------------------------------

// Create a ticket
router.post(
  '/',
  wrap(async (req, res) => {
    const data = createTicketSchema.parse(req.body);
    const ticket = await prisma.ticket.create({
      data: {
        customerName: data.customerName,
        requestText: data.requestText,
        attachmentUrl: data.attachmentUrl || null,
      },
    });
    res.status(201).json(ticket);
  })
);

// List all tickets (dashboard)
router.get(
  '/',
  wrap(async (_req, res) => {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(tickets);
  })
);

// Get a single ticket with its comments (detail view)
router.get(
  '/:id',
  wrap(async (req, res) => {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  })
);

// Update status / owner
router.patch(
  '/:id',
  wrap(async (req, res) => {
    const data = updateTicketSchema.parse(req.body);
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data,
    });
    res.json(ticket);
  })
);

// Add a comment to a ticket
router.post(
  '/:id/comments',
  wrap(async (req, res) => {
    const data = commentSchema.parse(req.body);

    // Ensure the ticket exists before creating the comment.
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const comment = await prisma.comment.create({
      data: { ticketId: req.params.id, author: data.author, body: data.body },
    });
    res.status(201).json(comment);
  })
);

export default router;
