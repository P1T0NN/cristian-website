// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

// UTILS
import { getTranslations } from 'next-intl/server';
import { checkUserExists, insertUser, getUserByEmail, insertVerificationToken } from '@/utils/supabase/supabaseUtils';

// ZOD
import { registerSchema } from '@/zod/schema';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function POST(request: Request): Promise<NextResponse<APIResponse>> {
    const t = await getTranslations('GenericMessages');

    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json({ success: false, message: t('INVALID_REGISTER') }, { status: 400 });
    }

    const { email, fullName, phoneNumber, gender, password } = result.data;

    // Check if user already exists
    const { existingUser, error: existingUserError } = await checkUserExists(email);

    if (existingUserError) {
        return NextResponse.json({ success: false, message: t('ERROR_CHECKING_USER_EXISTENCE') }, { status: 500 });
    }

    if (existingUser) {
        return NextResponse.json({ success: false, message: t('USER_ALREADY_EXISTS') }, { status: 400 });
    }

    // Use Promise.all to do hashing and generating verification token at the same time (Faster)
    const [hashedPassword, verificationToken] = await Promise.all([
        argon2.hash(password),
        uuidv4(),
    ]);

    // Generate expiration date (e.g., 1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save the user in the database
    const userInsertError = await insertUser({
        email,
        fullName,
        phoneNumber,
        gender,
        password: hashedPassword,
    });

    if (userInsertError) {
        return NextResponse.json({ success: false, message: t('FAILED_REGISTRATION') }, { status: 500 });
    }

    // Get the inserted user's ID to link to the verification token
    const { user: newUser, error: newUserError } = await getUserByEmail(email);

    if (newUserError) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_GET_ID') }, { status: 500 });
    }

    // Check if newUser is null
    if (!newUser) {
        return NextResponse.json({ success: false, message: t('ERROR_FINDING_USER') }, { status: 404 });
    }

    // Save the verification token in the user_verifications table
    const verificationInsertError = await insertVerificationToken({
        user_id: newUser.id,
        verification_token: verificationToken,
        expires_at: expiresAt.toISOString(),
    });

    if (verificationInsertError) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_CREATE_VERIFICATION_TOKEN') }, { status: 500 });
    }

    // Send verification email via API call
    const emailApiResponse = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/email_apis/auth/register_verification_link_email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            fullName,
            verificationToken,
        }),
    });

    const emailResponse = await emailApiResponse.json();

    if (!emailResponse.success) {
        return NextResponse.json({ success: false, message: emailResponse.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('USER_CREATED') }, { status: 200 });
}