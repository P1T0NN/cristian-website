// LIBRARIES
import { getTranslations } from "next-intl/server";

// TYPES
import type { typesMatch } from "@/types/typesMatch"

type DisplayTeamDetailsProps = {
    match: typesMatch;
}

export const DisplayTeamDetails = async ({
    match
}: DisplayTeamDetailsProps) => {
    const t = await getTranslations("MatchPage");

    return (
        <div className="flex justify-center items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
                <div 
                    className={`w-6 h-6 rounded-full ${match.team1_color ? 'bg-white border' : 'bg-black'}`}
                />
                <span>{match.team1_name} - {match.team1_color ? t('whiteShirt') : t('blackShirt')}</span>
            </div>
            <div className="flex items-center space-x-2">
                <div 
                    className={`w-6 h-6 rounded-full ${match.team2_color ? 'bg-white border' : 'bg-black'}`}
                />
                <span>{match.team2_name} - {match.team2_color ? t('whiteShirt') : t('blackShirt')}</span>
            </div>
        </div>
    )
}