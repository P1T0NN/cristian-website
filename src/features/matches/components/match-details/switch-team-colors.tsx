// COMPONENTS
import { SwapColorsButton } from "./swap-colors-button";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";

type SwitchTeamColorsProps = {
    matchIdFromParams: string;
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