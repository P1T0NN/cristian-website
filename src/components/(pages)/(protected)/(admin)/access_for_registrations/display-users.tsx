// NEXTJS IMPORTS
import { cookies } from 'next/headers';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UpdatePlayerLevel } from './update-player-level';
import { GrantUserAccessButton } from './grant-user-access-button';
import { DenyUserAccessButton } from './deny-user-access-button';

// TYPES
import type { typesUser } from "@/types/typesUser";

type DisplayUsersProps = { 
    users: typesUser[];
}

export const DisplayUsers = async ({
    users
}: DisplayUsersProps) => {
    const t = await getTranslations('AccessForRegistrationPage');

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    return (
        <div className="overflow-x-auto">
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</TableHead>
                        <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('email')}</TableHead>
                        <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phone')}</TableHead>
                        <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('gender')}</TableHead>
                        <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('playerLevel')}</TableHead>
                        <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('action')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="px-2 py-4 whitespace-normal break-words text-sm font-medium">{user.fullName}</TableCell>
                            <TableCell className="px-2 py-4 whitespace-normal break-words text-sm">{user.email}</TableCell>
                            <TableCell className="px-2 py-4 whitespace-normal break-words text-sm">{user.phoneNumber}</TableCell>
                            <TableCell className="px-2 py-4 whitespace-normal break-words text-sm">{user.gender}</TableCell>
                            <TableCell className="px-2 py-4 whitespace-normal break-words text-sm">
                                <UpdatePlayerLevel
                                    userId={user.id}
                                    currentLevel={user.player_level}
                                    authToken={authToken as string}
                                />
                            </TableCell>
                            <TableCell className="px-2 py-4 whitespace-nowrap text-sm">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <GrantUserAccessButton
                                        authToken={authToken as string}
                                        userId={user.id}
                                    />
                                    <DenyUserAccessButton
                                        authToken={authToken as string}
                                        userId={user.id}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}