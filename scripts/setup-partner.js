#!/usr/bin/env node
/**
 * Partner Account Setup Script
 * Creates WISE² partner account with full admin/founder access
 * Usage: node scripts/setup-partner.js <email> [role]
 */

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

// Simple password hash (use actual bcrypt in production)
function simpleHash(password) {
  return crypto
    .createHash("sha256")
    .update(password + "wise2salt")
    .digest("hex");
}

async function setupPartner(email, role = "ADMIN") {
  try {
    console.log(`🚀 Setting up WISE² partner: ${email}`);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, name: true },
    });

    if (existingUser) {
      console.log(`✅ User already exists: ${email}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Current role: ${existingUser.role}`);

      // Update role if different
      if (existingUser.role !== role) {
        await prisma.user.update({
          where: { email },
          data: { role },
        });
        console.log(`✏️  Role updated to: ${role}`);
      } else {
        console.log(`\n✨ Partner is already set up with ${role} access`);
      }
      return existingUser;
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(16).toString("hex");
    const passwordHash = simpleHash(tempPassword);

    // Create user with partner role
    const user = await prisma.user.create({
      data: {
        email,
        name: "SenCere Partner",
        passwordHash,
        role, // ADMIN or FOUNDER
      },
    });

    console.log(`\n✅ Partner account created successfully!\n`);
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Role: ${role}`);
    console.log(`📱 ID: ${user.id}`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`⚠️  TEMPORARY PASSWORD (share securely):\n`);
    console.log(`   ${tempPassword}\n`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    console.log(
      `\n🔗 Login: https://command.wise2.net\n   Email: ${email}\n   Password: [temp password above]\n`
    );
    console.log(
      `💡 Partner should reset password after first login at:\n   https://command.wise2.net/settings/security\n`
    );

    console.log(`\n✨ Access Granted:`);
    console.log(`   ✅ BLAKKHAIL.COM storefront management`);
    console.log(`   ✅ WISE² Dashboard (command.wise2.net)`);
    console.log(`   ✅ Stripe payment integration`);
    console.log(`   ✅ Analytics & reporting`);
    console.log(`   ✅ Full admin/founder privileges\n`);

    return user;
  } catch (error) {
    console.error("\n❌ Error setting up partner:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup
const email = process.argv[2] || "sencere@wise2.net";
const role = process.argv[3] || "ADMIN";

setupPartner(email, role);
