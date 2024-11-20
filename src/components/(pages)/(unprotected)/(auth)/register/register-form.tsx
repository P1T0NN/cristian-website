// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// TYPES
import { typesRegisterForm } from "@/types/forms/RegisterForm";

// LUCIDE ICONS
import { Mail, Phone, LockKeyhole, User, PersonStanding } from "lucide-react";

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

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
            <div className="relative w-[350px] h-[35px] space-y-1">
                <div className="flex flex-col">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="email"
                        name="email"
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
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        name="fullName"
                        className="pl-12 w-full"
                        placeholder={t('fullNamePlaceholder')}
                        value={formData.fullName}
                        onChange={handleInputChange}
                    />
                </div>
                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            </div>

            <div className="relative w-[350px] h-[35px] space-y-1">
                <div className="flex flex-col">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        name="phoneNumber"
                        className="pl-12 w-full"
                        placeholder={t('phoneNumberPlaceholder')}
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                    />
                </div>
                {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
            </div>

            <div className="relative w-[350px] h-[35px] space-y-1">
                <div className="flex flex-col">
                    <PersonStanding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Select
                        onValueChange={(value) => handleInputChange({
                            target: {
                                name: 'gender',
                                value
                            }
                        } as React.ChangeEvent<HTMLInputElement>)}
                    >
                        <SelectTrigger className='pl-12'>
                            <SelectValue placeholder={t('genderPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">{t('Male')}</SelectItem>
                            <SelectItem value="Female">{t('Female')}</SelectItem>
                            <SelectItem value="Other">{t('Other')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
            </div>

            <div className="relative w-[350px] h-[35px] space-y-1">
                <div className="flex flex-col">
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="password"
                        name="password"
                        className="pl-12 w-full"
                        placeholder={t('passwordPlaceholder')}
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
                        type="password"
                        name="confirmPassword"
                        className="pl-12 w-full"
                        placeholder={t('confirmPasswordPlaceholder')}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                    />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? t('signingUp') : t('signUp')}
            </Button>
        </form>
    );
};