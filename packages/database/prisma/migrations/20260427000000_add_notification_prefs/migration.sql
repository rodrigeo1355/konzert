ALTER TABLE "User"
  ADD COLUMN "notifyEventAnnounced" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notifySaleOpened"     BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "unsubscribeToken"     TEXT;

CREATE UNIQUE INDEX "User_unsubscribeToken_key" ON "User"("unsubscribeToken");
