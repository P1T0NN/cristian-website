"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { deleteDebt } from "@/actions/server_actions/mutations/debt/deleteDebt";

// TYPES
import { Trash2 } from "lucide-react";

type DeleteDebtButtonProps = {
    debtId: string;
}

export const DeleteDebtButton = ({
    debtId
}: DeleteDebtButtonProps) => {
    const [isPending, startTransition] = useTransition();

    const handleDeleteDebt = async (debtId: string) => {
        if (debtId) {
            startTransition(async () => {
                const result = await deleteDebt({
                    debtId
                });
                
                if (result.success) {
                    toast.success(result.message)
                } else {
                    toast.error(result.message)
                }
            })
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteDebt(debtId)}
            aria-label="Delete debt"
            disabled={isPending}
            className="relative"
        >
            <Trash2 className={`h-4 w-4 transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`} />
            
            {isPending && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </Button>

    )
}