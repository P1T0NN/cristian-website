// COMPONENTS
import { SwapColorsButton } from "./swap-colors-button";

// ACTIONS
import { getUser } from "@/actions/auth/verifyAuth";

// TYPES
import type { typesUser } from "@/types/typesUser";

type SwitchTeamColorsProps = {
    matchIdFromParams: string
}

export const SwitchTeamColors = async ({ 
    matchIdFromParams,
}: SwitchTeamColorsProps) => {
    const currentUserData = await getUser() as typesUser;

    return (
        <div className="flex items-center justify-center">
            {currentUserData.isAdmin && (
                // Client component
                <SwapColorsButton
                    matchIdFromParams={matchIdFromParams}
                />
            )}
        </div>
    )
}