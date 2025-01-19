// COMPONENTS
import { TeamDetails } from "@/features/teams/components/team-details";

export default async function TeamPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* No need for individual Suspense here, loading.tsx is sufficient since we do only one getUser() call in TeamDetails */}
            <TeamDetails 
                teamId={id} 
            />
        </div>
    );
};