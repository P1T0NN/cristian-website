'use client'

// REACTJS IMPORTS
import { useState } from 'react';

// LIBRARIES
import { format as dateFormat } from 'date-fns';
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationLink, 
    PaginationNext, 
    PaginationPrevious
} from "@/components/ui/pagination";
import { DeleteMatchFromHistoryDialog } from './delete-match-from-history-dialog';
import { Badge } from '@/components/ui/badge';

// UTILS
import { formatTime } from "@/utils/dateUtils";

// TYPES
import type { typesMatchHistory } from '@/types/typesMatchHistory';

// LUCIDE ICONS
import { MapPin, Users, CreditCard, Ticket, Gift, XCircle } from 'lucide-react';

type PaginatedMatchHistoryProps = {
    authToken: string;
    matchHistory: typesMatchHistory[];
}

const ITEMS_PER_PAGE = 10;

export const PaginatedMatchHistory = ({
    authToken,
    matchHistory
}: PaginatedMatchHistoryProps) => {
    const t = useTranslations('MatchHistoryPage');

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

    const formatPlayerNames = (players: { fullName: string }[]) => {
        return players.length > 0 ? ` (${players.map(p => p.fullName).join(', ')})` : '';
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
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="text-3xl font-bold leading-none">{formattedTime}</div>
                                            <div className="text-sm text-muted-foreground mt-1">{formattedDate}</div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <Badge variant="secondary">{format}</Badge>
                                                <div className="flex items-center gap-1">
                                                    <span className={`w-3 h-3 rounded-full ${match.team1_color || 'bg-gray-300'}`} />
                                                    <span className={`w-3 h-3 rounded-full ${match.team2_color || 'bg-gray-300'}`} />
                                                </div>
                                            </div>
                                            {match.match_instructions && (
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{match.match_instructions}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-lg">{match.price}€</div>
                                        <DeleteMatchFromHistoryDialog authToken={authToken} match={match} />
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm">{t('paid')}: {match.playerStats.playersPaid}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Ticket className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm">
                                            {t('discount')}: {match.playerStats.playersWithDiscount.length}
                                            {formatPlayerNames(match.playerStats.playersWithDiscount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Gift className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm">
                                            {t('gratis')}: {match.playerStats.playersWithGratis.length}
                                            {formatPlayerNames(match.playerStats.playersWithGratis)}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm">
                                            {t('balance')}: {match.playerStats.playersEnteredWithBalance.length}
                                            {formatPlayerNames(match?.playerStats.playersEnteredWithBalance)}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <XCircle className="w-4 h-4 mr-2 flex-shrink-0 text-red-500" />
                                        <span className="text-sm">
                                            {t('notPaid')}: {match.playerStats.playersNotPaid?.length || 0}
                                            {formatPlayerNames(match.playerStats.playersNotPaid || [])}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/50 py-2 px-4">
                                <div className="w-full flex items-center justify-center text-sm font-medium">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {match.location}
                                </div>
                            </CardFooter>
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