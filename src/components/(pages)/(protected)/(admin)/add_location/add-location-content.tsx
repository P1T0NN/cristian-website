"use client"

// LIBRARIES
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

// COMPONENTS
import { LocationTable } from "./location-table";
import { AddLocationDialog } from "./add-location-dialog";

// ACTIONS
import { client_fetchLocations } from "@/actions/functions/data/client/location/client_fetchLocations";

// TYPES
import type { typesLocation } from "@/types/typesLocation";

export const AddLocationContent = () => {
    const t = useTranslations("AddLocationPage");

    const { data: locations, isLoading, error } = useQuery<typesLocation[]>({
        queryKey: ['locations'],
        queryFn: client_fetchLocations,
    });

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t("locations")}</h1>
                <AddLocationDialog />
            </div>
            <LocationTable locations={locations || []} isLoading={isLoading} error={error} />
        </div>
    );
};
