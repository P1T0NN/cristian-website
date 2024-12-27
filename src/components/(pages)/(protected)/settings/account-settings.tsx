"use client"

// REACTJS IMPORTS
import { useState, useTransition } from 'react';

// LIBRARIES
import { useTranslations } from 'next-intl';

// SERVICES
import { setUserLocale } from '@/services/server/locale';

// COMPONENTS
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';

// SERVER ACTIONS
import { updateUserFullName } from '@/actions/server_actions/mutations/user/updateUserFullName';

// TYPES
import type { Locale } from '@/i18n/config';

type AccountSettingsProps = {
    currentLocale: string;
    currentUserFullName: string;
    currentUserEmail: string;
}

export const AccountSettings = ({ 
    currentLocale,
    currentUserFullName,
    currentUserEmail,
}: AccountSettingsProps) => {
    const t = useTranslations('SettingsPage');

    const [isPending, startTransition] = useTransition();

    const [fullName, setFullName] = useState(currentUserFullName);

    const handleSaveFullName = async () => {
        if (fullName) {
            startTransition(async () => {
                const result = await updateUserFullName({
                    fullName: fullName
                });

                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            });
        }
    };

    const handleLanguageChange = (newLocale: string) => {
        startTransition(async () => {
            await setUserLocale(newLocale as Locale);
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('accountSettings')}</CardTitle>
                <CardDescription>{t('manageYourAccount')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${fullName}`} />
                        <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name">{t('name')}</Label>
                    <Input 
                        id="name" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        disabled
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input id="email" value={currentUserEmail} disabled />
                </div>
                <div className="space-y-2">
                    <Label>{t('language')}</Label>
                    <div className="flex space-x-2">
                        <Button
                            variant={currentLocale === 'en' ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleLanguageChange('en')}
                            disabled={isPending}
                        >
                            English
                        </Button>
                        <Button
                            variant={currentLocale === 'es' ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleLanguageChange('es')}
                            disabled={isPending}
                        >
                            Español
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full" 
                    onClick={handleSaveFullName} 
                    disabled={isPending || fullName === currentUserFullName}
                >
                    {isPending ? t('saving') : t('saveChanges')}
                </Button>
            </CardFooter>
        </Card>
    )
}
