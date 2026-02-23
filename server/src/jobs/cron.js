import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';

// Energy: 1 per 5 min, Nerve: 1 per 5 min
export function startCronJobs() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      await prisma.character.updateMany({
        where: {
          status: { not: 'jailed' },
        },
        data: {
          energy: { increment: 1 },
          nerve: { increment: 1 },
        },
      });
      // Cap at max
      await prisma.$executeRawUnsafe('UPDATE "Character" SET energy = "maxEnergy" WHERE energy > "maxEnergy"');
      await prisma.$executeRawUnsafe('UPDATE "Character" SET nerve = "maxNerve" WHERE nerve > "maxNerve"');
    } catch (err) {
      console.error('[CRON] Regeneration error:', err.message);
    }
  });

  // Release jailed / hospitalized players
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      await prisma.character.updateMany({
        where: {
          OR: [
            { jailedUntil: { lte: now } },
            { hospitalUntil: { lte: now } },
          ],
        },
        data: {
          status: 'okay',
          jailedUntil: null,
          hospitalUntil: null,
        },
      });
    } catch (err) {
      console.error('[CRON] Release error:', err.message);
    }
  });
}
