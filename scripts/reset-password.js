const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  console.log("Users yang ada:");
  users.forEach(u => console.log(` - ${u.email} (${u.name})`));

  const hash = await bcrypt.hash("Admin2025!", 12);
  const result = await prisma.user.updateMany({ data: { password: hash } });
  console.log(`\n✓ Password semua user direset ke: Admin2025!`);
  console.log(`  Total: ${result.count} user`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
