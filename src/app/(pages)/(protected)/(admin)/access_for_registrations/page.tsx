// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { DisplayUsers } from '@/features/players/components/register-access/display-users';

// ACTIONS
import { fetchNoAccessUsers } from '@/features/players/actions/fetchNoAccessUsers';

// TYPES
import type { typesUser } from '@/features/players/types/typesPlayer';

export default async function AccessForRegistrationPage() {
    const t = await getTranslations('AccessForRegistrationPage');
    
    const serverNoAccessUsersData = await fetchNoAccessUsers();
    const noAccessUsersData = serverNoAccessUsersData.data as typesUser[];

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto p-4 space-y-4">
                <h1 className="text-3xl font-bold">{t('pageTitle')}</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cardTitle')}</CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                        {/* No need for individual Suspense here, loading.tsx is sufficient since we do only one getUser() call in DisplayUsers */}
                        <DisplayUsers users={noAccessUsersData} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}