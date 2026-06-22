// seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Upsert dummy school (checks unique domain)
  const school = await prisma.school.upsert({
    where: { domain: "sunriseschool.in" },
    update: { name: "Sunrise International School" },
    create: {
      name: "Sunrise International School",
      domain: "sunriseschool.in"
    }
  });

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 2. Upsert Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@zibidubi.com" },
    update: { password: hashedPassword },
    create: {
      name: "Global Master Admin",
      email: "superadmin@zibidubi.com",
      password: hashedPassword,
      role: "SUPER_ADMIN"
    }
  });

  // 3. Upsert School Admin
  const schoolAdmin = await prisma.user.upsert({
    where: { email: "admin@sunriseschool.in" },
    update: { password: hashedPassword, schoolId: school.id },
    create: {
      name: "Principal Sharma",
      email: "admin@sunriseschool.in",
      password: hashedPassword,
      role: "SCHOOL_ADMIN",
      schoolId: school.id
    }
  });

  // 4. Upsert Teacher / Staff
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@sunriseschool.in" },
    update: { password: hashedPassword, schoolId: school.id },
    create: {
      name: "John Doe",
      email: "teacher@sunriseschool.in",
      password: hashedPassword,
      role: "TEACHER",
      schoolId: school.id
    }
  });

  // 5. Upsert Student
  const student = await prisma.user.upsert({
    where: { email: "student@sunriseschool.in" },
    update: { password: hashedPassword, schoolId: school.id },
    create: {
      name: "Alex Smith",
      email: "student@sunriseschool.in",
      password: hashedPassword,
      role: "STUDENT",
      schoolId: school.id
    }
  });

  console.log("\n==================================================");
  console.log("🎉 Database synchronized successfully!");
  console.log("🔒 Common Password for all accounts: password123");
  console.log("==================================================");
  console.log(`1. Super Admin:  ${superAdmin.email}`);
  console.log(`2. School Admin: ${schoolAdmin.email}`);
  console.log(`3. Teacher:      ${teacher.email}`);
  console.log(`4. Student:      ${student.email}`);
  console.log("==================================================\n");
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });