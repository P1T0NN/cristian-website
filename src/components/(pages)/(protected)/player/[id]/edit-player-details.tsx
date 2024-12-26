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
    playerIdFromParams: string;
    initialPhoneNumber: string;
    initialCountry: string;
    initialDNI: string;
    initialPlayerLevel: string;
    initialPlayerPosition: string;
    isAdmin: boolean;
}

export function EditPlayerDetails({ 
    playerIdFromParams, 
    initialPhoneNumber,
    initialCountry,
    initialDNI, 
    initialPlayerLevel, 
    initialPlayerPosition,
    isAdmin
}: EditPlayerDetailsProps) {
    const t = useTranslations("PlayerPage");

    const [isPending, startTransition] = useTransition();

    const [isOpen, setIsOpen] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber ?? '');
    const [country, setCountry] = useState(initialCountry ?? '');
    const [dni, setDNI] = useState(initialDNI ?? '');
    const [playerLevel, setPlayerLevel] = useState(initialPlayerLevel ?? '');
    const [playerPosition, setPlayerPosition] = useState(initialPlayerPosition ?? '');

    const handleEditPlayerDetails = () => {
        startTransition(async () => {
            const result = await editPlayerDetails({
                playerIdFromParams: playerIdFromParams, 
                dni: dni, 
                country: country, 
                phoneNumber: phoneNumber, 
                playerLevel: playerLevel, 
                playerPosition: playerPosition
            });
    
            if (result.success) {
                toast.success(result.message);
                setIsOpen(false);
            } else {
                toast.error(result.message);
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

                <div className="space-y-4">
                    <FormInputField
                        label={t('phoneNumber')}
                        name="phoneNumber"
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={t('enterPhoneNumber')}
                    />

                    <FormInputField
                        label={t('country')}
                        name="country"
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder={t('enterCountry')}
                    />

                    {isAdmin && (
                        <>
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
                        </>
                    )}

                    <Button type="button" onClick={handleEditPlayerDetails} disabled={isPending}>
                        {isPending ? t('updating') : t('updateDetails')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}