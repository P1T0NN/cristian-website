// TYPES
import type { typesMatch } from "./typesMatch";
import type { typesPlayer } from "@/features/players/types/typesPlayer";

export interface typesMatchWithPlayers {
    match: typesMatch;
    players: {
        type: 'regular' | 'temporary';
        player: typesPlayer;
        team_number: 0 | 1 | 2;
    }[];
}