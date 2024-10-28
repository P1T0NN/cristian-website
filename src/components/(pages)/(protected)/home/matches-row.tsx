// LIBRARIES
import { motion } from 'framer-motion';

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-4"
        >
            <h2 className="text-2xl font-semibold text-primary">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {matches.map((match, index) => (
                    <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <MatchCard 
                            match={match} 
                            serverUserData={serverUserData}
                        />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};