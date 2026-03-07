const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const transactions = await prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: true }
    });
    console.log("Recent transactions:");
    console.log(JSON.stringify(transactions, null, 2));

    // Also check the specific user's pass status
    const latestTx = transactions[0];
    if (latestTx && latestTx.userId) {
        const user = await prisma.user.findUnique({ where: { id: latestTx.userId } });
        console.log("\nUser pass status for", user.email, ":");
        console.log("hasActivePass:", user.hasActivePass);
        console.log("passExpiry:", user.passExpiry);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
