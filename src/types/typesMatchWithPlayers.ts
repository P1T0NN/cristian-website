// TYPES
import type { typesMatch } from "./typesMatch";
import type { typesUser } from "./typesUser";

export type typesMatchWithPlayers = {
    match: typesMatch;
    team1Players: typesUser[];
    team2Players: typesUser[];
    unassignedPlayers: typesUser[];
}