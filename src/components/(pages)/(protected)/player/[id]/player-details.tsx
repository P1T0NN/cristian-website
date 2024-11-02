// REACTJS IMPORTS
import { Suspense } from "react";

// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DebtsTable } from "./debts-table";
import { DebtsTableLoading } from "./loading/debts-table-loading";

// ACTIONS
import { serverFetchPlayer } from "@/actions/functions/data/server/server_fetchPlayer";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { CheckCircle, Shield, Mail, Calendar, Phone, Euro } from "lucide-react";

type PlayerDetailsProps = {
    playerId: string;
    currentUserData: typesUser;
}

export const PlayerDetails = async ({
    playerId,
    currentUserData
}: PlayerDetailsProps) => {
    const t = await getTranslations("PlayerPage");

    const serverPlayerData = await serverFetchPlayer(playerId);

    const playerData = serverPlayerData.data as typesUser;

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="pb-0">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${playerData.fullName}`} />
                        <AvatarFallback>{playerData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl font-bold">{playerData.fullName}</CardTitle>
                        <div className="flex items-center mt-1 space-x-2">
                            {playerData.is_verified && (
                                <Badge variant="secondary" className="text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {t('verified')}
                                </Badge>
                            )}
                            {playerData.isAdmin && (
                                <Badge variant="secondary" className="text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    {t('admin')}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid gap-4 mb-6">
                    {currentUserData.isAdmin && (
                        <>
                            <div className="flex items-center space-x-4">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <span>{playerData.email}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <span>{playerData.phoneNumber}</span>
                            </div>
                        </>
                    )}
                    <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span>{t('joined')} {new Date(playerData.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Euro className="h-5 w-5 text-muted-foreground" />
                        <span>
                            {t('playerOwes')}: <span className="font-semibold text-red-500">{playerData.player_debt.toFixed(2)}€</span>
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Euro className="h-5 w-5 text-muted-foreground" />
                        <span>
                            {t('iOwe')}: <span className="font-semibold text-green-500">{playerData.cristian_debt.toFixed(2)}€</span>
                        </span>
                    </div>
                </div>

                {currentUserData.isAdmin && (
                    <div className="mt-6 mb-6 flex space-x-4">
                        <Link 
                            className="bg-primary text-secondary py-2 px-4 font-bold rounded hover:bg-primary/80 transition-all"
                            href={`${PAGE_ENDPOINTS.ADD_DEBT_PAGE}?playerName=${encodeURIComponent(playerData.fullName)}`}
                        >
                            {t('addDebt')}
                        </Link>
                    </div>
                )}
                
                <Suspense fallback={<DebtsTableLoading isCurrentUserAdmin={currentUserData.isAdmin} />}>
                    <DebtsTable
                        debts={playerData.debts || []} 
                        isCurrentUserAdmin={currentUserData.isAdmin}
                    />
                </Suspense>
            </CardContent>
        </Card>
    )
}