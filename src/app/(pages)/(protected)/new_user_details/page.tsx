"use client"

// REACTJS IMPORTS
import { useTransition } from 'react';

// NEXTJS IMPORTS
import { useRouter } from 'next/navigation';

// LIBRARIES
import { useTranslations } from 'next-intl';

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from '@/config';

// COMPONENTS
import { FormInputField } from '@/shared/components/ui/forms/form-input-field';
import { FormSelectField } from '@/shared/components/ui/forms/form-select-field';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

// HOOKS
import { useForm } from '@/shared/hooks/useForm';
import { useZodSchemas } from '@/shared/hooks/useZodSchema';

// SERVER ACTIONS
import { updateNewUserDetails } from '@/features/players/actions/server_actions/updateNewUserDetails';

// LUCIDE ICONS
import { User, Globe, Phone, Users, PersonStanding } from 'lucide-react';

export default function NewUserDetailsPage() {
    const t = useTranslations('NewUserDetailsPage');
    const router = useRouter();

    const { newUserDetailsSchema } = useZodSchemas();

    const [isPending, startTransition] = useTransition();

    const initialValues = {
        name: '',
        country: '',
        phoneNumber: '',
        gender: 'Male',
        playerPosition: 'Midfielder'
    };

    const { formData, errors, handleInputChange, setFieldValue, handleSubmit } = useForm({
        initialValues,
        validationSchema: newUserDetailsSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await updateNewUserDetails(values);

                if (result.success) {
                    toast.success(result.message);
                    router.push(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
                } else {
                    toast.error(result.message);
                }
            });
        },
        useToastForErrors: true
    });

    const genderOptions = [
        { value: 'Male', label: t('male') },
        { value: 'Female', label: t('female') },
        { value: 'Other', label: t('other') }
    ];

    const positionOptions = [
        { value: 'Goalkeeper', label: t('goalkeeper') },
        { value: 'Defender', label: t('defender') },
        { value: 'Midfielder', label: t('midfielder') },
        { value: 'Forward', label: t('attacker') },
    ];

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="mt-24 w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
                </div>

                <div className="space-y-4">
                    <FormInputField
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        label={t('nameLabel')}
                        placeholder={t('namePlaceholder')}
                        error={errors.name}
                        icon={<User className="h-4 w-4" />}
                    />

                    <FormInputField
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleInputChange}
                        label={t('countryLabel')}
                        placeholder={t('countryPlaceholder')}
                        error={errors.country}
                        icon={<Globe className="h-4 w-4" />}
                    />

                    <FormInputField
                        name="phoneNumber"
                        type="text"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        label={t('phoneNumberLabel')}
                        placeholder={t('phoneNumberPlaceholder')}
                        error={errors.phoneNumber}
                        icon={<Phone className="h-4 w-4" />}
                    />

                    <FormSelectField
                        name="gender"
                        value={formData.gender}
                        onChange={(value) => setFieldValue('gender', value)}
                        options={genderOptions}
                        label={t('genderLabel')}
                        placeholder={t('genderPlaceholder')}
                        error={errors.gender}
                        icon={<Users className="h-4 w-4" />}
                    />

                    <FormSelectField
                        name="playerPosition"
                        value={formData.playerPosition}
                        onChange={(value) => setFieldValue('playerPosition', value)}
                        options={positionOptions}
                        label={t('playerPositionLabel')}
                        placeholder={t('playerPositionPlaceholder')}
                        error={errors.playerPosition}
                        icon={<PersonStanding className="h-4 w-4" />}
                    />

                    <Button 
                        className="w-full" 
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? t('submitting') : t('submit')}
                    </Button>
                </div>
            </div>

        </div>
    );
}
