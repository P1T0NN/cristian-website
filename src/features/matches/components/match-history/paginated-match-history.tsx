"use client"

// REACTJS IMPORTS
import { useState } from 'react';

// COMPONENTS
import { HistoryMatchCard } from './card/history-match-card';
import { MatchHistoryPagination } from './pagination/match-history-pagination';

// TYPES
import type { typesMatch } from "../../types/typesMatch";
import type { typesBaseMatchPlayer } from "@/features/players/types/typesPlayer";

type PaginatedMatchHistoryProps = {
    matches: (typesMatch & { 
        match_players: typesBaseMatchPlayer[] 
    })[];
}

const ITEMS_PER_PAGE = 10;

export const PaginatedMatchHistory = ({ 
    matches 
}: PaginatedMatchHistoryProps) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(matches.length / ITEMS_PER_PAGE);
    
    const paginatedMatches = matches.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <>
            <div className="space-y-4">
                {paginatedMatches.map((match) => (
                    <HistoryMatchCard 
                        key={match.id} 
                        match={match} 
                    />
                ))}
            </div>

            <MatchHistoryPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
            />
        </>
    );
};