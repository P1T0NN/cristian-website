'use client'

// REACTJS IMPORTS
import { useState, useTransition } from 'react';

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { toast } from 'sonner';

// SERVER ACTIONS
import { verifyDocuments } from '../../actions/server_actions/player_management/verifyDocuments';

// LUCIDE ICONS
import { CheckCircle } from 'lucide-react';

type VerifyDocumentsButtonProps = {
    playerIdFromParams: string;
    isVerified: boolean;
}

export function VerifyDocumentsButton({ 
    playerIdFromParams, 
    isVerified 
}: VerifyDocumentsButtonProps) {
    const t = useTranslations('PlayerPage');

    const [isPending, startTransition] = useTransition();

    const [isOpen, setIsOpen] = useState(false);

    const handleVerify = async () => {
        startTransition(async () => {
            const result = await verifyDocuments({
                playerIdFromParams: playerIdFromParams
            });
            
            if (result.success) {
                setIsOpen(false);
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }

    if (isVerified) {
        return (
            <Button variant="outline" disabled>
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('verified')}
            </Button>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">{t('verifyDocuments')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('verifyDocumentsConfirmation')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p>{t('verifyDocumentsDescription')}</p>
                    <Button 
                        type="button" 
                        onClick={handleVerify} 
                        disabled={isPending}
                        className="w-full"
                    >
                        {isPending ? t('verifying') : t('confirmVerification')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}