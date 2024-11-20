"use server"

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, confirmPassword: _, ...otherFields } = userData;

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
        console.error('Error checking for existing user:', existingUserError);
        return { success: false, message: 'Error during registration process' };
    }

    if (existingUser) {
        return { success: false, message: 'A user with this email already exists' };
    }

    // If no existing user, proceed with registration
    try {
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
            console.error('Error creating user:', error);
            return { success: false, message: 'Error creating user' };
        }

        if (!user) {
            return { success: false, message: 'User creation failed' };
        }

        const emailResult = await sendVerificationEmail(user.email);
        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.message);
            // Optionally, you might want to delete the created user here
            // since the email verification failed
        }

        return {
            success: true,
            message: emailResult.success 
                ? 'User registered successfully. Please check your email to verify your account.'
                : 'User registered successfully, but there was an issue sending the verification email. Please contact support.',
            data: { user }
        };
    } catch (error) {
        console.error('Unexpected error during user registration:', error);
        return { success: false, message: 'Unexpected error during user registration' };
    }
}