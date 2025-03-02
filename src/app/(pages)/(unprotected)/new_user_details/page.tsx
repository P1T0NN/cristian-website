// NEXTJS IMPORTS
import { redirect } from 'next/navigation';

// CONFIG
import { PUBLIC_PAGE_ENDPOINTS } from '@/config';

// COMPONENTS
import { NewUserDetailsContent } from '@/features/auth/components/new_user_details/new-user-details-content';

// ACTIONS
import { checkUserAccess } from '@/features/auth/actions/verifyAuth';

export default async function NewUserDetailsPage() {
    const { country } = await checkUserAccess();

    if (country) {
        return redirect(PUBLIC_PAGE_ENDPOINTS.UNAUTHORIZED_PAGE);
    }

    return (
        <NewUserDetailsContent />
    );
}