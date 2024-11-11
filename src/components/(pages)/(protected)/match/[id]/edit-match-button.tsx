"use client"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// COMPONENTS
import { Button } from "@/components/ui/button";

// LUCIDE ICONS
import { Edit } from "lucide-react";
import { PAGE_ENDPOINTS } from "@/config";

type EditMatchButtonProps = {
    matchId: string;
}

export const EditMatchButton = ({
    matchId
}: EditMatchButtonProps) => {
    const router = useRouter();

    const handleEditMatch = () => {
        router.push(`${PAGE_ENDPOINTS.EDIT_MATCH_PAGE}/${matchId}`)
    };

    return (
        <Button onClick={handleEditMatch} variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Edit Match
        </Button>
    )
}