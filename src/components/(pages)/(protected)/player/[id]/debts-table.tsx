// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { DeleteDebtButton } from "./delete-debt-button";

// TYPES
import type { typesDebt } from "@/types/typesDebt";

type DebtsTableProps = {
    debts: typesDebt[];
    isCurrentUserAdmin: boolean;
};

export const DebtsTable = async ({
    debts,
    isCurrentUserAdmin
}: DebtsTableProps) => {
    const t = await getTranslations("PlayerPage");

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;
    
    return (
        <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">{t('individualDebts')}</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">{t('tableHeaderDate')}</TableHead>
                        <TableHead className="w-[100px]">{t('tableHeaderPlayerOwes')}</TableHead>
                        <TableHead className="w-[100px]">{t('tableHeaderIOwe')}</TableHead>
                        <TableHead>{t('tableHeaderReason')}</TableHead>
                        <TableHead className="w-[120px]">{t('tableHeaderAddedBy')}</TableHead>
                        {isCurrentUserAdmin && <TableHead className="w-[80px]">{t('tableHeaderActions')}</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {debts && debts.map((debt) => (
                        <TableRow key={debt.id}>
                            <TableCell className="whitespace-nowrap">{new Date(debt.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-red-500 whitespace-nowrap">{debt.player_debt.toFixed(2)}€</TableCell>
                            <TableCell className="text-green-500 whitespace-nowrap">{debt.cristian_debt.toFixed(2)}€</TableCell>
                            <TableCell>{debt.reason}</TableCell>
                            <TableCell className="whitespace-nowrap">{debt.added_by}</TableCell>
                            {isCurrentUserAdmin && (
                                <TableCell>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={t('deleteDebtButtonLabel')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('deleteDebtConfirmTitle')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('deleteDebtConfirmDescription')}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('deleteDebtCancel')}</AlertDialogCancel>
                                                <DeleteDebtButton debtId={debt.id} authToken={authToken} />
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