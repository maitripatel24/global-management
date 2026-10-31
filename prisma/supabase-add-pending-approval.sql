-- Run once in Supabase Dashboard -> SQL Editor on the existing database.
-- Adds the flag used to tell new self sign-ups apart from disabled employees.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pendingApproval" BOOLEAN NOT NULL DEFAULT false;
