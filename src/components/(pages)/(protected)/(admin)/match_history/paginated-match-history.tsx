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
import { MapPin, Users, CreditCard, Ticket, Gift, XCircle, EuroIcon } from 'lucide-react';

type PaginatedMatchHistoryProps = {
    matchHistory: typesMatchHistory[];
}

const ITEMS_PER_PAGE = 10;

export const PaginatedMatchHistory = ({
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

    const calculateTotalMoney = (price: number, playerStats: typesMatchHistory['playerStats']) => {
        const paidNonGratisPlayers = playerStats.playersPaid.filter(player => 
            !playerStats.playersWithGratis.some(gratisPlayer => gratisPlayer.fullName === player.fullName)
        );
    
        const fullPricePaidCount = paidNonGratisPlayers.filter(player => 
            !playerStats.playersWithDiscount.some(discountPlayer => discountPlayer.fullName === player.fullName)
        ).length;
        
        const discountedPaidCount = paidNonGratisPlayers.filter(player => 
            playerStats.playersWithDiscount.some(discountPlayer => discountPlayer.fullName === player.fullName)
        ).length;
    
        const fullPriceTotal = fullPricePaidCount * price;
        const discountedTotal = discountedPaidCount * 3; // Fixed 3€ for discounted players
    
        return (fullPriceTotal + discountedTotal).toFixed(2);
    };
    
    return (
        <>
            <div className="space-y-4">
                {paginatedHistory.map((match) => {
                    const title = `${match.team1_name} vs ${match.team2_name}`;
                    const format = `${formatMatchType(match.match_type)} ${match.match_gender}`;
                    const formattedTime = formatTime(match.starts_at_hour);
                    const formattedDate = dateFormat(new Date(match.starts_at_day), 'dd/MM/yyyy');
                    const totalMoney = calculateTotalMoney(match.price, match.playerStats);

                    return (
                        <Card key={match.id} className="w-full transition-shadow hover:shadow-md">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row items-start justify-between">
                                    <div className="flex items-start gap-4 w-full sm:w-auto">
                                        <div className="flex flex-col items-center">
                                            <div className="text-2xl sm:text-3xl font-bold leading-none">{formattedTime}</div>
                                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">{formattedDate}</div>
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-base sm:text-lg">{title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <Badge variant="secondary" className="text-xs sm:text-sm">{format}</Badge>
                                                <div className="flex items-center gap-1">
                                                    <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${match.team1_color || 'bg-gray-300'}`} />
                                                    <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${match.team2_color || 'bg-gray-300'}`} />
                                                </div>
                                            </div>
                                            {match.match_instructions && (
                                                <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">{match.match_instructions}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right mt-2 sm:mt-0">
                                        <div className="font-semibold text-base sm:text-lg">{match.price}€</div>
                                        <DeleteMatchFromHistoryDialog match={match} />
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                                    <div className="flex items-center">
                                        <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                        <span>
                                            {t('paid')}: {match.playerStats.playersPaid.length}
                                            <span className="hidden sm:inline">{formatPlayerNames(match.playerStats.playersPaid)}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Ticket className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                        <span>
                                            {t('discount')}: {match.playerStats.playersWithDiscount.length}
                                            <span className="hidden sm:inline">{formatPlayerNames(match.playerStats.playersWithDiscount)}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                        <span>
                                            {t('gratis')}: {match.playerStats.playersWithGratis.length}
                                            <span className="hidden sm:inline">{formatPlayerNames(match.playerStats.playersWithGratis)}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                        <span>
                                            {t('balance')}: {match.playerStats.playersEnteredWithBalance.length}
                                            <span className="hidden sm:inline">{formatPlayerNames(match.playerStats.playersEnteredWithBalance)}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0 text-red-500" />
                                        <span>
                                            {t('notPaid')}: {match.playerStats.playersNotPaid.length}
                                            <span className="hidden sm:inline">{formatPlayerNames(match.playerStats.playersNotPaid)}</span>
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/50 py-2 px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="flex items-center text-xs sm:text-sm font-medium mb-2 sm:mb-0">
                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    {match.location}
                                </div>
                                <div className="flex items-center text-green-600 font-semibold text-sm sm:text-base">
                                    <EuroIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    <span>{totalMoney}€</span>
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
            <div className="mt-4 flex justify-center">
                <Pagination>
                    <PaginationContent>
                        {currentPage > 1 && (
                            <PaginationItem>
                                <PaginationPrevious onClick={() => setCurrentPage(prev => prev - 1)} />
                            </PaginationItem>
                        )}
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i} className="hidden sm:inline-block">
                                <PaginationLink 
                                    onClick={() => setCurrentPage(i + 1)}
                                    isActive={currentPage === i + 1}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem className="sm:hidden">
                            <PaginationLink>{currentPage} / {totalPages}</PaginationLink>
                        </PaginationItem>
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