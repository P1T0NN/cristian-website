// LIBRARIES
import { z } from "zod";

// LIBRARIES
import { useTranslations } from 'next-intl';

export const useZodSchemas = () => {
    const t = useTranslations('ZodErrors');

    const loginSchema = z.object({
        email: z.string().email({ message: t('INVALID_EMAIL') }),
        password: z.string().min(6, { message: t('PASSWORD_TOO_SHORT') }),
    });

    const registerSchema = z.object({
        email: z.string().email(t('INVALID_EMAIL')),
        fullName: z.string().min(1, t('FULL_NAME_REQUIRED')).max(50, t('FULL_NAME_TOO_LONG')),
        phoneNumber: z.string().min(1, t('PHONE_NUMBER_REQUIRED')).max(20, t('PHONE_NUMBER_TOO_LONG')),
        gender: z.enum(['Male', 'Female', 'Other'], {
            errorMap: () => ({ message: t('PICK_CORRECT_GENDER') })
        }),
        password: z.string().min(6, t('PASSWORD_TOO_SHORT')),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: t("PASSWORDS_DO_NOT_MATCH"),
        path: ["confirmPassword"],
    });

    const resetPasswordSchema = z.object({
        password: z.string().min(6, t("PASSWORD_TOO_SHORT")),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: t("PASSWORDS_DO_NOT_MATCH"),
        path: ["confirmPassword"],
    });

    const forgotPasswordSchema = z.object({
        email: z.string().email(t('INVALID_EMAIL')),
    });

    const addMatchSchema = z.object({
        location: z.string().min(1, { message: t('LOCATION_REQUIRED') }),
        price: z.number().min(0, { message: t('PRICE_REQUIRED') }),
        team1_name: z.string().min(1, { message: t('TEAM1_NAME_REQUIRED') }).max(255, { message: t('TEAM_NAME_TOO_LONG') }),
        team2_name: z.string().min(1, { message: t('TEAM2_NAME_REQUIRED') }).max(255, { message: t('TEAM_NAME_TOO_LONG') }),
        starts_at_day: z.string().min(1, { message: t('START_DAY_REQUIRED') }),
        starts_at_hour: z.string().min(1, { message: t('START_HOUR_REQUIRED') }),
        match_type: z.string().min(1, { message: t('MATCH_TYPE_REQUIRED') }).max(100, { message: t('MATCH_TYPE_TOO_LONG') }),
        match_gender: z.enum(['Male', 'Female', 'Mixed', 'Other'], {
            errorMap: () => ({ message: t('MATCH_GENDER_REQUIRED') })
        }),
        added_by: z.string()
    });

    const addDebtSchema = z.object({
        player_name: z.string().min(1, { message: t('PLAYER_NAME_REQUIRED') }),
        player_debt: z.number().min(0, { message: t('PLAYER_DEBT_REQUIRED') }),
        cristian_debt: z.number().min(0, { message: t('CRISTIAN_DEBT_REQUIRED') }),
        reason: z.string().optional(),
        added_by: z.string()
    });    

    const addLocationSchema = z.object({
        location_name: z.string().min(1, { message: t('LOCATION_NAME_REQUIRED') })
    });

    return {
        loginSchema,
        registerSchema,
        resetPasswordSchema,
        forgotPasswordSchema,
        addMatchSchema,
        addDebtSchema,
        addLocationSchema
    };
};