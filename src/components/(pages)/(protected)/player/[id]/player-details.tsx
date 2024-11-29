// NEXTJS IMPORTS
import { cookies } from "next/headers";
import Link from "next/link";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { ADMIN_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DebtsTable } from "./debts-table";
import { EditPlayerDetails } from "./edit-player-details";
import { AddBalanceButton } from "./add-balance-button";

// ACTIONS
import { serverFetchPlayer } from "@/actions/functions/data/server/server_fetchPlayer";

// UTILS
import { getPositionLabel } from "@/utils/next-intl/getPlayerPositionLabel";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { CheckCircle, Wallet, Shield, Mail, Calendar, Phone, Euro, BadgeIcon as IdCard, Users, Star, MapPin } from 'lucide-react';

type PlayerDetailsProps = {
    playerId: string;
    currentUserData: typesUser;
}

const InfoItem = ({ icon, text, value }: { icon: React.ReactNode, text: string, value?: React.ReactNode }) => (
    <div className="flex items-center space-x-4">
        {icon}
        <span className="flex-grow">{text}</span>
        {value && value}
    </div>
)

export const PlayerDetails = async ({
    playerId,
    currentUserData
}: PlayerDetailsProps) => {
    const t = await getTranslations("PlayerPage");

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const serverPlayerData = await serverFetchPlayer(playerId);

    const playerData = serverPlayerData.data as typesUser;

    const positionLabel = await getPositionLabel(playerData.player_position);

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="pb-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${playerData.fullName}`} />
                        <AvatarFallback>{playerData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                        <CardTitle className="text-2xl font-bold">{playerData.fullName}</CardTitle>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center mt-1 gap-2">
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
                    <InfoItem icon={<Mail className="h-5 w-5 text-muted-foreground" />} text={playerData.email} />
                    <InfoItem icon={<Phone className="h-5 w-5 text-muted-foreground" />} text={playerData.phoneNumber} />
                    <InfoItem icon={<MapPin className="h-5 w-5 text-muted-foreground" />} text={playerData.country || t('notProvided')} />
                    <InfoItem icon={<Calendar className="h-5 w-5 text-muted-foreground" />} text={`${t('joined')} ${new Date(playerData.created_at).toLocaleDateString()}`} />
                    <InfoItem icon={<IdCard className="h-5 w-5 text-muted-foreground" />} text={`${t('dni')}: ${playerData.dni || t('notProvided')}`} />
                    <InfoItem icon={<Users className="h-5 w-5 text-muted-foreground" />} text={`${t('playerPosition')}: ${positionLabel || t('notProvided')}`} />
                    <InfoItem icon={<Star className="h-5 w-5 text-muted-foreground" />} text={`${t('playerLevel')}: ${playerData.player_level || t('notProvided')}`} />
                    <InfoItem icon={<Euro className="h-5 w-5 text-muted-foreground" />} text={`${t('playerOwes')}: `} value={<span className="font-semibold text-red-500">{playerData.player_debt.toFixed(2)}€</span>} />
                    <InfoItem icon={<Euro className="h-5 w-5 text-muted-foreground" />} text={`${t('iOwe')}: `} value={<span className="font-semibold text-green-500">{playerData.cristian_debt.toFixed(2)}€</span>} />
                    <InfoItem icon={<Wallet className="h-5 w-5 text-muted-foreground" />} text={`${t('balance')}: `} value={<span className={`font-semibold ${playerData.balance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>{playerData.balance.toFixed(2)}€</span>} />
                </div>

                <div className="flex flex-wrap items-center mt-6 mb-6 gap-4">
                    {currentUserData.isAdmin && (
                        <>
                            <Link 
                                className="flex items-center h-[35px] bg-primary text-secondary px-4 rounded hover:bg-primary/80 transition-all"
                                href={`${ADMIN_PAGE_ENDPOINTS.ADD_DEBT_PAGE}?playerName=${encodeURIComponent(playerData.fullName)}`}
                            >
                                {t('addDebt')}
                            </Link>
                            <AddBalanceButton
                                authToken={authToken}
                                playerId={playerId}
                                isAdmin={currentUserData.isAdmin}
                            />
                        </>
                    )}
                    <EditPlayerDetails
                        authToken={authToken}
                        playerId={playerId}
                        initialPhoneNumber={playerData.phoneNumber}
                        initialCountry={playerData.country}
                        initialDNI={playerData.dni}
                        initialPlayerLevel={playerData.player_level}
                        initialPlayerPosition={playerData.player_position}
                        isAdmin={currentUserData.isAdmin}
                    />
                </div>
                
                <DebtsTable
                    debts={playerData.debts || []} 
                    isCurrentUserAdmin={currentUserData.isAdmin}
                />
            </CardContent>
        </Card>
    )
}