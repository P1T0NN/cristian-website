'use client'

// LIBRARIES
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ACTIONS
import { deleteDebt } from '@/actions/functions/queries/delete-debt';

// TYPES
import type { typesDebt } from "@/types/typesDebt";

type DebtsTableProps = {
    debts: typesDebt[];
    playerId: string;
};

export const DebtsTable = ({ 
    debts,
    playerId
}: DebtsTableProps) => {
    const queryClient = useQueryClient();
    const [debtToDelete, setDebtToDelete] = useState<string | null>(null);

    const handleDelete = async () => {
        if (debtToDelete) {
            const result = await deleteDebt(debtToDelete);
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['user', playerId] });
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
            setDebtToDelete(null);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Individual Debts</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Player Owes</TableHead>
                        <TableHead>I Owe</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Added By</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {debts && debts.map((debt) => (
                        <TableRow key={debt.id}>
                            <TableCell>{new Date(debt.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-red-500">{debt.player_debt.toFixed(2)}€</TableCell>
                            <TableCell className="text-green-500">{debt.cristian_debt.toFixed(2)}€</TableCell>
                            <TableCell>{debt.reason}</TableCell>
                            <TableCell>{debt.added_by}</TableCell>
                            <TableCell>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDebtToDelete(debt.id)}
                                            aria-label="Delete debt"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the debt
                                                and remove it from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setDebtToDelete(null)}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}