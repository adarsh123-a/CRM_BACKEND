-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "customer" TEXT;

-- AlterTable
ALTER TABLE "LeadHistory" ADD COLUMN     "meetingDetails" TEXT;
