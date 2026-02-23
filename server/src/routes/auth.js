import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';

const router = Router();

// XP thresholds per level
const XP_PER_LEVEL = (level) => Math.floor(1000 * Math.pow(1.5, level - 1));

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('username').trim().isLength({ min: 2, max: 24 }).matches(/^[a-zA-Z0-9_]+$/),
    body('password').isLength({ min: 6 }),
    body('characterName').optional().trim().isLength({ min: 2, max: 24 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, username, password, characterName } = req.body;

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username: username.toLowerCase() }] },
      });
      if (existing) {
        return res.status(400).json({ error: 'Email or username already taken' });
      }

      const hash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          username: username.toLowerCase(),
          password: hash,
          character: {
            create: {
              name: characterName || username,
              energy: 100,
              maxEnergy: 100,
              nerve: 50,
              maxNerve: 50,
              happy: 100,
              maxHappy: 100,
              hp: 100,
              maxHp: 100,
            },
          },
        },
        include: { character: true },
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const char = user.character;
      return res.json({
        token,
        user: { id: user.id, email: user.email, username: user.username },
        character: {
          id: char.id,
          name: char.name,
          level: char.level,
          xp: char.xp,
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
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Registration failed' });
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { character: true },
      });
      if (!user || !user.character) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const char = user.character;
      return res.json({
        token,
        user: { id: user.id, email: user.email, username: user.username },
        character: {
          id: char.id,
          name: char.name,
          level: char.level,
          xp: char.xp,
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
          crimesCommitted: char.crimesCommitted,
          crimesSuccess: char.crimesSuccess,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Login failed' });
    }
  }
);

router.post('/refresh', async (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { character: true },
    });
    if (!user || !user.character) {
      return res.status(401).json({ error: 'User not found' });
    }
    const newToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const char = user.character;
    return res.json({
      token: newToken,
      character: {
        id: char.id,
        name: char.name,
        level: char.level,
        xp: char.xp,
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
      },
    });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
