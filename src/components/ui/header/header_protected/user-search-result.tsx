"use client"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// CONFIG
import { PAGE_ENDPOINTS } from "@/app/config";

// COMPONENTS
import { Avatar, AvatarImage } from "@/components/ui/avatar";

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
        router.push(`${PAGE_ENDPOINTS.PROFILE_PAGE}/${user.profile_url}`);
        onClick();
    };

    return (
        <div 
            className="flex items-center p-2 space-x-3 hover:rounded-md hover:bg-gray-700 cursor-pointer text-white"
            onClick={handleRedirectToProfile}
        >
            <Avatar>
                <AvatarImage src={user.avatar_url} />
            </Avatar>
            <p>{user.username}</p>
        </div>
    );
};