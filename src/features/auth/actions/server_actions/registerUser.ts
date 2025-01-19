"use server"

// NEXTJS IMPORTS
import { getTranslations } from 'next-intl/server';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';

// SERVER ACTIONS
import { sendVerificationEmail } from './sendVerificationEmail';

// UTILS
import { hashPassword } from '../../utils/argon2';

// TYPES
import type { APIResponse } from '@/shared/types/responses/APIResponse';

type RegisterUserProps = {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    [key: string]: string | number | boolean;
}

export async function registerUser(userData: RegisterUserProps): Promise<APIResponse> {
    const t = await getTranslations('GenericMessages');

    if (!userData) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, confirmPassword: _, fullName, ...otherFields } = userData;

    // Check if user with the same email already exists
    const { data: existingUserEmail, error: existingUserEmailError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUserEmailError && existingUserEmailError.code !== 'PGRST116') {
        return { success: false, message: t('REGISTRATION_ERROR') };
    }

    if (existingUserEmail) {
        return { success: false, message: t('USER_ALREADY_EXISTS') };
    }

    // Check if user with the same fullName already exists
    const { data: existingUserFullName, error: existingUserFullNameError } = await supabase
        .from('users')
        .select('id')
        .eq('fullName', fullName)
        .single();

    if (existingUserFullNameError && existingUserFullNameError.code !== 'PGRST116') {
        return { success: false, message: t('REGISTRATION_ERROR') };
    }

    if (existingUserFullName) {
        return { success: false, message: t('FULLNAME_ALREADY_EXISTS') };
    }

    // If no existing user, proceed with registration
    const hashedPassword = await hashPassword(password);

    const userDataToInsert = {
        email,
        password: hashedPassword,
        fullName,
        ...otherFields
    };

    const { data: user, error } = await supabase
        .from('users')
        .insert(userDataToInsert)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('USER_CREATION_ERROR') };
    }

    if (!user) {
        return { success: false, message: t('USER_CREATION_FAILED') };
    }

    const emailResult = await sendVerificationEmail(user.email);
    if (!emailResult.success) {
        // Optionally, you might want to delete the created user here
        // since the email verification failed
    }

    return {
        success: true,
        message: emailResult.success 
            ? t('REGISTRATION_SUCCESS_WITH_EMAIL')
            : t('REGISTRATION_SUCCESS_WITHOUT_EMAIL'),
        data: { user }
    };
}