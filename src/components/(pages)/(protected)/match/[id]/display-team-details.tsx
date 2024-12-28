// LIBRARIES
import { getTranslations } from "next-intl/server";

// ACTIONS
import { fetchMatch } from "@/actions/match/fetchMatch";

// TYPES
import type { typesMatch } from "@/types/typesMatch"

type DisplayTeamDetailsProps = {
    matchIdFromParams: string;
}

export const DisplayTeamDetails = async ({
    matchIdFromParams
}: DisplayTeamDetailsProps) => {
    const [t, serverMatchData] = await Promise.all([
        getTranslations("MatchPage"),
        fetchMatch(matchIdFromParams)
    ]);
    
    const match = serverMatchData.data?.match as typesMatch;

    return (
        <div className="flex flex-col justify-center items-center space-x-4 mb-4">
            <div className="flex justify-center items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <div 
                        className={`w-6 h-6 rounded-full ${match.team1_color ? 'bg-white border' : 'bg-black'}`}
                    />
                    <span>{match.team1_name} - {match.team1_color ? t('whiteShirt') : t('blackShirt')}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span>{match.team2_name} - {match.team2_color ? t('whiteShirt') : t('blackShirt')}</span>
                    <div 
                        className={`w-6 h-6 rounded-full ${match.team2_color ? 'bg-white border' : 'bg-black'}`}
                    />
                </div>
            </div>

            <div>
                <span>{t('necessaryTwoShirts')}</span>
            </div>
        </div>
    )
}