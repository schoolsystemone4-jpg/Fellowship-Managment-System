import { PrismaClient, Role, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    const email = 'manager@fellowship.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await prisma.member.upsert({
        where: { email },
        update: {},
        create: {
            fullName: 'Fellowship Manager',
            email,
            phoneNumber: '0700000000',
            password: hashedPassword,
            role: Role.FELLOWSHIP_MANAGER,
            fellowshipNumber: 'AAA000', // Special number for the first manager
            gender: Gender.MALE,
            qrCode: uuidv4(),
        },
    });

    console.log({ manager });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
