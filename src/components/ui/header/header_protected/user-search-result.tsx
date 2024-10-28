"use client"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// TYPES
import { typesUser } from "@/types/typesUser";

type UserSearchResultProps = {
    user: typesUser;
    onClick: () => void;
};

export const UserSearchResult= ({ 
    user,
    onClick
}: UserSearchResultProps) => {
    const router = useRouter();

    const handleRedirectToProfile = () => {
        router.push(`${PAGE_ENDPOINTS.PLAYER_PAGE}/${user.id}`);
        onClick();
    };

    return (
        <div 
            className="flex bg-secondary text-primary items-center p-2 space-x-3 hover:rounded-md hover:bg-primary hover:text-secondary cursor-pointer"
            onClick={handleRedirectToProfile}
        >
            <Avatar>
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.fullName}`} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <p>{user.fullName}</p>
        </div>
    );
};