-- Create TeacherAttendance table (teacher self check-in, one row per teacher per day)
CREATE TABLE IF NOT EXISTS "TeacherAttendance" (
  "id"          SERIAL PRIMARY KEY,
  "schoolId"    INTEGER NOT NULL,
  "teacherId"   INTEGER NOT NULL,
  "date"        TIMESTAMP(3) NOT NULL,
  "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unique: one check-in per teacher per day
ALTER TABLE "TeacherAttendance" DROP CONSTRAINT IF EXISTS "TeacherAttendance_teacherId_date_key";
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_teacherId_date_key" UNIQUE ("teacherId", "date");

-- Foreign keys
ALTER TABLE "TeacherAttendance" DROP CONSTRAINT IF EXISTS "TeacherAttendance_schoolId_fkey";
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE;

ALTER TABLE "TeacherAttendance" DROP CONSTRAINT IF EXISTS "TeacherAttendance_teacherId_fkey";
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE;
