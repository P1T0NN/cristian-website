// REACTJS IMPORTS
import React from "react";

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Input } from "@/components/ui/input";

// LUCIDE ICONS
import { Mail, LockKeyhole } from "lucide-react";

type LoginFormProps = {
    formData: LoginForm;
    errors: Record<string, string>;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginForm = ({
    formData,
    errors,
    handleInputChange,
}: LoginFormProps) => {
    const t = useTranslations('LoginPage');

    return (
        <div className="flex flex-col space-y-7">
            <div className="relative w-[350px] h-[35px] space-y-1">
                <div className="flex flex-col">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        name="email"
                        type="email"
                        className="pl-12 w-full"
                        placeholder={t('emailPlaceholder')}
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                </div>

                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="relative w-[350px] h-[35px] space-y-1">
                <div className="flex flex-col">
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        name="password"
                        type="password"
                        className="pl-12 w-full"
                        placeholder={t('passwordPlaceholder')}
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                </div>

                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
        </div>
    );
}