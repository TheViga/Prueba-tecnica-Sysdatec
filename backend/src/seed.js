import { prisma } from './db.js';

// The default support team available to own tickets.
const AGENTS = [
  { name: 'Santiago Rodríguez', email: 'santiago.rodriguez@triage.co' },
  { name: 'Valentina Gómez', email: 'valentina.gomez@triage.co' },
  { name: 'Andrés Martínez', email: 'andres.martinez@triage.co' },
  { name: 'Daniela Ramírez', email: 'daniela.ramirez@triage.co' },
  { name: 'Camilo Hernández', email: 'camilo.hernandez@triage.co' },
];

// Ensure the support team exists. Idempotent: safe to run on every boot.
export async function seedAgents() {
  const count = await prisma.agent.count();
  if (count > 0) return;
  await prisma.agent.createMany({ data: AGENTS });
  console.log(`Seeded ${AGENTS.length} agents.`);
}
