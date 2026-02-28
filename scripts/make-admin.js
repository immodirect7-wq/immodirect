const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'mbalanti25@gmail.com';
    const user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
    });
    console.log('✅ Compte mis à jour:', user.email, '→ rôle:', user.role);
}

main()
    .catch(e => console.error('❌ Erreur:', e.message))
    .finally(() => prisma.$disconnect());
