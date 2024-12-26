// COMPONENTS
import { CardContent, CardFooter } from "@/components/ui/card";
import { EditMatchForm } from "./edit-match-form";
import { CancelEditButton } from "./cancel-edit-button";

// ACTIONS
import { fetchMatchForEdit } from "@/actions/match/fetchMatchForEdit";
import { fetchLocations } from "@/actions/location/fetchLocations";
import { fetchDefaultLocations } from "@/actions/location/fetchDefaultLocations";

// TYPES
import type { typesLocation } from "@/types/typesLocation";
import type { typesMatch } from "@/types/typesMatch";

type EditMatchDetailsProps = {
    matchIdFromParams: string;
}

export const EditMatchDetails = async ({
    matchIdFromParams
}: EditMatchDetailsProps) => {
    const serverMatchData = await fetchMatchForEdit(matchIdFromParams);
    const matchData = serverMatchData.data as typesMatch;

    const serverLocationsData = await fetchLocations();
    const locationsData = serverLocationsData.data as typesLocation[];

    const serverDefaultLocationsData = await fetchDefaultLocations();
    const defaultLocationsData = serverDefaultLocationsData.data as typesLocation[];

    return (
        <>
            <CardContent className="p-4 sm:p-6">
                <EditMatchForm
                    matchIdFromParams={matchIdFromParams}
                    matchData={matchData}
                    locationsData={locationsData}
                    defaultLocationsData={defaultLocationsData}
                />
            </CardContent>

            <CardFooter className="flex w-full p-4 sm:p-6">
                <CancelEditButton />
            </CardFooter>
        </>
    )
}