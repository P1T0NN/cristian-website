// NEXTJS IMPORTS
import Link from 'next/link';

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
import { AddDefaultPriceDialog } from './add-default-price-dialog';
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
        <div className="w-full">
            {/* Desktop view */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/4">{t("locationName")}</TableHead>
                            <TableHead className="w-1/4">{t("locationUrl")}</TableHead>
                            <TableHead className="w-1/4">{t("defaultPrice")}</TableHead>
                            <TableHead className="w-1/4">{t("actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {locationsData.map((location) => (
                            <TableRow key={location.id}>
                                <TableCell className="font-medium">{location.location_name}</TableCell>
                                <TableCell>
                                    <Link 
                                        href={location.location_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline break-all"
                                    >
                                        {location.location_url}
                                    </Link>
                                </TableCell>
                                <TableCell>{location.default_price || t("notSet")}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        <MarkAsDefaultLocationButton
                                            location={location}
                                            authToken={authToken}
                                        />
                                        <AddDefaultPriceDialog
                                            location={location}
                                            authToken={authToken}
                                        />
                                        <DeleteLocationDialog
                                            authToken={authToken}
                                            locationId={location.id} 
                                            locationName={location.location_name}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile view */}
            <div className="md:hidden space-y-6">
                {locationsData.map((location) => (
                    <div key={location.id} className="bg-white shadow rounded-lg p-4 space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg">{location.location_name}</h3>
                            <Link 
                                href={location.location_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline break-all text-sm"
                            >
                                {location.location_url}
                            </Link>
                        </div>
                        <div>
                            <span className="font-medium">{t("defaultPrice")}: </span>
                            <span>{location.default_price || t("notSet")}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <MarkAsDefaultLocationButton
                                location={location}
                                authToken={authToken}
                            />
                            <AddDefaultPriceDialog
                                location={location}
                                authToken={authToken}
                            />
                            <DeleteLocationDialog
                                authToken={authToken}
                                locationId={location.id} 
                                locationName={location.location_name}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};