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
import { addFriend } from '@/actions/server_actions/mutations/match/addFriend';

type AddFriendButtonProps = {
    matchId: string;
    teamNumber: 0 | 1 | 2;
    authToken: string;
}

export function AddFriendButton({ 
    matchId, 
    teamNumber, 
    authToken 
}: AddFriendButtonProps) {
    const t = useTranslations('MatchPage');
    const [isPending, startTransition] = useTransition();

    const [isOpen, setIsOpen] = useState(false);
    const [friendName, setFriendName] = useState('');

    const handleAddFriend = async () => {
        startTransition(async () => {
            const result = await addFriend(authToken, matchId, teamNumber, friendName);
            
            if (result.success) {
                setIsOpen(false);
                setFriendName('');
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">{t('addFriend')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('addFriendToMatch')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="friendName">{t('friendsName')}</Label>
                    <Input
                        id="friendName"
                        value={friendName}
                        onChange={(e) => setFriendName(e.target.value)}
                        placeholder={t('enterFriendName')}
                    />
                </div>
                <Button type="button" onClick={handleAddFriend} disabled={isPending}>
                    {isPending ? t('adding') : t('addFriend')}
                </Button>
            </DialogContent>
        </Dialog>
    )
}