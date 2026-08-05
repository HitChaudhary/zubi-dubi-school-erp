-- Add rollNo and standard to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rollNo" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "standard" TEXT;

-- Add standard to Meeting (which class this meeting is for)
ALTER TABLE "Meeting" ADD COLUMN IF NOT EXISTS "standard" TEXT;

-- Create AttendanceStatus enum
DO $$ BEGIN
  CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create Attendance table
CREATE TABLE IF NOT EXISTS "Attendance" (
  "id"        SERIAL PRIMARY KEY,
  "schoolId"  INTEGER NOT NULL,
  "teacherId" INTEGER NOT NULL,
  "studentId" INTEGER NOT NULL,
  "standard"  TEXT NOT NULL,
  "date"      TIMESTAMP(3) NOT NULL,
  "status"    "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- Unique: one record per student per day
ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_studentId_date_key";
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_date_key" UNIQUE ("studentId", "date");

-- Foreign keys
ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_schoolId_fkey";
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE;

ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_teacherId_fkey";
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_studentId_fkey";
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE;
