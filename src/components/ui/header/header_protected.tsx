// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS, ADMIN_PAGE_ENDPOINTS } from "@/config";

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
import { Bell, Settings, History, UserPlus } from 'lucide-react';

type HeaderProps = {
    serverUserData: typesUser | undefined;
    authToken: string | undefined;
}

export const HeaderProtected = async ({ 
    serverUserData, 
    authToken 
}: HeaderProps) => {
    const t = await getTranslations('Header');
    const initials = serverUserData ? getInitials(serverUserData.fullName) : '';

    return (
        <header className="w-full bg-transparent border-b border-bg-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link href={PROTECTED_PAGE_ENDPOINTS.HOME_PAGE}>
                            <h1 className="text-xl font-bold tracking-[2px]">{t('title')}</h1>
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
                                    <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {serverUserData.isAdmin && (
                                        <Link href={ADMIN_PAGE_ENDPOINTS.MATCH_HISTORY}>
                                            <DropdownMenuItem>
                                                <History className="mr-2" /> {t('matchHistory')}
                                            </DropdownMenuItem>
                                        </Link>
                                    )}
                                    {serverUserData.isAdmin && (
                                        <Link href={ADMIN_PAGE_ENDPOINTS.ADD_TEAM_PAGE}>
                                            <DropdownMenuItem>
                                                <UserPlus className="mr-2" /> {t('createTeam')}
                                            </DropdownMenuItem>
                                        </Link>
                                    )}
                                    <Link href={PROTECTED_PAGE_ENDPOINTS.SETTINGS_PAGE}>
                                        <DropdownMenuItem>
                                            <Settings className="mr-2" /> {t('settings')}
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

