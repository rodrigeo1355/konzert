-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enums
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REJECTED');
CREATE TYPE "SaleStatus" AS ENUM ('UPCOMING', 'ON_SALE', 'SOLD_OUT');
CREATE TYPE "Platform" AS ENUM ('PUNTOTICKET', 'TICKETMASTER', 'PASSLINE', 'EVENTBRITE', 'OTHER');
CREATE TYPE "ScraperStatus" AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED');
CREATE TYPE "NotificationType" AS ENUM ('EVENT_ANNOUNCED', 'SALE_OPENED');

-- User
CREATE TABLE "User" (
    "id"               TEXT NOT NULL,
    "email"            TEXT NOT NULL,
    "passwordHash"     TEXT NOT NULL,
    "role"             "Role" NOT NULL DEFAULT 'USER',
    "status"           "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified"    TIMESTAMP(3),
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil"      TIMESTAMP(3),
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    "deletedAt"        TIMESTAMP(3),
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- Session
CREATE TABLE "Session" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "token"     TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- PasswordReset
CREATE TABLE "PasswordReset" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "token"     TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");
CREATE INDEX "PasswordReset_token_idx" ON "PasswordReset"("token");

-- Artist
CREATE TABLE "Artist" (
    "id"             TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "nameNormalized" TEXT NOT NULL,
    "imageUrl"       TEXT,
    "spotifyId"      TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Artist_spotifyId_key" ON "Artist"("spotifyId");
CREATE INDEX "Artist_nameNormalized_idx" ON "Artist"("nameNormalized");

-- UserArtist
CREATE TABLE "UserArtist" (
    "userId"    TEXT NOT NULL,
    "artistId"  TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserArtist_pkey" PRIMARY KEY ("userId", "artistId")
);
CREATE INDEX "UserArtist_userId_idx" ON "UserArtist"("userId");

-- Venue (con columna PostGIS)
CREATE TABLE "Venue" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "address"   TEXT NOT NULL,
    "city"      TEXT NOT NULL DEFAULT 'Santiago',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Venue" ADD COLUMN "location" geometry(Point, 4326);
CREATE INDEX "Venue_name_idx" ON "Venue"("name");
CREATE INDEX "Venue_location_idx" ON "Venue" USING GIST ("location");

-- Event
CREATE TABLE "Event" (
    "id"             TEXT NOT NULL,
    "title"          TEXT NOT NULL,
    "description"    TEXT,
    "imageUrl"       TEXT,
    "dateStart"      TIMESTAMP(3) NOT NULL,
    "dateEnd"        TIMESTAMP(3),
    "venueId"        TEXT NOT NULL,
    "status"         "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "saleStatus"     "SaleStatus" NOT NULL DEFAULT 'UPCOMING',
    "priceMin"       INTEGER,
    "priceMax"       INTEGER,
    "manuallyEdited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Event_status_dateStart_idx" ON "Event"("status", "dateStart");
CREATE INDEX "Event_venueId_idx" ON "Event"("venueId");

-- EventArtist
CREATE TABLE "EventArtist" (
    "eventId"    TEXT NOT NULL,
    "artistId"   TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventArtist_pkey" PRIMARY KEY ("eventId", "artistId")
);

-- EventPlatform
CREATE TABLE "EventPlatform" (
    "id"        TEXT NOT NULL,
    "eventId"   TEXT NOT NULL,
    "platform"  "Platform" NOT NULL,
    "ticketUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EventPlatform_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EventPlatform_eventId_platform_key" ON "EventPlatform"("eventId", "platform");

-- ScraperRun
CREATE TABLE "ScraperRun" (
    "id"            TEXT NOT NULL,
    "platform"      TEXT NOT NULL,
    "status"        "ScraperStatus" NOT NULL,
    "eventsNew"     INTEGER NOT NULL DEFAULT 0,
    "eventsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errorMessage"  TEXT,
    "durationMs"    INTEGER,
    "startedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt"    TIMESTAMP(3),
    CONSTRAINT "ScraperRun_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ScraperRun_platform_startedAt_idx" ON "ScraperRun"("platform", "startedAt");

-- Notification
CREATE TABLE "Notification" (
    "id"      TEXT NOT NULL,
    "userId"  TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type"    "NotificationType" NOT NULL,
    "sentAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Notification_userId_eventId_type_key" ON "Notification"("userId", "eventId", "type");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AuditLog
CREATE TABLE "AuditLog" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "action"     TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId"   TEXT NOT NULL,
    "metadata"   JSONB,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- Foreign Keys
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserArtist" ADD CONSTRAINT "UserArtist_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserArtist" ADD CONSTRAINT "UserArtist_artistId_fkey"
    FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Event" ADD CONSTRAINT "Event_venueId_fkey"
    FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON UPDATE CASCADE;

ALTER TABLE "EventArtist" ADD CONSTRAINT "EventArtist_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventArtist" ADD CONSTRAINT "EventArtist_artistId_fkey"
    FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventPlatform" ADD CONSTRAINT "EventPlatform_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON UPDATE CASCADE;
