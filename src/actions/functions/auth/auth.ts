// UTILS
import { logError, logInfo } from '@/utils/logging/logger';

// TYPES
import type { typesRegisterForm } from '@/types/forms/RegisterForm';
import type { typesLoginForm } from '@/types/forms/LoginForm';

type AuthResult = {
    success: boolean;
    message: string;
    data?: unknown;
    token?: string;
    refresh_token?: string;
    csrf_token?: string;
};

export async function registerUser(userData: typesRegisterForm): Promise<AuthResult> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 400) {
            logError('registerUser', 'INVALID_REGISTER', { status: response.status });
            return { success: false, message: data.message };
        } else {
            logError('registerUser', 'UNKNOWN_ERROR', { status: response.status });
            return { success: false, message: data.message };
        }
    }

    logInfo('User registered successfully', { userData: data });
    return { success: true, message: data.message, data };
}

export async function loginUser(credentials: typesLoginForm): Promise<AuthResult> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, message: data.message };
    }

    logInfo('Login successful');
    return { success: true, message: data.message, token: data.token, refresh_token: data.refresh_token, csrf_token: data.csrf_token };
}

export async function logoutUser(): Promise<AuthResult> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, message: data.message };
    }

    return { success: true, message: data.message };
}

///////////////////////////////////////// RESEND EMAIL VERIFICATIN TOKEN /////////////////////////////////////////

export async function resendVerificationEmail(email: string, userId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/email_apis/auth/resend_register_verification_link_email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email,
            userId
        })}
    );

    const data = await response.json();

    return {
        success: response.ok,
        status: response.status,
        message: data.message
    };
}

///////////////////////////////////////// RESET PASSWORD FUNCTIONS ///////////////////////////////////////////////

export async function requestPasswordReset(email: string): Promise<AuthResult> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/email_apis/auth/send_reset_password_link_email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 429) {
            logError('requestPasswordReset', 'PASSWORD_RESET_RATE_LIMITED', { status: response.status, error: data.error });
            return { success: false, message: data.message };
        }
        logError('requestPasswordReset', 'PASSWORD_RESET_REQUEST_FAILED', { status: response.status, error: data.error });
        return { success: false, message: data.message };
    }

    return { success: true, message: data.message };
}

export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/reset_password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
        logError('resetPassword', 'PASSWORD_RESET_FAILED', { status: response.status, error: data.error });
        return { success: false, message: data.message };
    }

    return { success: true, message: data.message };
}

export async function isResetTokenValid(token: string): Promise<AuthResult> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/validate_reset_password_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
        logError('validateResetToken', 'INVALID_RESET_PASSWORD_TOKEN', { status: response.status, error: data.error });
        return { success: false, message: data.message };
    }

    return { success: true, message: data.message };
}