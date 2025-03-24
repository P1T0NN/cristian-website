// LIBRARIES
import { cn } from "@/shared/lib/utils";

// COMPONENTS
import { JoinMatchButton } from "./join-match-button";
import { MatchTeamsPlayerSlot } from "./match-teams-player-slot";
import { AddFriendButton } from "./add-friend-button";
import { LeaveMatchButton } from "./leave-match-button";
import { RemoveFriendButton } from "./remove-friend-button";
import { CancelSubstituteButton } from "./cancel-substitute-button";
import { BlockSpotsButton } from "./block-spots-button";
import { AddSpotsButton } from "./add-spots-button";
import { RemoveSpotsButton } from "./remove-spots-button";
import { SubstituteNeededButton } from "./substitute-needed-button";
import { AdminAddPlayerButton } from "./admin-add-player-button";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";
import { fetchMatch } from "../../actions/fetchMatch";

// UTILS
import { getMaxPlayers, calculateAvailableSlots, getTeamPlayersText, isTeamFull } from "../../utils/matchCalculations";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";
import type { typesPlayer } from "@/features/matches/types/typesMatch";

interface MatchTeamCardProps {
    matchIdFromParams: string;
    // NOTE: I pass teamName so I dont have to do here a fetch to get it
    teamName: string;
    teamColor: "red" | "blue";
    teamNumber: 1 | 2;
    // NOTE: I pass players so I dont have to do here a fetch to get them
    players: typesPlayer[];
    isMatchAdmin: boolean;
    hasSubstituteRequests: boolean;
}

export const MatchTeamCard = async ({
    matchIdFromParams,
    teamName,
    teamColor, 
    teamNumber,
    players,
    isMatchAdmin,
    hasSubstituteRequests
}: MatchTeamCardProps) => {
    const currentUserData = await getUser() as typesUser;

    const { data: match } = await fetchMatch(matchIdFromParams, currentUserData?.id);

    const maxPlayers = getMaxPlayers(match?.matchType as string);
    const blockedSpots = teamNumber === 1 
        ? match?.blockSpotsTeam1 || 0 
        : match?.blockSpotsTeam2 || 0;
    
    const extraSpots = teamNumber === 1
        ? match?.extraSpotsTeam1 || 0
        : match?.extraSpotsTeam2 || 0;

    const availableSlots = calculateAvailableSlots(
        maxPlayers,
        players.length,
        blockedSpots,
        extraSpots
    );

    const hasCurrentUserRequestedSubstitute = Boolean(
        match?.team1Players.some(player => 
            player.userId === currentUserData?.id && 
            player.playerType === 'regular' && 
            player.substituteRequested
        ) || match?.team2Players.some(player => 
            player.userId === currentUserData?.id && 
            player.playerType === 'regular' && 
            player.substituteRequested
        )
    );

    const hasFriendRequestedSubstitute = Boolean(
        match?.team1Players.some(player => 
            player.userId === currentUserData?.id && 
            player.playerType === 'temporary' && 
            player.substituteRequested
        ) || match?.team2Players.some(player => 
            player.userId === currentUserData?.id && 
            player.playerType === 'temporary' && 
            player.substituteRequested
        )
    );

    const playersCount = await getTeamPlayersText(
        players.length,
        match?.matchType as string,
        blockedSpots,
        extraSpots
    );

    const teamIsFull = isTeamFull(
        players.length,
        match?.matchType as string,
        blockedSpots,
        extraSpots
    );

    return (
        <div className={`rounded-xl ${teamColor === "red" ? "bg-red-50/10" : "bg-blue-50/10"} p-3 sm:p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                    <h2 className={`text-lg sm:text-xl font-semibold ${
                        teamColor === "red" ? "text-red-500" : "text-blue-500"
                    }`}>
                        {teamName}
                    </h2>
                    <span className={cn(
                        "text-xs sm:text-sm px-2 py-0.5 rounded-full",
                        teamIsFull
                            ? "bg-gray-100/10 text-gray-500"
                            : teamColor === "red" 
                                ? "bg-red-100/10 text-red-500" 
                                : "bg-blue-100/10 text-blue-500"
                    )}>
                        {playersCount}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {currentUserData.isAdmin && (
                        <>
                            <BlockSpotsButton
                                matchIdFromParams={matchIdFromParams}
                                teamNumber={teamNumber}
                                maxPlayers={maxPlayers}
                                currentBlockedSpots={blockedSpots}
                            />
                            <AddSpotsButton
                                matchIdFromParams={matchIdFromParams}
                                teamNumber={teamNumber}
                                matchType={match?.matchType as string}
                                currentExtraSpots={extraSpots}
                            />
                            <RemoveSpotsButton
                                matchIdFromParams={matchIdFromParams}
                                teamNumber={teamNumber}
                                currentExtraSpots={extraSpots}
                            />
                            {!teamIsFull && (
                                <AdminAddPlayerButton
                                    matchIdFromParams={matchIdFromParams}
                                    teamNumber={teamNumber}
                                />
                            )}
                        </>
                    )}
                    
                    {match?.isUserInMatch ? (
                        <>
                            {match.hasDirectlyJoined && (
                                hasCurrentUserRequestedSubstitute ? (
                                    <CancelSubstituteButton 
                                        matchIdFromParams={matchIdFromParams}
                                        playerType="regular"
                                    />
                                ) : (
                                    <LeaveMatchButton 
                                        matchIdFromParams={matchIdFromParams}
                                    />
                                )
                            )}
                            {!teamIsFull && !match.hasAddedFriend && (
                                <AddFriendButton 
                                    matchIdFromParams={matchIdFromParams}
                                    teamNumber={teamNumber}
                                />
                            )}
                            {match.hasAddedFriend && (
                                hasFriendRequestedSubstitute ? (
                                    <CancelSubstituteButton 
                                        matchIdFromParams={matchIdFromParams}
                                        playerType="temporary"
                                    />
                                ) : (
                                    <RemoveFriendButton 
                                        matchIdFromParams={matchIdFromParams}
                                    />
                                )
                            )}
                        </>
                    ) : (
                        !teamIsFull && (
                            hasSubstituteRequests ? (
                                <SubstituteNeededButton />
                            ) : (
                                <JoinMatchButton 
                                    matchIdFromParams={matchIdFromParams}
                                    teamNumber={teamNumber}
                                />
                            )
                        )
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                {players.map((player) => (
                    <MatchTeamsPlayerSlot
                        key={player.id}
                        id={player.id}
                        teamColor={teamColor}
                        matchIdFromParams={matchIdFromParams}
                        player={player}
                        isMatchAdmin={isMatchAdmin}
                        hasDirectlyJoined={match?.hasDirectlyJoined}
                    />
                ))}

                {availableSlots.map((slot, index) => (
                    <MatchTeamsPlayerSlot 
                        key={`available-${index}`}
                        teamColor={teamColor}
                        isBlocked={slot.isBlocked}
                    />
                ))}
            </div>
        </div>
    );
};