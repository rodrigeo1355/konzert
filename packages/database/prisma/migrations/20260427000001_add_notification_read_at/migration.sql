ALTER TABLE "Notification" ADD COLUMN "readAt" TIMESTAMP(3);

CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
