import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { character: true },
    });
    if (!user || !user.character) {
      return res.status(401).json({ error: 'User or character not found' });
    }
    req.user = user;
    req.character = user.character;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
