// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { subMonths } from 'date-fns';

// MIDDLEWARE
import { withAuth } from '@/middleware/withAuth';

// TYPES
import type { typesMatchHistory } from '@/types/typesMatchHistory';
import type { typesUser } from '@/types/typesUser';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (_request: NextRequest, _userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    // Calculate the date 1 month ago
    const oneMonthAgo = subMonths(new Date(), 1).toISOString();

    // Delete matches older than 1 month
    await supabase
        .from('match_history')
        .delete()
        .lt('created_at', oneMonthAgo);

    // Fetch remaining match history from database with player statistics
    const [{ data: matchHistory, error: matchHistoryError }, { data: playersData, error: playersError }] = await Promise.all([
        supabase
            .from('match_history')
            .select('*')
            .order('created_at', { ascending: false }),
        supabase
            .from('match_history_players')
            .select(`
                *,
                user:users (
                    id,
                    fullName
                )
            `)
    ]);

    if (matchHistoryError || playersError) {
        return NextResponse.json({ success: false, message: t('MATCH_HISTORY_FAILED_TO_FETCH') }, { status: 500 });
    }

    // If no match history found
    if (!matchHistory || matchHistory.length === 0) {
        return NextResponse.json({ success: true, message: t('NO_MATCH_HISTORY_FOUND'), data: [] });
    }

    // Map players data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapPlayer = (p: any): typesUser & { matchHistoryPlayer: any } => ({
        id: p.user.id,
        fullName: p.user.fullName,
        email: '',
        phoneNumber: '',
        gender: '',
        is_verified: false,
        isAdmin: false,
        player_debt: 0,
        cristian_debt: 0,
        player_level: '',
        player_position: '',
        created_at: new Date(),
        dni: '',
        country: '',
        has_access: false,
        balance: 0,
        verify_documents: false,
        matchHistoryPlayer: {
            match_history_id: p.match_history_id,
            has_paid: p.has_paid,
            has_discount: p.has_discount,
            has_gratis: p.has_gratis,
            has_entered_with_balance: p.has_entered_with_balance
        }
    });

    const allPlayers = playersData ? playersData.map(mapPlayer) : [];

    // Process the player statistics for each match
    const processedMatchHistory: typesMatchHistory[] = matchHistory.map(match => {
        const matchPlayers = allPlayers.filter(p => p.matchHistoryPlayer?.match_history_id === match.id);
        
        const playerStats = {
            playersPaid: matchPlayers.filter(p => p.matchHistoryPlayer?.has_paid),
            playersWithDiscount: matchPlayers.filter(p => p.matchHistoryPlayer?.has_discount),
            playersWithGratis: matchPlayers.filter(p => p.matchHistoryPlayer?.has_gratis),
            playersEnteredWithBalance: matchPlayers.filter(p => p.matchHistoryPlayer?.has_entered_with_balance),
            playersNotPaid: matchPlayers.filter(p => !p.matchHistoryPlayer?.has_paid)
        };

        return {
            ...match,
            playerStats
        };
    });

    return NextResponse.json({ 
        success: true, 
        message: t('MATCH_HISTORY_SUCCESSFULLY_FETCHED'), 
        data: processedMatchHistory 
    });
});