const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Create Owner
    const owner = await prisma.user.upsert({
        where: { phone: '690000000' },
        update: {},
        create: {
            phone: '690000000',
            role: 'OWNER',
            trustScore: 80,
            listings: {
                create: {
                    title: 'Appartement Haut Standing Bonapriso',
                    description: 'Magnifique appartement 3 chambres, 2 douches, cuisine équipée, parking sécurisé.',
                    price: 250000,
                    neighborhood: 'Bonapriso',
                    city: 'Douala',
                    status: 'PAID',
                    images: '[]',
                },
            },
        },
    });
    console.log(`Created user with id: ${owner.id} (Owner)`);

    // Create Seeker
    const seeker = await prisma.user.upsert({
        where: { phone: '691111111' },
        update: {},
        create: {
            phone: '691111111',
            role: 'SEEKER',
            hasActivePass: false,
        },
    });
    console.log(`Created user with id: ${seeker.id} (Seeker)`);

    // Create Seeker with Pass
    const seekerWithPass = await prisma.user.upsert({
        where: { phone: '692222222' },
        update: {},
        create: {
            phone: '692222222',
            role: 'SEEKER',
            hasActivePass: true,
            passExpiry: new Date(new Date().setDate(new Date().getDate() + 30)),
        },
    });
    console.log(`Created user with id: ${seekerWithPass.id} (Seeker with Pass)`);

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
