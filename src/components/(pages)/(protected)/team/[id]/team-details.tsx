// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// ACTIONS
import { fetchTeam } from "@/actions/team/fetchTeam";
import { getUser } from "@/actions/auth/verifyAuth";

// TYPES
import type { typesTeam } from '@/types/typesTeam';
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { CalendarDays, Star, Edit } from "lucide-react";

type TeamDetailsProps = {
    teamId: string;
}

export const TeamDetails = async ({ 
    teamId, 
}: TeamDetailsProps) => {
    const [t, serverUserData, serverTeamData] = await Promise.all([
        getTranslations("TeamPage"),
        getUser() as Promise<typesUser>,
        fetchTeam(teamId)
    ]);
    
    const teamData = serverTeamData.data as typesTeam;

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${teamData.team_name}`} />
                            <AvatarFallback>{teamData.team_name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl font-bold">{teamData.team_name}</CardTitle>
                        </div>
                    </div>
                    {serverUserData.isAdmin && (
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" /> {t('editTeam')}
                        </Button>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                                <CalendarDays className="h-5 w-5" />
                                <span>{t('createdOn')} {new Date(teamData.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                                <Star className="h-5 w-5" />
                                <span>{t('teamLevel')}: {teamData.team_level}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}