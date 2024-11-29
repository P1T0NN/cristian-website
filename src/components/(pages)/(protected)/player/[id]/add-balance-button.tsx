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
import { Euro } from 'lucide-react';

// SERVER ACTIONS
import { addBalance } from '@/actions/server_actions/mutations/user/addBalance';

type AddBalanceButtonProps = {
    playerId: string;
    authToken: string;
}

export function AddBalanceButton({ 
    playerId, 
    authToken 
}: AddBalanceButtonProps) {
    const t = useTranslations('PlayerPage');

    const [isPending, startTransition] = useTransition();

    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');    

    const handleAddBalance = async () => {
        if (!amount || isNaN(parseFloat(amount))) {
            toast.error(t('invalidAmount'));
            return;
        }

        startTransition(async () => {
            const numericAmount = parseFloat(amount);
            const result = await addBalance(authToken, playerId, numericAmount);
            
            if (result.success) {
                toast.success(result.message);
                setOpen(false);
                setAmount('');
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

                <div className="py-4">
                    <FormInputField
                        name="amount"
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={t('enterAmount')}
                        icon={<Euro className="h-4 w-4" />}
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