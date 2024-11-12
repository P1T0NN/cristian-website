'use client'

// REACTJS IMPORTS
import { useState } from 'react';

// LIBRARIES
import { format as dateFormat } from 'date-fns';

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import { 
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationLink, 
    PaginationNext, 
    PaginationPrevious
} from "@/components/ui/pagination";
import { DeleteMatchFromHistoryDialog } from './delete-match-from-history-dialog';

// UTILS
import { formatTime } from "@/utils/dateUtils";

// TYPES
import { typesMatchHistory } from '@/types/typesMatchHistory';

// LUCIDE ICONS
import { MapPin } from "lucide-react";

type PaginatedMatchHistoryProps = {
    authToken: string;
    matchHistory: typesMatchHistory[];
}

const ITEMS_PER_PAGE = 10;

export const PaginatedMatchHistory = ({
    authToken,
    matchHistory
}: PaginatedMatchHistoryProps) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(matchHistory.length / ITEMS_PER_PAGE);
    const paginatedHistory = matchHistory.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const formatMatchType = (type: string) => {
        switch (type) {
            case "F8": return "8v8"
            case "F7": return "7v7"
            case "F11": return "11v11"
            default: return type
        }
    };

    return (
        <>
            <div className="space-y-4">
                {paginatedHistory.map((match) => {
                    const title = `${match.team1_name} vs ${match.team2_name}`;
                    const format = `${formatMatchType(match.match_type)} ${match.match_gender}`;
                    const formattedTime = formatTime(match.starts_at_hour);
                    const formattedDate = dateFormat(new Date(match.starts_at_day), 'dd/MM/yyyy');

                    return (
                        <Card key={match.id} className="w-full transition-shadow hover:shadow-md">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="text-3xl font-bold leading-none">{formattedTime}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{formattedDate}</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg truncate">{title}</h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{format}</span>
                                            <div className="flex items-center gap-1">
                                                <span className={`w-2.5 h-2.5 rounded-full ${match.team1_color ? 'bg-black' : 'bg-white border border-gray-300'}`} />
                                                <span className={`w-2.5 h-2.5 rounded-full ${match.team2_color ? 'bg-black' : 'bg-white border border-gray-300'}`} />
                                            </div>
                                        </div>
                                        {match.match_instructions && (
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{match.match_instructions}</p>
                                        )}
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <div className="font-semibold text-lg">{match.price}€</div>

                                        <DeleteMatchFromHistoryDialog authToken={authToken} match={match} />
                                    </div>
                                </div>
                                <div className="w-full mt-3 flex items-center justify-center py-2 px-4 text-sm font-medium rounded-md">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {match.location}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <div className="mt-4">
                <Pagination>
                    <PaginationContent>
                        {currentPage > 1 && (
                            <PaginationItem>
                                <PaginationPrevious onClick={() => setCurrentPage(prev => prev - 1)} />
                            </PaginationItem>
                        )}
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink 
                                    onClick={() => setCurrentPage(i + 1)}
                                    isActive={currentPage === i + 1}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        {currentPage < totalPages && (
                            <PaginationItem>
                                <PaginationNext onClick={() => setCurrentPage(prev => prev + 1)} />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            </div>
        </>
    )
}