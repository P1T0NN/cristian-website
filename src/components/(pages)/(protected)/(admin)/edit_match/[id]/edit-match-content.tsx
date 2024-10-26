"use client"

// LIBRARIES
import { useQuery } from "@tanstack/react-query";

// COMPONENTS
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ACTIONS
import { client_fetchMatch } from "@/actions/functions/data/client/match/client_fetchMatch";

type EditMatchContentProps = {
    matchId: string;
    authToken: string;
}

export const EditMatchContent = ({
    matchId,
    authToken
}: EditMatchContentProps) => {
    const { 
        data: matchData,
        isLoading,
    } = useQuery({
        queryKey: ['match', matchId],
        queryFn: () => client_fetchMatch(authToken, matchId),
        enabled: !!matchId && !!authToken,
    });

    if (isLoading) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!matchData) {
        return <p>No match data found for ID: {matchId}</p>;
    }

    return (
        <div className="flex w-full h-full p-4">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Match Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>Match ID: {matchId}</div>
                        <div>Location: {matchData.location}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};