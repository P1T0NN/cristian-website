// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { RemoveBalanceButton } from "./remove-balance-button";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";

// TYPES
import type { typesBalance } from "@/features/balance/types/typesBalance";
import type { typesUser } from "@/features/players/types/typesPlayer";

// LUCIDE ICONS
import { Trash2 } from 'lucide-react';

type BalanceTableProps = {
    playerIdFromParams: string,
    balances: typesBalance[];
};

export const BalanceTable = async ({
    playerIdFromParams,
    balances,
}: BalanceTableProps) => {
    const [t, currentUserData] = await Promise.all([
        getTranslations("PlayerPage"),
        getUser() as Promise<typesUser>
    ]);
    
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
                        {currentUserData.isAdmin && <TableHead className="w-[160px]">{t('tableHeaderActions')}</TableHead>}
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
                            {currentUserData.isAdmin && (
                                <TableCell>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={t('removeBalanceButtonLabel')}
                                            >
                                                <Trash2 className="h-4 w-4" />
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

                                                {/* Client component thats why we have to pass additional props */}
                                                <RemoveBalanceButton 
                                                    playerIdFromParams={playerIdFromParams} 
                                                    isAdmin={currentUserData.isAdmin}
                                                    balanceId={balance.id}
                                                />
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}