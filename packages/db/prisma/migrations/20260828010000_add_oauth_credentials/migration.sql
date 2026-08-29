DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'oauth_provider_enum') THEN
    CREATE TYPE oauth_provider_enum AS ENUM ('google', 'github', 'microsoft');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "oauth_credentials" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "provider" oauth_provider_enum NOT NULL,
  "access_token" TEXT NOT NULL,
  "refresh_token" TEXT,
  "token_type" VARCHAR,
  "scopes" TEXT,
  "expires_at" TIMESTAMP NOT NULL,
  "provider_account_id" VARCHAR,
  "account_name" VARCHAR,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "last_used_at" TIMESTAMP,
  "error_message" VARCHAR,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "oauth_credentials_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "oauth_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_oauth_credentials_user_provider" ON "oauth_credentials"("user_id", "provider");
CREATE INDEX IF NOT EXISTS "idx_oauth_credentials_provider" ON "oauth_credentials"("provider");
CREATE INDEX IF NOT EXISTS "idx_oauth_credentials_expires_at" ON "oauth_credentials"("expires_at");
CREATE INDEX IF NOT EXISTS "idx_oauth_credentials_is_active" ON "oauth_credentials"("is_active");
