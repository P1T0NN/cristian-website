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

// UTILS
import { getInitials } from "@/utils/getNameInitials";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Bell, Settings, LogOut } from "lucide-react";

type HeaderProps = {
    serverUserData: typesUser;
    authToken: string;
}

export const HeaderProtected = ({ 
    serverUserData, 
    authToken 
}: HeaderProps) => {
    const initials = getInitials(serverUserData.fullName);

    return (
        <header className="w-full bg-transparent border-b border-bg-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link href={PAGE_ENDPOINTS.HOME_PAGE}>
                            <h1 className="text-xl font-bold tracking-[2px]">Cris Futbol</h1>
                        </Link>
                    </div>

                    {serverUserData.isAdmin && (
                        <div className="hidden md:block flex-grow mx-4 max-w-xl">
                            <SearchBar authToken={authToken} />
                        </div>
                    )}

                    <div className="flex items-center space-x-3">
                        {serverUserData.isAdmin && (
                            <AddMatchButton />
                        )}

                        <Button
                            variant="secondary"
                            size="icon"
                        >
                            <Bell />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-secondary">
                                    {initials}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <Link href={PAGE_ENDPOINTS.SETTINGS_PAGE}>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2" /> Settings
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <LogOut className="mr-2" /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {serverUserData.isAdmin && (
                <div className="md:hidden px-4 py-3">
                    <SearchBar authToken={authToken} />
                </div>
            )}
        </header>
    );
};