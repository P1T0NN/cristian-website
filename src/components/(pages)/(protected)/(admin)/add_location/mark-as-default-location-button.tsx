"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { markAsDefaultLocation } from "@/actions/server_actions/mutations/location/markAsDefaultLocation";

// TYPES
import type { typesLocation } from "@/types/typesLocation";

type MarkAsDefaultLocationButtonProps = {
    location: typesLocation;
    authToken: string;
}

export const MarkAsDefaultLocationButton = ({
    location,
    authToken
}: MarkAsDefaultLocationButtonProps) => {
    const t = useTranslations("AddLocationPage");

    const [isPending, startTransition] = useTransition();

    const handleToggleDefault = () => {
        startTransition(async () => {
            const result = await markAsDefaultLocation(authToken, location.id, !location.is_default);

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Button
            onClick={handleToggleDefault}
            variant={location.is_default ? "default" : "outline"}
            disabled={isPending}
        >
            {isPending
                ? t("updating")
                : location.is_default
                ? t("removeAsDefault")
                : t("markAsDefault")
            }
        </Button>
    );
}