import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateFellowshipNumber = async (): Promise<string> => {
    // Find the last member with a fellowship number
    const lastMember = await prisma.member.findFirst({
        orderBy: {
            fellowshipNumber: 'desc',
        },
        select: {
            fellowshipNumber: true,
        },
    });

    if (!lastMember) {
        return 'AAA001';
    }

    const lastNumber = lastMember.fellowshipNumber;
    const letters = lastNumber.substring(0, 3);
    const digits = parseInt(lastNumber.substring(3));

    if (digits < 999) {
        return `${letters}${String(digits + 1).padStart(3, '0')}`;
    } else {
        // Increment letters
        let newLetters = letters.split('');
        let carry = true;

        for (let i = 2; i >= 0; i--) {
            if (carry) {
                if (newLetters[i] === 'Z') {
                    newLetters[i] = 'A';
                    carry = true;
                } else {
                    newLetters[i] = String.fromCharCode(newLetters[i].charCodeAt(0) + 1);
                    carry = false;
                }
            }
        }

        return `${newLetters.join('')}001`;
    }
};
