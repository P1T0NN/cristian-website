"use client"

// REACTJS IMPORTS
import { useTransition } from 'react';

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import { toast } from 'sonner';

// ICONS
import { Trash2 } from 'lucide-react';

// SERVER ACTIONS
import { removeBalance } from '@/features/balance/actions/server_actions/removeBalance';

type RemoveBalanceButtonProps = {
    playerIdFromParams: string;
    isAdmin: boolean;
    balanceId: string;
}

export function RemoveBalanceButton({ 
    playerIdFromParams,
    isAdmin,
    balanceId
}: RemoveBalanceButtonProps) {
    const t = useTranslations('PlayerPage');

    const [isPending, startTransition] = useTransition();

    const handleRemoveBalance = async () => {
        startTransition(async () => {
            const result = await removeBalance({
                playerIdFromParams: playerIdFromParams, 
                balanceId: balanceId, 
                isAdmin: isAdmin
            });
            
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveBalance}
            disabled={isPending}
            aria-label={t('removeBalanceButtonLabel')}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}