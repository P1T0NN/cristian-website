"use client"

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Button } from "@/components/ui/button";
import { FormSelectField } from '@/components/ui/forms/form-select-field';
import { FormInputField } from '@/components/ui/forms/form-input-field';

// TYPES
import { typesRegisterForm } from "@/types/forms/RegisterForm";

// LUCIDE ICONS
import { Mail, Phone, LockKeyhole, User, PersonStanding, CreditCard, Globe } from "lucide-react";

type RegisterFormProps = {
    formData: typesRegisterForm;
    errors: Record<string, string>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: () => void;
    isPending: boolean;
};

export const RegisterForm = ({ 
    formData, 
    errors, 
    handleInputChange, 
    handleSubmit, 
    isPending 
}: RegisterFormProps) => {
    const t = useTranslations('RegisterPage');

    const genderOptions = [
        { value: 'Male', label: t('Male') },
        { value: 'Female', label: t('Female') },
        { value: 'Other', label: t('Other') },
    ];

    const positionOptions = [
        { value: 'Goalkeeper', label: t('goalkeeper') },
        { value: 'Defender', label: t('defender') },
        { value: 'Midfielder', label: t('midfielder') },
        { value: 'Forward', label: t('attacker') },
    ];

    const handleSelectChange = (name: string) => (value: string) => {
        handleInputChange({
            target: { name, value }
        } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full max-w-[350px]">
            <div className="flex flex-col w-full space-y-4">
                <div className="w-full">
                    <FormInputField
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t('emailPlaceholder')}
                        error={errors.email}
                        autoComplete="email"
                        icon={<Mail className="w-4 h-4" />}
                    />
                </div>

                <div className="w-full">
                    <FormInputField
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder={t('fullNamePlaceholder')}
                        error={errors.fullName}
                        autoComplete="name"
                        icon={<User className="w-4 h-4" />}
                    />
                </div>

                <div className="w-full">
                    <FormInputField
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder={t('phoneNumberPlaceholder')}
                        error={errors.phoneNumber}
                        autoComplete="tel"
                        icon={<Phone className="w-4 h-4" />}
                    />
                </div>

                <div className="w-full">
                    <FormInputField
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder={t('countryPlaceholder')}
                        error={errors.country}
                        autoComplete="country-name"
                        icon={<Globe className="w-4 h-4" />}
                    />
                </div>

                <div className="w-full">
                    <FormSelectField
                        name="gender"
                        value={formData.gender}
                        onChange={handleSelectChange('gender')}
                        options={genderOptions}
                        placeholder={t('genderPlaceholder')}
                        error={errors.gender}
                        icon={<PersonStanding className="w-4 h-4" />}
                    />
                </div>

                <div className="w-full">
                    <FormSelectField
                        name="player_position"
                        value={formData.player_position}
                        onChange={handleSelectChange('player_position')}
                        options={positionOptions}
                        placeholder={t('selectPlayerPosition')}
                        error={errors.player_position}
                        icon={<PersonStanding className="w-4 h-4" />}
                    />
                </div>

                <div className="w-full">
                    <FormInputField
                        name="dni"
                        type="text"
                        value={formData.dni}
                        onChange={handleInputChange}
                        placeholder={t('enterDNI')}
                        error={errors.dni}
                        autoComplete="off"
                        icon={<CreditCard className="w-4 h-4" />}
                    />
                </div>

                <div className="w-full">
                    <FormInputField
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={t('passwordPlaceholder')}
                        error={errors.password}
                        autoComplete="new-password"
                        icon={<LockKeyhole className="w-4 h-4" />}
                    />
                </div>

                <div className="w-[350px] h-[35px]">
                    <FormInputField
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder={t('confirmPasswordPlaceholder')}
                        error={errors.confirmPassword}
                        autoComplete="new-password"
                        icon={<LockKeyhole className="w-4 h-4" />}
                    />
                </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isPending}>
                {isPending ? t('signingUp') : t('signUp')}
            </Button>
        </form>
    );
};