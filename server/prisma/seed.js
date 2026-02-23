import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CRIMES = [
  { name: 'Pickpocketing', description: 'Lift a wallet from an unsuspecting mark.', tier: 1, nerveCost: 3, successChance: 0.92, minReward: 150, maxReward: 400, xpReward: 12, jailMinutes: 1 },
  { name: 'Shoplifting', description: 'Pocket small goods from local stores.', tier: 1, nerveCost: 4, successChance: 0.84, minReward: 200, maxReward: 600, xpReward: 18, jailMinutes: 2 },
  { name: 'Mugging', description: 'Threaten a civilian for their valuables.', tier: 2, nerveCost: 8, successChance: 0.71, minReward: 500, maxReward: 1200, xpReward: 35, jailMinutes: 5 },
  { name: 'Car Theft', description: 'Steal and sell a vehicle on the black market.', tier: 2, nerveCost: 10, successChance: 0.64, minReward: 800, maxReward: 2400, xpReward: 55, jailMinutes: 8 },
  { name: 'Grand Theft', description: 'Hit a high-value target. Big risk, big reward.', tier: 3, nerveCost: 18, successChance: 0.48, minReward: 2000, maxReward: 6000, xpReward: 120, jailMinutes: 20 },
  { name: 'Bank Fraud', description: 'Siphon funds through shell accounts.', tier: 4, nerveCost: 25, successChance: 0.35, minReward: 5000, maxReward: 15000, xpReward: 250, jailMinutes: 45, minLevel: 8 },
  { name: 'Assassination', description: 'Eliminate a high-profile target for hire.', tier: 5, nerveCost: 40, successChance: 0.22, minReward: 12000, maxReward: 40000, xpReward: 500, jailMinutes: 120, minLevel: 15 },
];

async function main() {
  for (const crime of CRIMES) {
    await prisma.crime.upsert({
      where: { name: crime.name },
      update: {},
      create: crime,
    });
  }

  const hash = await bcrypt.hash('demo123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@syndicate.game' },
    update: {},
    create: {
      email: 'demo@syndicate.game',
      username: 'demo',
      password: hash,
      character: {
        create: {
          name: 'Demo_Player',
          cash: 10000,
          energy: 80,
          nerve: 40,
        },
      },
    },
    include: { character: true },
  });

  console.log('Seeded crimes and demo user:', user.username);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
