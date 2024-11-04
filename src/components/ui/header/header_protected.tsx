// NEXTJS IMPORTS
import Link from "next/link";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { AddMatchButton } from "@/components/ui/header/header_protected/add-match-button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchBar } from "./header_protected/search-bar";
import { LogoutButton } from "./header_protected/logout-button";

// UTILS
import { getInitials } from "@/utils/getNameInitials";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Users, Bell, Settings } from "lucide-react";

type HeaderProps = {
    serverUserData: typesUser | undefined;
    authToken: string | undefined;
}

export const HeaderProtected = ({ 
    serverUserData, 
    authToken 
}: HeaderProps) => {
    const initials = serverUserData ? getInitials(serverUserData.fullName) : '';

    return (
        <header className="w-full bg-transparent border-b border-bg-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link href={PAGE_ENDPOINTS.HOME_PAGE}>
                            <h1 className="text-xl font-bold tracking-[2px]">Cris Futbol</h1>
                        </Link>
                    </div>

                    {serverUserData?.isAdmin && authToken && (
                        <div className="hidden md:block flex-grow mx-4 max-w-xl">
                            <SearchBar authToken={authToken} />
                        </div>
                    )}

                    <div className="flex items-center space-x-3">
                        {serverUserData?.isAdmin && (
                            <AddMatchButton />
                        )}

                        <Button
                            variant="secondary"
                            size="icon"
                        >
                            <Bell />
                        </Button>

                        {serverUserData ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-secondary">
                                        {initials}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {serverUserData.isAdmin && (
                                        <Link href={PAGE_ENDPOINTS.ADD_TEAM_PAGE}>
                                            <DropdownMenuItem>
                                                <Users className="mr-2" /> Create Team
                                            </DropdownMenuItem>
                                        </Link>
                                    )}
                                    <Link href={PAGE_ENDPOINTS.SETTINGS_PAGE}>
                                        <DropdownMenuItem>
                                            <Settings className="mr-2" /> Settings
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuSeparator />
                                    <LogoutButton />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="h-[40px] w-[40px] rounded-full bg-secondary animate-pulse" />
                        )}
                    </div>
                </div>
            </div>

            {serverUserData?.isAdmin && authToken && (
                <div className="md:hidden px-4 py-3">
                    <SearchBar authToken={authToken} />
                </div>
            )}
        </header>
    )
};