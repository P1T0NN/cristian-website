// COMPONENTS
import { PlayerDetails } from '@/components/(pages)/(protected)/player/[id]/player-details';

export default async function PlayerPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* No need for individual suspense, since all data we get, we get from one call and one component, so loading.tsx is sufficient */}
            <PlayerDetails playerIdFromParams={id} />
        </div>
    );
};