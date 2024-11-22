"use server"

// NEXTJS IMPORTS
import { getTranslations } from 'next-intl/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// SERVER ACTIONS
import { sendVerificationEmail } from '@/actions/server_actions/auth/sendVerificationEmail';

// UTILS
import { hashPassword } from '@/utils/argon2';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

type RegisterUserProps = {
    email: string;
    password: string;
    confirmPassword: string;
    [key: string]: string | number | boolean;
}

export async function registerUser(userData: RegisterUserProps): Promise<APIResponse> {
    const t = await getTranslations('GenericMessages');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, confirmPassword: _, ...otherFields } = userData;

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
        return { success: false, message: t('REGISTRATION_ERROR') };
    }

    if (existingUser) {
        return { success: false, message: t('USER_ALREADY_EXISTS') };
    }

    // If no existing user, proceed with registration
    const hashedPassword = await hashPassword(password);

    const userDataToInsert = {
        email,
        password: hashedPassword,
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
        //console.error('Failed to send verification email:', emailResult.message);
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