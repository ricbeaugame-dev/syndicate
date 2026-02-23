import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import crimesRoutes from './routes/crimes.js';
import { startCronJobs } from './jobs/cron.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' },
});

app.set('io', io);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/crimes', crimesRoutes);

// Health
app.get('/api/health', (_, res) => res.json({ ok: true }));

// Socket connection
io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId;
  if (userId) {
    socket.join(`user:${userId}`);
  }
  socket.on('disconnect', () => {});
});

// Start cron jobs (energy, nerve regen, etc.)
startCronJobs();

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[SYNDICATE] Server running on port ${PORT}`);
});
