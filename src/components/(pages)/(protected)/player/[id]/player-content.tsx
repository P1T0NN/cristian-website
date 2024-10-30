'use client'

// NEXTJS IMPORTS
import { useRouter } from 'next/navigation';

// LIBRARIES
import { useQuery } from '@tanstack/react-query';

// CONFIG
import { PAGE_ENDPOINTS } from '@/config';

// ACTIONS
import { client_fetchUser } from '@/actions/functions/data/client/user/client_fetchUser';

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { APIResponse } from '@/types/responses/APIResponse';

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayerLoading } from './player-loading';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DebtsTable } from './debts-table';

// LUCIDE ICONS
import { Mail, Calendar, Phone, Shield, CheckCircle, Euro } from 'lucide-react';

type PlayerContentProps = {
    playerId: string;
    authToken: string;
    currentUserData: typesUser;
}

export const PlayerContent = ({
    playerId,
    authToken,
    currentUserData
}: PlayerContentProps) => {
    const router = useRouter();

    const { data, isLoading, isError } = useQuery<APIResponse>({
        queryKey: ['user', playerId],
        queryFn: () => client_fetchUser(authToken, playerId),
    });

    const handleAddDebt = () => {
        router.push(`${PAGE_ENDPOINTS.ADD_DEBT_PAGE}?playerName=${encodeURIComponent(player.fullName)}`);
    };

    if (isLoading) {
        return (
            <PlayerLoading />
        )
    }

    if (isError) return <div className="flex justify-center items-center h-screen text-red-500">Error fetching user data</div>
    if (!data || !data.success) return <div className="flex justify-center items-center h-screen">No user found</div>

    const player = data.data as typesUser;

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="pb-0">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${player.fullName}`} />
                            <AvatarFallback>{player.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl font-bold">{player.fullName}</CardTitle>
                            <div className="flex items-center mt-1 space-x-2">
                                {player.is_verified && (
                                    <Badge variant="secondary" className="text-xs">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                                {player.isAdmin && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Admin
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
                                    <span>{player.email}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <span>{player.phoneNumber}</span>
                                </div>
                            </>
                        )}
                        <div className="flex items-center space-x-4">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span>Joined {new Date(player.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Euro className="h-5 w-5 text-muted-foreground" />
                            <span>
                                Player owes: <span className="font-semibold text-red-500">{player.player_debt.toFixed(2)}€</span>
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Euro className="h-5 w-5 text-muted-foreground" />
                            <span>
                                I owe: <span className="font-semibold text-green-500">{player.cristian_debt.toFixed(2)}€</span>
                            </span>
                        </div>
                    </div>
                    {currentUserData.isAdmin && (
                        <div className="mt-6 mb-6 flex space-x-4">
                            <Button onClick={handleAddDebt}>Add debt</Button>
                        </div>
                    )}
                    <DebtsTable 
                        debts={player.debts || []} 
                        playerId={playerId}
                    />
                </CardContent>
            </Card>
        </div>
    )
}