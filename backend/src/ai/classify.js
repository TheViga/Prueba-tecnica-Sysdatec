import { prisma } from '../db.js';
import { classifyTicket, isAiConfigured } from './llm.js';

// Run AI classification for a ticket and persist the result.
// The ai_status field tracks the lifecycle: pending -> processing -> done|failed.
// Any failure is caught and recorded so it never breaks the calling request.
export async function runClassification(ticketId) {
  // No API key configured: leave the ticket untouched (stays "pending").
  if (!isAiConfigured()) {
    return prisma.ticket.findUnique({ where: { id: ticketId } });
  }

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { aiStatus: 'processing' },
  });

  try {
    const result = await classifyTicket(ticket);
    return await prisma.ticket.update({
      where: { id: ticketId },
      data: { ...result, aiStatus: 'done' },
    });
  } catch (err) {
    console.error(`AI classification failed for ticket ${ticketId}:`, err.message);
    return prisma.ticket.update({
      where: { id: ticketId },
      data: { aiStatus: 'failed' },
    });
  }
}
