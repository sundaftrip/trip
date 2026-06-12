const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  console.log("Users yang ada:");
  users.forEach(u => console.log(` - ${u.email} (${u.name})`));

  // Password wajib lewat env — jangan pakai password default yang tertulis di repo publik.
  const newPassword = process.env.RESET_PASSWORD;
  if (!newPassword || newPassword.length < 8) {
    console.error("✗ Set env RESET_PASSWORD (min 8 karakter) dulu. Contoh: RESET_PASSWORD='...' node scripts/reset-password.js");
    process.exit(1);
  }
  const hash = await bcrypt.hash(newPassword, 12);
  const result = await prisma.user.updateMany({ data: { password: hash } });
  console.log(`\n✓ Password semua user direset (nilai dari env RESET_PASSWORD)`);
  console.log(`  Total: ${result.count} user`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
