'use client'

// REACTJS IMPORTS
import { useState, useTransition } from 'react';

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// SERVER ACTIONS
import { updatePlayerLevel } from '@/actions/server_actions/mutations/user/updatePlayerLevel';

type UpdatePlayerLevelProps = {
    userId: string;
    currentLevel: string;
}

export function UpdatePlayerLevel({ 
    userId, 
    currentLevel, 
}: UpdatePlayerLevelProps) {
    const t = useTranslations('AccessForRegistrationPage');
    
    const [isPending, startTransition] = useTransition();
    
    const [isOpen, setIsOpen] = useState(false);
    const [newLevel, setNewLevel] = useState(currentLevel);

    const handleUpdateLevel = async () => {
        if (newLevel === currentLevel) {
            toast.error(t('levelUnchanged'));
            return;
        }

        startTransition(async () => {
            const result = await updatePlayerLevel({
                userId: userId, 
                newLevel: newLevel
            });
            
            if (result.success) {
                setIsOpen(false);
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">{t('editLevel')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('updatePlayerLevel')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="playerLevel">{t('playerLevel')}</Label>
                        <Input
                            id="playerLevel"
                            value={newLevel}
                            onChange={(e) => setNewLevel(e.target.value)}
                            placeholder={t('enterPlayerLevel')}
                        />
                    </div>
                    <Button 
                        type="button" 
                        onClick={handleUpdateLevel} 
                        disabled={isPending || !newLevel || newLevel === currentLevel}
                        className="w-full"
                    >
                        {isPending ? t('updating') : t('updateLevel')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}