"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// SERVER ACTIONS
import { deleteLocation } from "@/actions/server_actions/mutations/location/deleteLocation";

type DeleteLocationButtonProps = {
    authToken: string;
    locationId: number;
}

export const DeleteLocationButton = ({
    authToken,
    locationId
}: DeleteLocationButtonProps) => {
    const t = useTranslations("AddLocationPage");

    const [isPending, startTransition] = useTransition();

    const handleDeleteLocation = () => {
        startTransition(async () => {
            const response = await deleteLocation(authToken, locationId);

            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        });
    };

    return (
        <AlertDialogAction 
            onClick={handleDeleteLocation} 
            disabled={isPending}
        >
            {isPending ? t("deleting") : t("delete")}
        </AlertDialogAction>
    )
}