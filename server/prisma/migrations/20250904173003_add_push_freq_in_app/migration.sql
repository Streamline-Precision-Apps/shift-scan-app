-- AlterTable
ALTER TABLE "public"."TopicSubscription" ADD COLUMN     "frequency" TEXT NOT NULL DEFAULT 'immediate',
ADD COLUMN     "inApp" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "push" BOOLEAN NOT NULL DEFAULT true;
