// NEXTJS IMPORTS
import { NextRequest, NextResponse } from 'next/server';

// LIBRARIES
import { Resend } from 'resend';
import { getTranslations } from 'next-intl/server';

// EMAIL TEMPLATES
import { PasswordResetEmailTemplate } from '@/email_templates/password-reset-email-template';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations('GenericMessages');
    const emailTemplateMessages = await getTranslations('EmailTemplateMessages');

    const { email } = await request.json();

    if (!email) {
        return NextResponse.json({ success: false, message: genericMessages('EMAIL_REQUIRED') }, { status: 400 });
    }

    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/forgot_password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
        if (backendResponse.status === 429) {
            return NextResponse.json({ success: false, message: genericMessages('PASSWORD_RESET_RATE_LIMITED') }, { status: 429 });
        }
        return NextResponse.json({ success: false, message: genericMessages('PASSWORD_RESET_REQUEST_FAILED') }, { status: backendResponse.status });
    }

    // If the response contains a token, send the password reset email
    if (responseData.token) {
        const resetUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset_password?token=${responseData.token}`;

        const emailResponse = await resend.emails.send({
            from: 'GameInfiny <noreply@gameinfiny.com>',
            to: [email],
            subject: emailTemplateMessages('EMAIL_PASSWORD_RESET_SUBJECT'),
            react: PasswordResetEmailTemplate({ resetUrl }),
        });

        // If there is an error sending the email, respond with a success message to avoid revealing whether the email exists
        if (emailResponse?.error) {
            return NextResponse.json({ success: true, message: genericMessages('PASSWORD_RESET_LINK_SENT') }, { status: 200 });
        }
    }

    return NextResponse.json({ success: true, message: genericMessages('PASSWORD_RESET_LINK_SENT') }, { status: 200 });
}