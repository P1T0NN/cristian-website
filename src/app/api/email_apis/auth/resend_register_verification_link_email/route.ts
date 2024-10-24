// LIBRARIES
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { checkLoginRateLimit } from '@/actions/server_actions/login/login-rate-limit';

// UTILS
import { insertVerificationToken, deleteOldVerificationToken } from '@/utils/supabase/supabaseUtils';
import { generateRandomCharacters } from '@/utils/generateRandomCharacters';

// EMAIL TEMPLATES
import { VerificationEmailTemplate } from '@/email_templates/verification-email-template';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesVerificationToken } from '@/types/typesVerificationToken';

const resend = new Resend(process.env.RESEND_API_KEY);

type ResendVerificationEmailProps = {
    email: string;
    userId: string;
};

export async function POST(request: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations('GenericMessages');
    const emailTemplateMessages = await getTranslations('EmailTemplateMessages');

    const body = await request.json();
    const { email, userId }: ResendVerificationEmailProps = body;

    if (!email || !userId) {
        return NextResponse.json({ success: false, message: genericMessages('EMAIL_AND_USERID_REQUIRED') }, { status: 400 });
    }

    const { isOnCooldown, remainingTime } = await checkLoginRateLimit(email);
    if (isOnCooldown) {
        return NextResponse.json({
            success: false,
            message: genericMessages('VERIFICATION_EMAIL_COOLDOWN', { time: Math.ceil(remainingTime as number / 1000) }),
        }, { status: 429 });
    }

    await deleteOldVerificationToken(userId);

    const newToken = generateRandomCharacters();
    const expiresAt = new Date();
    expiresAt.setUTCHours(expiresAt.getUTCHours() + 1);

    const verificationData: typesVerificationToken = {
        user_id: userId,
        verification_token: newToken,
        expires_at: expiresAt.toISOString(),
    };

    const insertError = await insertVerificationToken(verificationData);
    if (insertError) {
        return NextResponse.json({ success: false, message: genericMessages('FAILED_TO_CREATE_VERIFICATION_TOKEN') }, { status: 500 });
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/verify_email?token=${newToken}`;

    const { error } = await resend.emails.send({
        from: 'Cris Futbol <noreply@gameinfiny.com>',
        to: [email],
        subject: emailTemplateMessages('EMAIL_VERIFICATION_SUBJECT'),
        react: VerificationEmailTemplate({ verificationUrl }),
    });

    if (error) {
        return NextResponse.json({ success: false, message: genericMessages('REGISTER_VERIFICATION_EMAIL_FAILED') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: genericMessages('REGISTER_VERIFICATION_TOKEN_EMAIL_SENT') }, { status: 200 });
}