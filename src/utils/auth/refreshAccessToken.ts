export async function refreshAccessToken(refreshToken: string): Promise<{ authToken: string } | null> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/refresh_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });
  
    if (response.ok) {
        const { authToken } = await response.json();
        return { authToken };
    } else {
        return null;
    }
}