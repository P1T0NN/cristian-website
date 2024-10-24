// REACTJS IMPORTS
import React from "react";

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Input } from "@/components/ui/input";

// LUCIDE ICONS
import { LockKeyhole } from "lucide-react";

type ResetPasswordFormProps = {
    formData: ResetPasswordForm;
    errors: Record<string, string>;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ResetPasswordForm = ({
    formData,
    errors,
    handleInputChange,
}: ResetPasswordFormProps) => {
    const t = useTranslations('ResetPasswordPage');

    return (
        <div className="flex flex-col space-y-7">
            <div className="relative w-[350px] h-[35px] space-y-1">
                <div className="flex flex-col">
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        name="password"
                        type="password"
                        className="pl-12 w-full"
                        placeholder={t('newPasswordPlaceholder')}
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="relative w-[350px] h-[35px] space-y-1">
                <div className="flex flex-col">
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        name="confirmPassword"
                        type="password"
                        className="pl-12 w-full"
                        placeholder={t('confirmNewPasswordPlaceholder')}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                    />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>
        </div>
    )
}