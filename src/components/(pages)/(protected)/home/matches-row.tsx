// COMPONENTS
import { MatchCard } from './match-card';

// TYPES
import type { typesMatch } from "@/types/typesMatch";
import type { typesUser } from '@/types/typesUser';

type MatchesRowProps = {
    title: string;
    matches: typesMatch[];
    serverUserData: typesUser;
}

export const MatchesRow = ({ 
    title, 
    matches,
    serverUserData
}: MatchesRowProps) => {
    if (matches.length === 0) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {matches.map((match) => (
                    <MatchCard 
                        key={match.id} 
                        match={match} 
                        serverUserData={serverUserData}
                    />
                ))}
            </div>
        </div>
    );
};