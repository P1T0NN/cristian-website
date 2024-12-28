export const formatMatchType = (type: string) => {
    switch (type) {
        case "F8": return "8v8"
        case "F7": return "7v7"
        case "F11": return "11v11"
        default: return type
    }
};

export const getTotalPlaces = (matchType: string) => {
    switch (matchType) {
        case "F8": return 16;
        case "F7": return 14;
        case "F11": return 22;
        default: return 0;
    }
};

export const calculateMatchPlaces = (match: {
    match_type: string;
    team1_name: string;
    team2_name: string;
    places_occupied: number;
}) => {
    const totalPlaces = getTotalPlaces(match.match_type);
    const placesPerTeam = totalPlaces / 2;
    
    let occupiedPlaces = match.places_occupied || 0;

    if (match.team1_name !== "Equipo 1") {
        occupiedPlaces += placesPerTeam;
    }
    if (match.team2_name !== "Equipo 2") {
        occupiedPlaces += placesPerTeam;
    }

    const finalOccupiedPlaces = Math.min(totalPlaces, occupiedPlaces);
    const placesLeft = Math.max(0, totalPlaces - finalOccupiedPlaces);

    return {
        totalPlaces,
        occupiedPlaces: finalOccupiedPlaces,
        placesLeft
    };
};

export const getPlacesLeftText = (
    placesLeft: number,
    isAdmin: boolean,
    t: (key: string) => string
) => {
    if (placesLeft === 0) {
        return t('matchCompleted');
    } else if (placesLeft <= 3) {
        return t('lastPlacesLeft');
    } else {
        if (isAdmin) {
            return `${placesLeft} ${t('placesLeft')}`;
        } else {
            return t('available');
        }
    }
};

export const getPlacesLeftColor = (placesLeft: number) => {
    return placesLeft <= 3 ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-600';
};