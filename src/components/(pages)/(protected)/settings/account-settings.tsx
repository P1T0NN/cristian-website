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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';

// ACTIONS
import { updateUserFullName } from '@/actions/functions/queries/update-user-full-name';

// TYPES
import type { typesUser } from '@/types/typesUser';
import type { Locale } from '@/i18n/config';

type AccountSettingsProps = {
    serverUserData: typesUser;
    authToken: string;
    currentLocale: string;
}

export const AccountSettings = ({ 
    serverUserData,
    authToken,
    currentLocale
}: AccountSettingsProps) => {
    const t = useTranslations('SettingsPage');

    const [fullName, setFullName] = useState(serverUserData.fullName);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSave = async () => {
        setIsLoading(true);
        const result = await updateUserFullName(authToken, fullName);
        setIsLoading(false);

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    const handleLanguageChange = (newLocale: string) => {
        startTransition(async () => {
            try {
                await setUserLocale(newLocale as Locale);
                // Refresh the page to apply the new locale
                window.location.reload();
            } catch {
                toast.error('Failed to update language preference');
            }
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
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input id="email" value={serverUserData.email} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="language">{t('language')}</Label>
                    <Select 
                        defaultValue={currentLocale}
                        onValueChange={handleLanguageChange}
                        disabled={isPending}
                    >
                        <SelectTrigger id="language" className={isPending ? 'opacity-50' : ''}>
                            <SelectValue placeholder={t('selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">{t('english')}</SelectItem>
                            <SelectItem value="es">{t('spanish')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full" 
                    onClick={handleSave} 
                    disabled={isLoading || fullName === serverUserData.fullName}
                >
                    {isLoading ? t('saving') : t('saveChanges')}
                </Button>
            </CardFooter>
        </Card>
    )
}