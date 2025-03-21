// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { UpdatePlayerLevel } from './update-player-level';
import { GrantUserAccessButton } from './grant-user-access-button';
import { DenyUserAccessButton } from './deny-user-access-button';

// TYPES
import type { typesUser } from '../../types/typesPlayer';

type DisplayUsersProps = { 
    users: typesUser[];
}

export const DisplayUsers = async ({
    users
}: DisplayUsersProps) => {
    const t = await getTranslations('AccessForRegistrationPage');

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
                            <TableCell className="px-2 py-4 whitespace-normal break-words text-sm font-medium">{user.name}</TableCell>
                            <TableCell className="px-2 py-4 whitespace-normal break-words text-sm">{user.email}</TableCell>
                            <TableCell className="px-2 py-4 whitespace-normal break-words text-sm">{user.phoneNumber}</TableCell>
                            <TableCell className="px-2 py-4 whitespace-normal break-words text-sm">{user.gender}</TableCell>
                            <TableCell className="px-2 py-4 whitespace-normal break-words text-sm">
                                <UpdatePlayerLevel
                                    userId={user.id}
                                    currentLevel={user.playerLevel}
                                />
                            </TableCell>
                            <TableCell className="px-2 py-4 whitespace-nowrap text-sm">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <GrantUserAccessButton
                                        userId={user.id}
                                    />

                                    <DenyUserAccessButton
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