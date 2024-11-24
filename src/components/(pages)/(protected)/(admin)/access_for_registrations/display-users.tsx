// NEXTJS IMPORTS
import { cookies } from 'next/headers';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GrantUserAccessButton } from './grant-user-access-button';

// TYPES
import type { typesUser } from "@/types/typesUser"

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
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('phone')}</TableHead>
                    <TableHead>{t('gender')}</TableHead>
                    <TableHead>{t('action')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>{user.gender}</TableCell>
                        <TableCell>
                            <GrantUserAccessButton
                                authToken={authToken as string}
                                userId={user.id}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}