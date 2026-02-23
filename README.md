# SYNDICATE — Underground MMORPG

A text-based MMORPG web game inspired by Torn.com, built with React, Node.js, PostgreSQL, and Socket.io.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS (dark theme)
- **Backend**: Node.js + Express REST API
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT-based authentication
- **Real-time**: Socket.io for live notifications and chat

## Project Structure

```
syndicate/
├── client/          # React frontend
├── server/          # Express API + Prisma
├── HTML:THEME/      # Original HTML theme reference
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `server/.env.example` to `server/.env`
   - Set your `DATABASE_URL` (PostgreSQL connection string)
   - Set `JWT_SECRET` for auth

3. **Database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. **Run development servers**
   ```bash
   npm run dev
   ```

   - Client: http://localhost:5173
   - API: http://localhost:3001

## Game Systems

- **User & Character**: Stats, energy, nerve, happy, HP, XP, cash
- **Crime System**: Commit crimes, jail mechanic
- **Combat**: Attack other players, hospital
- **Items & Inventory**: Weapons, armor, drugs, marketplace
- **Factions**: Create/join gangs, faction wars
- **Travel**: Different cities
- **Education**: Courses for stat boosts
- **Properties**: Passive income
- **Casino**: Dice, slots, blackjack
- **Social**: Mail, chat, rankings, forums

## UI Theme

Dark urban crime aesthetic with:
- Colors: `#0a0a0b` bg, `#c9a84c` gold, `#e03c3c` red, `#3cba6e` green
- Fonts: Bebas Neue (headings), Share Tech Mono (stats), Inter (body)
- Scanline overlay, minimalist information-dense layout
