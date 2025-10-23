-- CreateTable
CREATE TABLE "public"."TopicSubscription" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TopicSubscription_topic_idx" ON "public"."TopicSubscription"("topic");

-- CreateIndex
CREATE INDEX "TopicSubscription_subscriptionId_idx" ON "public"."TopicSubscription"("subscriptionId");

-- AddForeignKey
ALTER TABLE "public"."TopicSubscription" ADD CONSTRAINT "TopicSubscription_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."PushSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
