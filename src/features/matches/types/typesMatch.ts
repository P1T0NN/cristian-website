export type typesMatchType = 'F7' | 'F8' | 'F11';
export type typesMatchGender = 'Male' | 'Female' | 'Mixed';
export type typesMatchLevel = 'A' | 'B' | 'C' | 'D' | string;
export type typesMatchStatus = 'active' | 'pending' | 'finished' | 'cancelled';

export interface typesMatch {
    id: string;
    addedBy: string;
    location: string;
    locationUrl: string;
    price: string;
    team1Name: string;
    team2Name: string;
    startsAtDay: string;
    startsAtHour: string;
    matchType: typesMatchType;
    matchGender: typesMatchGender;
    matchDuration: number;
    // I made it bool because it's less expensive action then string
    team1Color: boolean;
    team2Color: boolean;
    matchInstructions: string;
    placesOccupied: number;
    createdAt: Date;
    matchLevel: typesMatchLevel;
    hasTeams: boolean;
    blockSpotsTeam1: number;
    blockSpotsTeam2: number;
    extraSpotsTeam1: number;
    extraSpotsTeam2: number;
    status: typesMatchStatus;
    team1Players: typesPlayer[];
    team2Players: typesPlayer[];
    isUserInMatch: boolean;
    hasDirectlyJoined: boolean;
    hasAddedFriend: boolean;
}

export type typesPlayer = {
    id: string;
    userId?: string; // NOTE: I made it optional because of TypeScript complains in join-match-button and other components
    matchId?: string; // NOTE: I made it optional because of TypeScript complains in join-match-button and other components
    name: string;
    playerPosition: string;
    playerType?: string;
    hasArrived?: boolean;
    hasPaid?: boolean;
    hasGratis?: boolean;
    hasDiscount?: boolean;
    hasAddedFriend?: boolean;
    substituteRequested?: boolean;
    hasMatchAdmin?: boolean;
    temporaryPlayerName?: string;
    temporaryPlayerPosition?: string;
    hasEnteredWithBalance?: boolean;
};

/* SUPABASE TABLE

-- Create an enum for match types
CREATE TYPE match_type AS ENUM ('F7', 'F8', 'F11');


-- Create an enum for match genders
CREATE TYPE match_gender AS ENUM ('Male', 'Female', 'Mixed');

CREATE TYPE match_status AS ENUM ('active', 'pending', 'finished');

-- Create the matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    addedBy TEXT NOT NULL,
    location TEXT NOT NULL,
    locationUrl TEXT,
    price DECIMAL(10, 2) NOT NULL,
    team1Name TEXT NOT NULL,
    team2Name TEXT NOT NULL,
    startsAtDay DATE NOT NULL,
    startsAtHour TIME NOT NULL,
    matchType match_type NOT NULL,
    matchGender match_gender NOT NULL,
    matchDuration INTEGER NOT NULL,
    team1Color BOOLEAN NOT NULL,
    team2Color BOOLEAN NOT NULL,
    matchInstructions TEXT,
    placesOccupied INTEGER NOT NULL DEFAULT 0,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    matchLevel TEXT NOT NULL,
    hasTeams BOOLEAN NOT NULL DEFAULT false,
    blockSpotsTeam1 INTEGER NOT NULL DEFAULT 0,
    blockSpotsTeam2 INTEGER NOT NULL DEFAULT 0,
    status match_status NOT NULL
);

-- Create indexes for frequently queried columns
CREATE INDEX idx_matches_startsAtDay ON matches(startsAtDay);
CREATE INDEX idx_matches_matchType ON matches(matchType);
CREATE INDEX idx_matches_matchGender ON matches(matchGender);
CREATE INDEX idx_matches_matchLevel ON matches(matchLevel);

ALTER TABLE match_players
ADD CONSTRAINT fk_match
FOREIGN KEY (match_id) 
REFERENCES matches(id);

*/