// REACTJS IMPORTS
import { Suspense } from 'react';

// COMPONENTS
import { TeamDetails } from '@/components/(pages)/(protected)/team/[id]/team-details';
import { TeamDetailsLoading } from '@/components/(pages)/(protected)/team/[id]/loading/team-details-loading';

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from '@/types/typesUser';

export default async function TeamPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params;

    const serverUserData = await server_fetchUserData();
    const userData = serverUserData.data as typesUser;

    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<TeamDetailsLoading />}>
                <TeamDetails 
                    teamId={id} 
                    serverUserData={userData}
                />
            </Suspense>
        </div>
    );
};