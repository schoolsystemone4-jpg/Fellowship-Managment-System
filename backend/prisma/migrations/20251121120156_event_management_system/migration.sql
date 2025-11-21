/*
  Event Management System Migration
  
  Changes:
  - Renames Service table to Event with new fields
  - Updates Attendance and TransportBooking to reference Event
  - Creates GuestAttendance table
  - Migrates existing Service data to Event with defaults
*/

-- Step 1: Create Event table with all new fields
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "venue" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "allowGuestCheckin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- Step 2: Migrate data from Service to Event
INSERT INTO "Event" ("id", "name", "date", "startTime", "endTime", "type", "venue", "createdAt", "updatedAt")
SELECT 
    "id",
    COALESCE("name", "type"::TEXT) as "name",  -- Use name if exists, else use type
    "date",
    '09:00' as "startTime",  -- Default start time
    '21:00' as "endTime",    -- Default end time
    "type",
    NULL as "venue",
    "createdAt",
    "updatedAt"
FROM "Service";

-- Step 3: Add eventId to Attendance (temporarily nullable)
ALTER TABLE "Attendance" ADD COLUMN "eventId" TEXT;

-- Step 4: Update Attendance.eventId from serviceId
UPDATE "Attendance" SET "eventId" = "serviceId";

-- Step 5: Make eventId required and drop serviceId
ALTER TABLE "Attendance" ALTER COLUMN "eventId" SET NOT NULL;
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_serviceId_fkey";
DROP INDEX "Attendance_memberId_serviceId_key";
ALTER TABLE "Attendance" DROP COLUMN "serviceId";

-- Step 6: Rename checkInTime to checkedInAt
ALTER TABLE "Attendance" RENAME COLUMN "checkInTime" TO "checkedInAt";

-- Step 7: Add eventId to TransportBooking (temporarily nullable)
ALTER TABLE "TransportBooking" ADD COLUMN "eventId" TEXT;

-- Step 8: Update TransportBooking.eventId from serviceId
UPDATE "TransportBooking" SET "eventId" = "serviceId";

-- Step 9: Make eventId required and drop serviceId
ALTER TABLE "TransportBooking" ALTER COLUMN "eventId" SET NOT NULL;
ALTER TABLE "TransportBooking" DROP CONSTRAINT "TransportBooking_serviceId_fkey";
ALTER TABLE "TransportBooking" DROP COLUMN "serviceId";

-- Step 10: Rename createdAt to bookedAt in TransportBooking
ALTER TABLE "TransportBooking" RENAME COLUMN "createdAt" TO "bookedAt";

-- Step 11: Drop Service table (data already migrated)
DROP TABLE "Service";

-- Step 12: Create GuestAttendance table
CREATE TABLE "GuestAttendance" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestPhone" TEXT,
    "purpose" TEXT,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestAttendance_pkey" PRIMARY KEY ("id")
);

-- Step 13: Create unique indexes
CREATE UNIQUE INDEX "Attendance_memberId_eventId_key" ON "Attendance"("memberId", "eventId");
CREATE UNIQUE INDEX "TransportBooking_memberId_eventId_key" ON "TransportBooking"("memberId", "eventId");

-- Step 14: Add foreign keys
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransportBooking" ADD CONSTRAINT "TransportBooking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GuestAttendance" ADD CONSTRAINT "GuestAttendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
