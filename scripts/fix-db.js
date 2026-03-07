const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fixing fabriceloic25@gmail.com pass manually...");
    const user = await prisma.user.update({
        where: { email: "fabriceloic25@gmail.com" },
        data: {
            hasActivePass: true,
            passExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    });
    console.log("Success! Pass expires:", user.passExpiry);
}
main().catch(console.error).finally(() => prisma.$disconnect());
