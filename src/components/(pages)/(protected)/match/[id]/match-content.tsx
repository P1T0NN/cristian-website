type MatchContentProps = {
    matchId: string;
    authToken: string;
}

export const MatchContent = ({
    matchId,
    authToken
}: MatchContentProps) => {
    return (
        <div>Match Content for {matchId}</div>
    )
}