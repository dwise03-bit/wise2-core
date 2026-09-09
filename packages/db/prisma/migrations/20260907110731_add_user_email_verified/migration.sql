-- Add User.emailVerified
--
-- AuthService.verifyEmail() previously redeemed the verification token and
-- returned success without recording anything: no verification field existed
-- on the User model at all. This adds the column the flow needs.
--
-- Safe to apply to a populated table: the column is NOT NULL with a default,
-- so existing rows become false (unverified) rather than failing the migration.
-- Login does NOT gate on this column, so applying it does not lock anyone out.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
