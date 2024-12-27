// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DebtsTable } from "./debts-table";
import { BalanceTable } from "./balance-table";
import { EditPlayerDetails } from "./edit-player-details";
import { AddDebtDialog } from "./add-debt-dialog";
import { AddBalanceButton } from "./add-balance-button";
import { VerifyDocumentsButton } from "./verify-documents-button";

// ACTIONS
import { fetchPlayer } from "@/actions/user/fetchPlayer";
import { getUser } from "@/actions/auth/verifyAuth";

// UTILS
import { getPositionLabel } from "@/utils/next-intl/getPlayerPositionLabel";

// TYPES
import type { typesUser } from "@/types/typesUser";

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
    const t = await getTranslations("PlayerPage");

    const currentUserData = await getUser() as typesUser;

    const serverPlayerData = await fetchPlayer(playerIdFromParams);
    const playerData = serverPlayerData.data as typesUser;

    const positionLabel = await getPositionLabel(playerData.player_position);

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="pb-0">
                <p className="text-red-500 font-semibold mb-4">
                    {t('adminOnlyInfo')}
                </p>
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${playerData.fullName}`} />
                        <AvatarFallback>{playerData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="text-center sm:text-left">
                        <CardTitle className="text-2xl font-bold">{playerData.fullName}</CardTitle>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center mt-1 gap-2">
                            {playerData.verify_documents && (
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
                    {currentUserData.isAdmin && <InfoItem icon={<Star className="h-5 w-5 text-muted-foreground" />} text={`${t('playerLevel')}: ${playerData.player_level || t('notProvided')}`} />}
                    <InfoItem icon={<Euro className="h-5 w-5 text-muted-foreground" />} text={`${t('playerOwes')}: `} value={<span className="font-semibold text-red-500">{playerData.player_debt.toFixed(2)}€</span>} />
                    <InfoItem icon={<Euro className="h-5 w-5 text-muted-foreground" />} text={`${t('iOwe')}: `} value={<span className="font-semibold text-green-500">{playerData.cristian_debt.toFixed(2)}€</span>} />
                    <InfoItem icon={<Wallet className="h-5 w-5 text-muted-foreground" />} text={`${t('balance')}: `} value={<span className={`font-semibold ${playerData.balance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>{playerData.balance.toFixed(2)}€</span>} />
                </div>

                <div className="flex flex-wrap items-center mt-6 mb-6 gap-4">
                    {currentUserData.isAdmin && (
                        <>
                            <AddDebtDialog 
                                initialPlayerName={playerData.fullName}
                                addedBy={currentUserData.fullName}
                            />

                            {/* Client component thats why we pass more props */}
                            <AddBalanceButton
                                playerIdFromParams={playerIdFromParams}
                                isAdmin={currentUserData.isAdmin}
                                addedBy={currentUserData.fullName}
                            />

                            {/* Client component thats why we pass more props */}
                            <VerifyDocumentsButton
                                playerIdFromParams={playerIdFromParams}
                                isVerified={playerData.verify_documents}
                            />
                        </>
                    )}
                    <EditPlayerDetails
                        playerIdFromParams={playerIdFromParams}
                        initialFullName={playerData.fullName}
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
                />

                <BalanceTable 
                    playerIdFromParams={playerIdFromParams}
                    balances={playerData.balances || []}
                />
            </CardContent>
        </Card>
    )
}