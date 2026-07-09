import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  const school = await prisma.school.upsert({
    where: { domain: 'sunriseschool.in' },
    update: { name: 'Sunrise International School' },
    create: { name: 'Sunrise International School', domain: 'sunriseschool.in' },
  });

  const pwd = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@zibidubi.com' },
    update: { password: pwd },
    create: { name: 'Global Master Admin', email: 'superadmin@zibidubi.com', password: pwd, role: 'SUPER_ADMIN' },
  });

  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'admin@sunriseschool.in' },
    update: { password: pwd, schoolId: school.id },
    create: { name: 'Principal Sharma', email: 'admin@sunriseschool.in', password: pwd, role: 'SCHOOL_ADMIN', schoolId: school.id },
  });

  // Teacher — assigned to class "10A"
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@sunriseschool.in' },
    update: { password: pwd, schoolId: school.id },
    create: {
      name: 'John Doe',
      email: 'teacher@sunriseschool.in',
      password: pwd,
      role: 'TEACHER',
      schoolId: school.id,
    },
  });

  // Students — each has rollNo, standard
  const student1 = await prisma.user.upsert({
    where: { email: 'student@sunriseschool.in' },
    update: { password: pwd, schoolId: school.id, rollNo: '1', standard: '10A' },
    create: {
      name: 'Alex Smith',
      email: 'student@sunriseschool.in',
      password: pwd,
      role: 'STUDENT',
      schoolId: school.id,
      rollNo: '1',
      standard: '10A',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@sunriseschool.in' },
    update: { password: pwd, schoolId: school.id, rollNo: '2', standard: '10A' },
    create: {
      name: 'Priya Patel',
      email: 'student2@sunriseschool.in',
      password: pwd,
      role: 'STUDENT',
      schoolId: school.id,
      rollNo: '2',
      standard: '10A',
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'student3@sunriseschool.in' },
    update: { password: pwd, schoolId: school.id, rollNo: '1', standard: '9B' },
    create: {
      name: 'Rahul Mehta',
      email: 'student3@sunriseschool.in',
      password: pwd,
      role: 'STUDENT',
      schoolId: school.id,
      rollNo: '1',
      standard: '9B',
    },
  });

  console.log('\n==================================================');
  console.log('🎉 Database seeded!  Password for all: password123');
  console.log('==================================================');
  console.log(`Super Admin : ${superAdmin.email}`);
  console.log(`School Admin: ${schoolAdmin.email}`);
  console.log(`Teacher     : ${teacher.email}`);
  console.log(`Student 10A : ${student1.email} (Roll 1)`);
  console.log(`Student 10A : ${student2.email} (Roll 2)`);
  console.log(`Student 9B  : ${student3.email} (Roll 1)`);
  console.log('==================================================\n');
}

main()
  .catch(e => { console.error('❌ Seeding failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
