// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DeleteLocationDialog } from './delete-location-dialog';

// ACTIONS
import { serverFetchLocations } from '@/actions/functions/data/server/server_fetchLocations';

// TYPES
import type { typesLocation } from "@/types/typesLocation";
import { MarkAsDefaultLocationButton } from './mark-as-default-location-button';

type LocationTableProps = {
    authToken: string;
}

export const LocationTable = async ({
    authToken
}: LocationTableProps) => {
    const t = await getTranslations("AddLocationPage");

    const serverLocationsData = await serverFetchLocations();
    const locationsData = serverLocationsData.data as typesLocation[];

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-1/3">{t("locationName")}</TableHead>
                    <TableHead className="w-1/2">{t("locationUrl")}</TableHead>
                    <TableHead className="w-1/6">{t("actions")}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {locationsData.map((location) => (
                    <TableRow key={location.id}>
                        <TableCell className="font-medium">{location.location_name}</TableCell>
                        <TableCell>
                            <a 
                                href={location.location_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-500 hover:underline break-all"
                            >
                                {location.location_url}
                            </a>
                        </TableCell>
                        <TableCell>
                            <MarkAsDefaultLocationButton
                                location={location}
                                authToken={authToken}
                            />
                        </TableCell>
                        <TableCell>
                            <DeleteLocationDialog
                                authToken={authToken}
                                locationId={location.id} 
                                locationName={location.location_name}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};