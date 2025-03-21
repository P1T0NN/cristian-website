// LIBRARIES
import { z } from "zod";

// LIBRARIES
import { useTranslations } from 'next-intl';

export const useZodSchemas = () => {
    const t = useTranslations('ZodErrors');

    const newUserDetailsSchema = z.object({
        name: z.string().min(1, t('FULL_NAME_REQUIRED')).max(50, t('FULL_NAME_TOO_LONG')),
        country: z.string().min(1, t('COUNTRY_REQUIRED')).max(56, t('COUNTRY_TOO_LONG')),
        phoneNumber: z.string().min(1, t('PHONE_NUMBER_REQUIRED')).max(20, t('PHONE_NUMBER_TOO_LONG')),
        gender: z.enum(['Male', 'Female', 'Other'], {
            errorMap: () => ({ message: t('PICK_CORRECT_GENDER') })
        }),
        playerPosition: z.enum(['Goalkeeper', 'Defender', 'Midfielder', 'Forward'], {
            errorMap: () => ({ message: t('PICK_CORRECT_POSITION') })
        })
    });

    const addMatchSchema = z.object({
        location: z.string().min(1, { message: t('LOCATION_REQUIRED') }),
        locationUrl: z.string().min(1, { message: t('LOCATION_URL_REQUIRED') }),
        price: z.string({ required_error: t('PRICE_REQUIRED') })
            .min(1, { message: t('PRICE_REQUIRED') })

            .refine(
                (val) => /^\d+(\.\d{1,2})?$/.test(val),
                { message: t('PRICE_MUST_BE_POSITIVE') }
            ),
        team1Name: z.string().min(1, { message: t('TEAM1_NAME_REQUIRED') }).max(255, { message: t('TEAM_NAME_TOO_LONG') }),
        team2Name: z.string().min(1, { message: t('TEAM2_NAME_REQUIRED') }).max(255, { message: t('TEAM_NAME_TOO_LONG') }),
        startsAtDay: z.string().min(1, { message: t('START_DAY_REQUIRED') }),
        startsAtHour: z.string().min(1, { message: t('START_HOUR_REQUIRED') }),
        matchType: z.string().min(1, { message: t('MATCH_TYPE_REQUIRED') }).max(100, { message: t('MATCH_TYPE_TOO_LONG') }),
        matchGender: z.enum(['Male', 'Female', 'Mixed', 'Other'], {
            errorMap: () => ({ message: t('MATCH_GENDER_REQUIRED') })
        }),
        matchDuration: z.number().min(1, { message: t('MATCH_DURATION_REQUIRED') }),
        addedBy: z.string(),
        matchLevel: z.string().min(1, { message: t('MATCH_LEVEL_REQUIRED') }).max(4, { message: t('MATCH_LEVEL_TOO_LONG') }),
        hasTeams: z.boolean(),
        status: z.enum(['active', 'pending', 'finished'], {
            errorMap: () => ({ message: t('MATCH_STATUS_REQUIRED')})
        })
    });

    const addDebtSchema = z.object({
        player_name: z.string().min(1, { message: t('PLAYER_NAME_REQUIRED') }),
        player_debt: z.number().min(0, { message: t('PLAYER_DEBT_REQUIRED') }),
        cristian_debt: z.number().min(0, { message: t('CRISTIAN_DEBT_REQUIRED') }),
        reason: z.string().optional(),
        added_by: z.string()
    }).refine((data) => {
        // At least one of the debt values should be greater than 0
        return data.player_debt > 0 || data.cristian_debt > 0;
    }, {
        message: t('AT_LEAST_ONE_DEBT_REQUIRED'),
        path: ['player_debt'] // This will show the error on the player_debt field
    });

    const addLocationSchema = z.object({
        location_name: z.string().min(1, { message: t('LOCATION_NAME_REQUIRED') }),
        location_url: z.string().min(1, { message: t('LOCATION_URL_REQUIRED') })
    });

    const addTeamSchema = z.object({
        team_name: z.string().min(1, "Team name is required"),
        team_level: z.string().min(1, "Team level is required"),
    });

    return {
        newUserDetailsSchema,
        addMatchSchema,
        addDebtSchema,
        addLocationSchema,
        addTeamSchema
    };
};