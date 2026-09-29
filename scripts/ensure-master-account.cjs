/**
 * Upsert the WISE² master account (FOUNDER + OWNER of the default tenant).
 *
 * Usage:
 *   MASTER_ACCOUNT_PASSWORD='...' node scripts/ensure-master-account.cjs
 *
 * Does not print the password.
 */
const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

const apiRequire = createRequire(path.join(__dirname, '../packages/api/package.json'));
const { PrismaClient } = apiRequire('@prisma/client');
const bcrypt = apiRequire('bcrypt');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath) || process.env.DATABASE_URL) return;
  const contents = fs.readFileSync(filePath, 'utf8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(__dirname, '../packages/db/.env'));
loadEnvFile(path.join(__dirname, '../.env'));
loadEnvFile(path.join(__dirname, '../.env.local'));

const MASTER_EMAIL = 'dwise03@gmail.com';
const MASTER_NAME = 'Daniel Wise';
const TENANT_SLUG = (process.env.MASTER_TENANT_SLUG || 'wise2').trim();
const TENANT_NAME = (process.env.MASTER_TENANT_NAME || 'WISE²').trim();

async function main() {
  const password = process.env.MASTER_ACCOUNT_PASSWORD;
  if (!password || password.length < 8) {
    console.error('MASTER_ACCOUNT_PASSWORD is required (min 8 characters).');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email: MASTER_EMAIL },
      update: {
        name: MASTER_NAME,
        passwordHash,
        role: 'FOUNDER',
      },
      create: {
        email: MASTER_EMAIL,
        name: MASTER_NAME,
        passwordHash,
        role: 'FOUNDER',
      },
    });

    let tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          slug: TENANT_SLUG,
          name: TENANT_NAME,
          vertical: 'platform',
          state: 'ACTIVE',
          enabledModules: ['crm', 'jobs', 'ai', 'ai_phone', 'cloud'],
          onboardingStep: 5,
          onboardingCompletedAt: new Date(),
        },
      });
    } else if (tenant.state !== 'ACTIVE') {
      tenant = await prisma.tenant.update({
        where: { id: tenant.id },
        data: { state: 'ACTIVE' },
      });
    }

    await prisma.tenantMembership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: { role: 'OWNER' },
      create: { tenantId: tenant.id, userId: user.id, role: 'OWNER' },
    });

    console.log(`Master account ready: ${user.email} (FOUNDER)`);
    console.log(`Workspace: ${tenant.slug} (${tenant.id}) OWNER`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
