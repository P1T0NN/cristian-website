// NEXTJS IMPORTS
import { NextRequest, NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// TYPES
import type { typesMatch, typesPlayer } from "@/features/matches/types/typesMatch";

interface MatchPlayerResponse {
    id: string;
    userId: string;
    matchId: string;
    teamNumber: number;
    hasArrived: boolean;
    hasPaid: boolean;
    hasGratis: boolean;
    hasDiscount: boolean;
    playerType: string;
    temporaryPlayerName: string | null;
    temporaryPlayerPosition: string | null;
    hasAddedFriend: boolean;
    substituteRequested: boolean;
    hasMatchAdmin: boolean;
    hasEnteredWithBalance: boolean;
    user: {
        id: string;
        name: string;
        playerPosition: string;
    } | null;
    addedByUser: {
        id: string;
        name: string;
    } | null;
}

export const GET = async (request: NextRequest) => {
    const g = await getTranslations("GenericMessages");
    const t = await getTranslations("MatchPage");

    const { searchParams } = new URL(request.url);

    const matchId = searchParams.get('matchId'); // WE get this through URL params
    const userId = request.nextUrl.searchParams.get('userId'); // I passed along with the request

    if (!matchId) {
        return NextResponse.json({ success: false, message: g('BAD_REQUEST') }, { status: 400 });
    }

    const [matchResponse, matchPlayersResponse] = await Promise.all([
        supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single(),
        
        supabase
            .from('match_players')
            .select(`
                id,
                userId,
                matchId,
                teamNumber,
                hasArrived,
                hasPaid,
                hasGratis,
                hasDiscount,
                playerType,
                temporaryPlayerName,
                hasAddedFriend,
                substituteRequested,
                hasMatchAdmin,
                temporaryPlayerName,
                temporaryPlayerPosition,
                hasEnteredWithBalance,
                user:userId (
                    id,
                    name,
                    playerPosition
                ),
                addedByUser:userId (
                    id,
                    name
                )
            `)
            .eq('matchId', matchId)
    ]);

    const { data: match, error: matchError } = matchResponse;
    const { data: matchPlayers, error: playersError } = matchPlayersResponse as { 
        data: MatchPlayerResponse[] | null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: any;
    };

    if (matchError) {
        return NextResponse.json({ success: false, message: g('MATCH_FAILED_TO_FETCH') }, { status: 500 });
    }

    if (!match) {
        return NextResponse.json({ success: false, message: g('MATCH_NOT_FOUND') }, { status: 404 });
    }

    if (playersError) {
        return NextResponse.json({ success: false, message: g('MATCH_PLAYERS_FAILED_TO_FETCH') }, { status: 500 });
    }

    const team1Players = matchPlayers 
        ? matchPlayers.filter(player => player.teamNumber === 1)
        : [];
    
    const team2Players = matchPlayers 
        ? matchPlayers.filter(player => player.teamNumber === 2)
        : [];
        
    const isUserInMatch = Boolean(
        team1Players.some(player => 
            player.userId === userId || 
            (player.playerType === 'temporary' && player.addedByUser?.id === userId)
        ) ||
        team2Players.some(player => 
            player.userId === userId || 
            (player.playerType === 'temporary' && player.addedByUser?.id === userId)
        )
    );

    const hasDirectlyJoined = Boolean(
        team1Players.some(player => player.userId === userId && player.playerType === 'regular') ||
        team2Players.some(player => player.userId === userId && player.playerType === 'regular')
    );

    const hasAddedFriend = Boolean(
        team1Players.some(player => 
            player.playerType === 'temporary' && player.addedByUser?.id === userId
        ) ||
        team2Players.some(player => 
            player.playerType === 'temporary' && player.addedByUser?.id === userId
        )
    );

    const mapPlayerData = (player: MatchPlayerResponse): typesPlayer => ({
        id: player.id,
        userId: player.userId,
        matchId: player.matchId,
        name: player.playerType === 'regular' 
            ? (player.user?.name || 'N/A') 
            : (player.temporaryPlayerName || 'N/A'),
        playerPosition: player.playerType === 'regular' 
            ? (player.user?.playerPosition || 'N/A') 
            : `${t('addedBy')} ${player.addedByUser?.name || 'N/A'}`,
        playerType: player.playerType,
        hasArrived: player.hasArrived,
        hasPaid: player.hasPaid,
        hasGratis: player.hasGratis,
        hasDiscount: player.hasDiscount,
        hasAddedFriend: player.hasAddedFriend,
        substituteRequested: player.substituteRequested,
        hasMatchAdmin: player.hasMatchAdmin,
        temporaryPlayerName: player.temporaryPlayerName as string,
        temporaryPlayerPosition: player.temporaryPlayerPosition as string,
        hasEnteredWithBalance: player.hasEnteredWithBalance
    });

    const matchData: typesMatch = {
        id: match.id,
        addedBy: match.addedBy,
        location: match.location,
        locationUrl: match.locationUrl,
        price: match.price,
        team1Name: match.team1Name,
        team2Name: match.team2Name,
        startsAtDay: match.startsAtDay,
        startsAtHour: match.startsAtHour,
        matchType: match.matchType,
        matchGender: match.matchGender,
        matchDuration: match.matchDuration,
        team1Color: match.team1Color,
        team2Color: match.team2Color,
        matchInstructions: match.matchInstructions,
        placesOccupied: match.placesOccupied,
        createdAt: match.createdAt,
        matchLevel: match.matchLevel,
        hasTeams: match.hasTeams,
        blockSpotsTeam1: match.blockSpotsTeam1,
        blockSpotsTeam2: match.blockSpotsTeam2,
        status: match.status,
        isUserInMatch,
        hasDirectlyJoined,
        hasAddedFriend,
        team1Players: team1Players.map(mapPlayerData),
        team2Players: team2Players.map(mapPlayerData)
    };

    return NextResponse.json({ 
        success: true, 
        data: matchData
    });
};