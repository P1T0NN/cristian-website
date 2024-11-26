"use client"

// REACTJS IMPORTS
import { useState } from "react";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { AdminActionsDialog } from "./admin-actions-dialog";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { User } from "lucide-react";

type ShowAdminModalButtonProps = {
    authToken: string;
    matchId: string;
    player: typesUser;
}

export const ShowAdminModalButton = ({
    authToken,
    matchId,
    player
}: ShowAdminModalButtonProps) => {
    const [showAdminModal, setShowAdminModal] = useState(false);

    const handleShowAdminModal = () => {
        setShowAdminModal(true);
    }

    return (
        <>
            <Button
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={handleShowAdminModal}
            >
                <User size={14} className="sm:h-4 sm:w-4" />
            </Button>

            {showAdminModal && (
                <AdminActionsDialog
                    isOpen={showAdminModal}
                    onClose={() => setShowAdminModal(false)}
                    player={player}
                    matchId={matchId}
                    authToken={authToken}
                />
            )}
        </>
    )
}