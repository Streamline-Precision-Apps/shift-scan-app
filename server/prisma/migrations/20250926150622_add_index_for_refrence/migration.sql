-- DropIndex
DROP INDEX "public"."Notification_topic_createdAt_idx";

-- CreateIndex
CREATE INDEX "Notification_topic_createdAt_referenceId_idx" ON "public"."Notification"("topic", "createdAt", "referenceId");
