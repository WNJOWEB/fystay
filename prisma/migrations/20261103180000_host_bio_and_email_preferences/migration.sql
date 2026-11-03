-- Additive only: a host's public "about me" and three optional-email switches (all default on).
ALTER TABLE "User" ADD COLUMN "hostBio" TEXT;
ALTER TABLE "User" ADD COLUMN "emailArrivalReminders" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "emailReviewRequests" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "emailTripOffers" BOOLEAN NOT NULL DEFAULT true;
