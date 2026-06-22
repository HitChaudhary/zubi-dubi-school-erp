import { PrismaClient } from '@prisma/client';

// Single shared Prisma instance used across all controllers
const prisma = new PrismaClient();

export default prisma;
