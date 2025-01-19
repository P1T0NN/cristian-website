// COMPONENTS
import { CardContent, CardFooter } from "@/shared/components/ui/card";
import { EditMatchForm } from "./edit-match-form";
import { CancelEditButton } from "./cancel-edit-button";

// ACTIONS
import { fetchMatchForEdit } from "../../actions/fetchMatchForEdit";
import { fetchLocations } from "@/features/locations/actions/fetchLocations";
import { fetchDefaultLocations } from "@/features/locations/actions/fetchDefaultLocations";

// TYPES
import type { typesLocation } from "@/features/locations/types/typesLocation";
import type { typesMatch } from "../../types/typesMatch";

type EditMatchDetailsProps = {
    matchIdFromParams: string;
}

export const EditMatchDetails = async ({
    matchIdFromParams
}: EditMatchDetailsProps) => {
    const [serverMatchData, serverLocationsData, serverDefaultLocationsData] = await Promise.all([
        fetchMatchForEdit(matchIdFromParams),
        fetchLocations(),
        fetchDefaultLocations()
    ]);
    
    const matchData = serverMatchData.data as typesMatch;
    const locationsData = serverLocationsData.data as typesLocation[];
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