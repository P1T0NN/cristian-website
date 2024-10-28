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

// UTILS
import { getInitials } from "@/utils/getNameInitials";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Bell, Settings, LogOut } from "lucide-react";

type HeaderProps = {
    serverUserData: typesUser;
}

export const HeaderProtected = async ({
    serverUserData
}: HeaderProps) => {
    //const authToken = cookies().get('auth_token')?.value;
    const initials = getInitials(serverUserData.fullName);

    return (
        <nav className="flex w-full py-2 px-10 items-center justify-between bg-transparent border-b border-bg-primary space-x-3">
            {/*When user resizes window display it this way*/}
            <div className="xl:hidden flex w-full items-center space-x-5">
                <Link href={PAGE_ENDPOINTS.HOME_PAGE}>
                    <h1 className="text-xl font-bold tracking-[2px]">Cris Futbol</h1>
                </Link>

                {/*<SearchBar authToken={authToken} />*/}
            </div>

            {/*When window is the largest display it this way*/}
            <Link href={PAGE_ENDPOINTS.HOME_PAGE}>
                <h1 className="hidden text-xl font-bold tracking-[2px] xl:block">Cris Futbol</h1>
            </Link>

            {/*<div className="hidden xl:block">
                <SearchBar authToken={authToken} />
            </div>*/}

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
                                    <Settings /> Settings
                            </DropdownMenuItem>
                        </Link>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem><LogOut /> Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    )
}