import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Seed crimes (in production, load from DB)
const CRIMES = [
  { id: '1', name: 'Pickpocketing', desc: 'Lift a wallet from an unsuspecting mark.', tier: 1, nerve: 3, success: 0.92, minReward: 150, maxReward: 400, xp: 12, jailMins: 1 },
  { id: '2', name: 'Shoplifting', desc: 'Pocket small goods from local stores.', tier: 1, nerve: 4, success: 0.84, minReward: 200, maxReward: 600, xp: 18, jailMins: 2 },
  { id: '3', name: 'Mugging', desc: 'Threaten a civilian for their valuables.', tier: 2, nerve: 8, success: 0.71, minReward: 500, maxReward: 1200, xp: 35, jailMins: 5 },
  { id: '4', name: 'Car Theft', desc: 'Steal and sell a vehicle on the black market.', tier: 2, nerve: 10, success: 0.64, minReward: 800, maxReward: 2400, xp: 55, jailMins: 8 },
  { id: '5', name: 'Grand Theft', desc: 'Hit a high-value target. Big risk, big reward.', tier: 3, nerve: 18, success: 0.48, minReward: 2000, maxReward: 6000, xp: 120, jailMins: 20 },
  { id: '6', name: 'Bank Fraud', desc: 'Siphon funds through shell accounts.', tier: 4, nerve: 25, success: 0.35, minReward: 5000, maxReward: 15000, xp: 250, jailMins: 45, minLevel: 8 },
  { id: '7', name: 'Assassination', desc: 'Eliminate a high-profile target for hire.', tier: 5, nerve: 40, success: 0.22, minReward: 12000, maxReward: 40000, xp: 500, jailMins: 120, minLevel: 15 },
];

router.use(requireAuth);

router.get('/list', (_, res) => {
  return res.json({ crimes: CRIMES });
});

router.post('/commit/:crimeId', async (req, res) => {
  const { crimeId } = req.params;
  const char = req.character;
  const io = req.app.get('io');

  const crime = CRIMES.find((c) => c.id === crimeId);
  if (!crime) return res.status(404).json({ error: 'Crime not found' });

  if (char.status === 'jailed' || char.status === 'hospital' || char.status === 'traveling') {
    return res.status(400).json({ error: 'You cannot commit crimes in your current state' });
  }
  if (char.nerve < crime.nerve) {
    return res.status(400).json({ error: `Need ${crime.nerve} nerve (you have ${char.nerve})` });
  }
  if ((crime.minLevel || 1) > char.level) {
    return res.status(400).json({ error: `Requires level ${crime.minLevel}` });
  }

  const success = Math.random() < crime.success;
  const cashEarned = success ? Math.floor(Math.random() * (crime.maxReward - crime.minReward + 1)) + crime.minReward : 0;
  const xpEarned = success ? crime.xp + Math.floor(Math.random() * 10) : 0;
  const jailed = !success;
  const jailUntil = jailed ? new Date(Date.now() + crime.jailMins * 60 * 1000) : null;

  const updated = await prisma.character.update({
    where: { id: char.id },
    data: {
      nerve: Math.max(0, char.nerve - crime.nerve),
      cash: char.cash + cashEarned,
      xp: char.xp + xpEarned,
      crimesCommitted: char.crimesCommitted + 1,
      crimesSuccess: success ? char.crimesSuccess + 1 : char.crimesSuccess,
      status: jailed ? 'jailed' : char.status,
      jailedUntil: jailUntil || char.jailedUntil,
    },
  });

  // Level up check
  const xpForNext = Math.floor(1000 * Math.pow(1.5, updated.level));
  let finalChar = updated;
  if (updated.xp >= xpForNext) {
    finalChar = await prisma.character.update({
      where: { id: char.id },
      data: { level: updated.level + 1, xp: updated.xp - xpForNext },
    });
  }

  // Store crime in DB if Crime model exists
  try {
    const dbCrime = await prisma.crime.findFirst({ where: { name: crime.name } });
    if (dbCrime) {
      await prisma.crimeLog.create({
        data: {
          characterId: char.id,
          crimeId: dbCrime.id,
          success,
          cashEarned,
          xpEarned,
          jailed,
        },
      });
    }
  } catch (_) {}

  if (io) {
    io.to(`user:${req.user.id}`).emit('notification', {
      type: success ? 'crime_success' : 'crime_fail',
      title: success ? 'Crime successful' : 'Caught',
      content: success ? `+$${cashEarned.toLocaleString()} · +${xpEarned} XP` : `Jailed for ${crime.jailMins} minutes`,
    });
  }

  return res.json({
    success,
    cash: cashEarned,
    xp: xpEarned,
    jailed,
    jailMinutes: crime.jailMins,
    character: {
      nerve: finalChar.nerve,
      cash: finalChar.cash,
      xp: finalChar.xp,
      level: finalChar.level,
      status: finalChar.status,
      jailedUntil: finalChar.jailedUntil,
    },
  });
});

export default router;
