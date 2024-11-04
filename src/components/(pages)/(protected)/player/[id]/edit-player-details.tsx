"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormInputField } from "@/components/ui/forms/form-input-field";
import { FormSelectField } from "@/components/ui/forms/form-select-field";
import { toast } from "sonner";

// ACTIONS
import { editPlayerDetails } from "@/actions/server_actions/mutations/user/editPlayerDetails";

type EditPlayerDetailsProps = {
    authToken: string;
    playerId: string
    initialDNI: string
    initialPlayerLevel: string
    initialPlayerPosition: string
}

export function EditPlayerDetails({ 
    authToken,
    playerId, 
    initialDNI, 
    initialPlayerLevel, 
    initialPlayerPosition 
}: EditPlayerDetailsProps) {
    const t = useTranslations("PlayerPage");

    const [isPending, startTransition] = useTransition();

    const [isOpen, setIsOpen] = useState(false);

    const [dni, setDNI] = useState(initialDNI ?? '');
    const [playerLevel, setPlayerLevel] = useState(initialPlayerLevel ?? '');
    const [playerPosition, setPlayerPosition] = useState(initialPlayerPosition ?? '');

    const handleEditPlayerDetails = () => {
        startTransition(async () => {
            // We only add try/catch here for smootheness when our transition is finished, that in fairly the same time data changes in UI
            // We can do it setIsOpen also in result.success but I found that using try/catch is faster like for 10ms or so, really its preference
            try {
                const result = await editPlayerDetails(authToken, playerId, dni, playerLevel, playerPosition);
        
                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            } finally {
                setIsOpen(false);
            }
        });
    }

    const positionOptions = [
        { value: 'Goalkeeper', label: t('goalkeeper') },
        { value: 'Defender', label: t('defender') },
        { value: 'Middle', label: t('midfielder') },
        { value: 'Forward', label: t('attacker') },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">{t('editPlayerInformation')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('editPlayerInformation')}</DialogTitle>
                </DialogHeader>

                <form action={handleEditPlayerDetails} className="space-y-4">
                    <FormInputField
                        label={t('dni')}
                        name="dni"
                        type="text"
                        value={dni}
                        onChange={(e) => setDNI(e.target.value)}
                        placeholder={t('enterDNI')}
                    />
                    <FormInputField
                        label={t('playerLevel')}
                        name="level"
                        type="text"
                        value={playerLevel}
                        onChange={(e) => setPlayerLevel(e.target.value)}
                        placeholder={t('enterPlayerLevel')}
                    />
                    <FormSelectField
                        label={t('playerPosition')}
                        name="position"
                        value={playerPosition}
                        onChange={(value) => setPlayerPosition(value)}
                        options={positionOptions}
                        placeholder={t('selectPlayerPosition')}
                    />
                    <Button type="submit" disabled={isPending}>
                        {isPending ? t('updating') : t('updateDetails')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}