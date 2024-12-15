"use client"

// REACTJS IMPORTS
import { useState, useTransition } from 'react';

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FormInputField } from '@/components/ui/forms/form-input-field';
import { toast } from 'sonner';

// ICONS
import { Euro, FileText } from 'lucide-react';

// SERVER ACTIONS
import { addBalance } from '@/actions/server_actions/mutations/balance/addBalance';

type AddBalanceButtonProps = {
    authToken: string;
    playerId: string;
    isAdmin: boolean;
    addedBy: string;
}

export function AddBalanceButton({ 
    authToken,
    playerId,
    isAdmin,
    addedBy
}: AddBalanceButtonProps) {
    const t = useTranslations('PlayerPage');

    const [isPending, startTransition] = useTransition();

    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    const handleAddBalance = async () => {
        if (!amount || isNaN(parseFloat(amount))) {
            toast.error(t('invalidAmount'));
            return;
        }

        if (!reason.trim()) {
            toast.error(t('reasonRequired'));
            return;
        }

        startTransition(async () => {
            const numericAmount = parseFloat(amount);
            const result = await addBalance(authToken, playerId, numericAmount, reason, addedBy, isAdmin);
            
            if (result.success) {
                toast.success(result.message);
                setOpen(false);
                setAmount('');
                setReason('');
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">{t('addBalance')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('addBalance')}</DialogTitle>
                    <DialogDescription>
                        {t('addBalanceDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <FormInputField
                        name="amount"
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={t('enterAmount')}
                        icon={<Euro className="h-4 w-4" />}
                    />
                    <FormInputField
                        name="reason"
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={t('enterReason')}
                        icon={<FileText className="h-4 w-4" />}
                    />
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleAddBalance} disabled={isPending}>
                        {isPending ? t('adding') : t('addBalance')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}