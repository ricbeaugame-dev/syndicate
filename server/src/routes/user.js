import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/profile', async (req, res) => {
  const char = req.character;
  const xpForNext = Math.floor(1000 * Math.pow(1.5, char.level));
  return res.json({
    character: {
      id: char.id,
      name: char.name,
      level: char.level,
      xp: char.xp,
      xpForNext,
      energy: char.energy,
      maxEnergy: char.maxEnergy,
      nerve: char.nerve,
      maxNerve: char.maxNerve,
      happy: char.happy,
      maxHappy: char.maxHappy,
      hp: char.hp,
      maxHp: char.maxHp,
      cash: char.cash,
      bank: char.bank,
      strength: char.strength,
      defense: char.defense,
      speed: char.speed,
      dexterity: char.dexterity,
      intelligence: char.intelligence,
      kills: char.kills,
      deaths: char.deaths,
      attacksWon: char.attacksWon,
      crimesCommitted: char.crimesCommitted,
      crimesSuccess: char.crimesSuccess,
      status: char.status,
      currentCity: char.currentCity,
    },
  });
});

export default router;
