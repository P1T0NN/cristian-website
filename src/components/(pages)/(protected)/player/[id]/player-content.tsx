type PlayerContentProps = {
    playerId: string;
    authToken: string;
}

export const PlayerContent = ({
    playerId,
    authToken
}: PlayerContentProps) => {
    return (
        <div>Player Content for {playerId}</div>
    )
}