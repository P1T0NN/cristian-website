// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { DebtsTable } from "./debts-table";
import { BalanceTable } from "./balance-table";
import { EditPlayerDetails } from "../edit-player/edit-player-details";
import { AddDebtDialog } from "./add-debt-dialog";
import { AddBalanceButton } from "./add-balance-button";
import { VerifyDocumentsButton } from "../verify-player/verify-documents-button";
import { RestrictAccessButton } from "@/features/players/components/player-details/restrict-access-button";

// ACTIONS
import { fetchPlayer } from "../../actions/fetchPlayer";
import { getUser } from "@/features/auth/actions/verifyAuth";

// UTILS
import { formatPlayerPositionLocalized } from "../../utils/playerUtils";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";

// LUCIDE ICONS
import { CheckCircle, Wallet, Shield, Mail, Calendar, Phone, Euro, BadgeIcon as IdCard, Users, Star, MapPin } from 'lucide-react';

type PlayerDetailsProps = {
    playerIdFromParams: string;
}

const InfoItem = ({ icon, text, value }: { icon: React.ReactNode, text: string, value?: React.ReactNode }) => (
    <div className="flex items-center space-x-4">
        {icon}
        <span className="flex-grow">{text}</span>
        {value && value}
    </div>
)

export const PlayerDetails = async ({
    playerIdFromParams,
}: PlayerDetailsProps) => {
    const [t, currentUserData, serverPlayerData] = await Promise.all([
        getTranslations("PlayerPage"),
        getUser() as Promise<typesUser>,
        fetchPlayer(playerIdFromParams)
    ]);

    const playerData = serverPlayerData.data as typesUser;
    
    // Add null check for player_position
    const positionLabel = await formatPlayerPositionLocalized(playerData.playerPosition || '');

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="pb-0">
                <p className="text-red-500 font-semibold mb-4">
                    {t('adminOnlyInfo')}
                </p>
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${playerData.name}`} />
                        <AvatarFallback>{playerData.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="text-center sm:text-left">
                        <CardTitle className="text-2xl font-bold">{playerData.name}</CardTitle>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center mt-1 gap-2">
                            {playerData.verifyDocuments && (
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
                    <InfoItem icon={<Calendar className="h-5 w-5 text-muted-foreground" />} text={`${t('joined')} ${new Date(playerData.createdAt).toLocaleDateString()}`} />
                    <InfoItem icon={<IdCard className="h-5 w-5 text-muted-foreground" />} text={`${t('dni')}: ${playerData.dni || t('notProvided')}`} />
                    <InfoItem icon={<Users className="h-5 w-5 text-muted-foreground" />} text={`${t('playerPosition')}: ${positionLabel || t('notProvided')}`} />
                    {currentUserData.isAdmin && <InfoItem icon={<Star className="h-5 w-5 text-muted-foreground" />} text={`${t('playerLevel')}: ${playerData.playerLevel || t('notProvided')}`} />}
                    <InfoItem icon={<Euro className="h-5 w-5 text-muted-foreground" />} text={`${t('playerOwes')}: `} value={<span className="font-semibold text-red-500">{playerData.playerDebt.toFixed(2)}€</span>} />
                    <InfoItem icon={<Euro className="h-5 w-5 text-muted-foreground" />} text={`${t('iOwe')}: `} value={<span className="font-semibold text-green-500">{playerData.cristianDebt.toFixed(2)}€</span>} />
                    <InfoItem icon={<Wallet className="h-5 w-5 text-muted-foreground" />} text={`${t('balance')}: `} value={<span className={`font-semibold ${playerData.balance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>{playerData.balance.toFixed(2)}€</span>} />
                </div>

                <div className="flex flex-wrap items-center mt-6 mb-6 gap-4">
                    {currentUserData.isAdmin && (
                        <>
                            <AddDebtDialog 
                                initialPlayerName={playerData.name}
                                addedBy={currentUserData.name}
                            />

                            <AddBalanceButton
                                playerIdFromParams={playerIdFromParams}
                                isAdmin={currentUserData.isAdmin}
                                addedBy={currentUserData.name}
                            />

                            <VerifyDocumentsButton
                                playerIdFromParams={playerIdFromParams}
                                isVerified={playerData.verifyDocuments}
                            />

                            <RestrictAccessButton 
                                playerId={playerIdFromParams}
                                playerName={playerData.name}
                                isAdmin={currentUserData.isAdmin}
                            />
                        </>
                    )}
                    <EditPlayerDetails
                        playerIdFromParams={playerIdFromParams}
                        initialEmail={playerData.email}
                        initialName={playerData.name}
                        initialPhoneNumber={playerData.phoneNumber}
                        initialCountry={playerData.country}
                        initialDNI={playerData.dni}
                        initialPlayerLevel={playerData.playerLevel}
                        initialPlayerPosition={playerData.playerPosition}
                        isAdmin={currentUserData.isAdmin}
                    />
                </div>
                
                <DebtsTable
                    debts={playerData.debts || []}
                />

                <BalanceTable 
                    playerIdFromParams={playerIdFromParams}
                    balances={playerData.balances || []}
                />
            </CardContent>
        </Card>
    )
}