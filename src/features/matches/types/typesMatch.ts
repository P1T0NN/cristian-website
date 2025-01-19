// TYPES
import type { typesBaseMatchPlayer } from '@/features/players/types/typesPlayer';

export type typesMatchType = 'F7' | 'F8' | 'F11';
export type typesMatchGender = 'Male' | 'Female' | 'Mixed';
export type typesMatchLevel = 'A' | 'B' | 'C' | 'D' | string;
export type typesMatchStatus = 'active' | 'pending' | 'finished';

export type typesMatch = {
    id: string;
    added_by: string;
    location: string;
    location_url: string;
    price: string;
    team1_name: string;
    team2_name: string;
    starts_at_day: string;
    starts_at_hour: string;
    match_type: typesMatchType;
    match_gender: typesMatchGender;
    match_duration: number;
    // I made it bool because it's less expensive action then string
    team1_color: boolean;
    team2_color: boolean;
    match_instructions: string;
    places_occupied: number;
    created_at: Date;
    match_level: typesMatchLevel;
    has_teams: boolean;
    block_spots_team1: number;
    block_spots_team2: number;
    status: typesMatchStatus;
    isUserInMatch?: boolean;
    match_players: typesBaseMatchPlayer[];
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
    added_by TEXT NOT NULL,
    location TEXT NOT NULL,
    location_url TEXT,
    price DECIMAL(10, 2) NOT NULL,
    team1_name TEXT NOT NULL,
    team2_name TEXT NOT NULL,
    starts_at_day DATE NOT NULL,
    starts_at_hour TIME NOT NULL,
    match_type match_type NOT NULL,
    match_gender match_gender NOT NULL,
    match_duration INTEGER NOT NULL,
    team1_color BOOLEAN NOT NULL,
    team2_color BOOLEAN NOT NULL,
    match_instructions TEXT,
    places_occupied INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    match_level TEXT NOT NULL,
    has_teams BOOLEAN NOT NULL DEFAULT false,
    block_spots_team1 INTEGER NOT NULL DEFAULT 0,
    block_spots_team2 INTEGER NOT NULL DEFAULT 0
    status match_status NOT NULL
);

-- Create indexes for frequently queried columns
CREATE INDEX idx_matches_starts_at_day ON matches(starts_at_day);
CREATE INDEX idx_matches_match_type ON matches(match_type);
CREATE INDEX idx_matches_match_gender ON matches(match_gender);
CREATE INDEX idx_matches_match_level ON matches(match_level);

ALTER TABLE match_players
ADD CONSTRAINT fk_match
FOREIGN KEY (match_id) 
REFERENCES matches(id);

*/