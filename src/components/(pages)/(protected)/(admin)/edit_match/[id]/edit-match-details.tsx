// NEXTJS IMPORTS
import { cookies } from "next/headers";

// COMPONENTS
import { CardContent, CardFooter } from "@/components/ui/card";
import { EditMatchForm } from "./edit-match-form";
import { CancelEditButton } from "./cancel-edit-button";

// ACTIONS
import { serverFetchMatchForEdit } from "@/actions/functions/data/server/server_fetchMatchForEdit";
import { serverFetchDefaultLocations } from "@/actions/functions/data/server/server_fetchDefaultLocations";

// TYPES
import type { typesLocation } from "@/types/typesLocation";

type EditMatchDetailsProps = {
    matchId: string;
}

export const EditMatchDetails = async ({
    matchId,
}: EditMatchDetailsProps) => {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const serverMatchData = await serverFetchMatchForEdit(matchId);

    const serverDefaultLocationsData = await serverFetchDefaultLocations();
    const defaultLocationsData = serverDefaultLocationsData.data as typesLocation[];

    return (
        <>
            <CardContent className="p-4 sm:p-6">
                <EditMatchForm
                    authToken={authToken}
                    matchId={matchId}
                    matchData={serverMatchData}
                    defaultLocationsData={defaultLocationsData}
                />
            </CardContent>

            <CardFooter className="flex w-full p-4 sm:p-6">
                <CancelEditButton />
            </CardFooter>
        </>
    )
}