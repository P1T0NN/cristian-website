// COMPONENTS
import { PlayerDetails } from '@/components/(pages)/(protected)/player/[id]/player-details';

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from '@/types/typesUser';

export default async function PlayerPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params;

    const serverUserData = await server_fetchUserData();

    const userData = serverUserData.data as typesUser;

    return (
        <div className="container mx-auto px-4 py-8">
            <PlayerDetails playerId={id} currentUserData={userData} />
        </div>
    );
};