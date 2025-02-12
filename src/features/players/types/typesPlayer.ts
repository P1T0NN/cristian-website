// TYPES
import type { typesDebt } from '@/features/debt/types/typesDebt';
import type { typesBalance } from '@/features/balance/types/typesBalance';

export type PlayerType = 'regular' | 'temporary';

export interface typesUser {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    gender: string;
    emailVerified: boolean;
    isAdmin: boolean;
    playerDebt: number;
    cristianDebt: number;
    playerLevel: string;
    playerPosition: string;
    createdAt: Date;
    updatedAt: Date;
    dni: string;
    country: string;
    hasAccess: boolean;
    balance: number;
    verifyDocuments: boolean;
    debts?: typesDebt[];
    balances?: typesBalance[];
}