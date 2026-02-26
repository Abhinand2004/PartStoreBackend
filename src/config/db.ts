import pkg from '@prisma/client';
const { PrismaClient } = pkg;

console.log('[db.js] Initializing Standard Prisma Client...');

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log('[db.js] Prisma connected successfully!'))
  .catch((err: any) => {
    console.error('[db.js] Prisma connection failed:', err.message);
  });

export default prisma;
