// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { MatchHeaderAdminControls } from "./match-header-admin-controls";
import { Badge } from "@/shared/components/ui/badge";

// ACTIONS
import { fetchMatch } from "../../actions/fetchMatch";
import { getUser } from "@/features/auth/actions/verifyAuth";

// UTILS
import { formatMatchTypeShort } from "../../utils/matchTypeFormatter";
import { getGenderLabel } from "@/shared/utils/next-intl/getGenderLabel";
import { formatDate, formatTime } from "@/shared/utils/dateUtils";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";

// LUCIDE ICONS
import { Trophy, Users, Swords, MapPin } from "lucide-react";

interface MatchHeaderProps {
    matchIdFromParams: string
}

export const MatchHeader = async ({ 
    matchIdFromParams 
}: MatchHeaderProps) => {
    const [serverMatchData, currentUserData, t] = await Promise.all([
        fetchMatch(matchIdFromParams),
        getUser() as Promise<typesUser>,
        getTranslations('MatchPage')
    ]);

    const match = serverMatchData.data;

    return (
        <>
            {currentUserData.isAdmin && (
                <MatchHeaderAdminControls matchIdFromParams={matchIdFromParams} />
            )}

            <header className="bg-gradient-to-br from-gray-900 to-gray-700 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col space-y-4">
                        <div className="text-sm text-gray-300">
                            <time>
                                {formatDate(match?.startsAtDay as string, true)} {formatTime(match?.startsAtHour as string)}
                            </time>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                                {currentUserData.isAdmin && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-gray-800 text-white px-4 py-2 text-sm rounded-full flex items-center"
                                    >
                                        <Trophy className="h-5 w-5 mr-2" />
                                        {match?.matchLevel}
                                    </Badge>
                                )}

                                <Badge
                                    variant="secondary"
                                    className="bg-gray-800 text-white px-4 py-2 text-sm rounded-full flex items-center"
                                >
                                    <Users className="h-5 w-5 mr-2" />
                                    {formatMatchTypeShort(match?.matchType as string)}
                                </Badge>

                                <Badge
                                    variant="secondary"
                                    className="bg-gray-800 text-white px-4 py-2 text-sm rounded-full flex items-center"
                                >
                                    <Swords className="h-5 w-5 mr-2" />
                                    {getGenderLabel(match?.matchGender as string)}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-300">
                            <MapPin className="h-5 w-5" />
                            <span>{match?.location}</span>
                        </div>
                    </div>
                </div>
            </header>

            <Link href="#match-faq">
                <div className="container mx-auto px-4 py-4 text-center bg-red-50 border-b border-red-100">
                    <p className="text-yellow-800 font-medium">
                        {t('beforeJoinReadFAQ')}
                    </p>
                </div>
            </Link>

            <div className="container mx-auto px-4 py-3 text-center bg-blue-50 border-b border-blue-100">
                <p className="text-blue-800 font-medium italic">
                    {t('teamsNotFixed')}
                </p>
            </div>
        </>
    )
}