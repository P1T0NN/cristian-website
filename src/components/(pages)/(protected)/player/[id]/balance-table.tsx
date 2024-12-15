// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddBalanceButton } from "./add-balance-button";
import { RemoveBalanceButton } from "./remove-balance-button";

// TYPES
import type { typesBalance } from "@/types/typesBalance";

type BalanceTableProps = {
    balances: typesBalance[];
    isCurrentUserAdmin: boolean;
    playerId: string;
};

export const BalanceTable = async ({
    balances,
    isCurrentUserAdmin,
    playerId
}: BalanceTableProps) => {
    const t = await getTranslations("PlayerPage");

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;
    
    return (
        <div className="overflow-x-auto mt-6">
            <h3 className="text-lg font-semibold mb-4">{t('balanceHistory')}</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">{t('tableHeaderDate')}</TableHead>
                        <TableHead className="w-[100px]">{t('tableHeaderBalanceAdded')}</TableHead>
                        <TableHead>{t('tableHeaderReason')}</TableHead>
                        <TableHead className="w-[120px]">{t('tableHeaderAddedBy')}</TableHead>
                        {isCurrentUserAdmin && <TableHead className="w-[160px]">{t('tableHeaderActions')}</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {balances && balances.map((balance) => (
                        <TableRow key={balance.id}>
                            <TableCell className="whitespace-nowrap">{new Date(balance.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className={balance.balance_added >= 0 ? "text-green-500" : "text-red-500"}>
                                {balance.balance_added.toFixed(2)}€
                            </TableCell>
                            <TableCell>{balance.reason}</TableCell>
                            <TableCell className="whitespace-nowrap">{balance.added_by}</TableCell>
                            {isCurrentUserAdmin && (
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={t('addBalanceButtonLabel')}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('addBalanceConfirmTitle')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('addBalanceConfirmDescription')}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                    <AddBalanceButton 
                                                        playerId={playerId} 
                                                        authToken={authToken}
                                                        isAdmin={isCurrentUserAdmin}
                                                    />
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={t('removeBalanceButtonLabel')}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('removeBalanceConfirmTitle')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('removeBalanceConfirmDescription')}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                    <RemoveBalanceButton 
                                                        playerId={playerId} 
                                                        authToken={authToken} 
                                                        isAdmin={isCurrentUserAdmin}
                                                    />
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}