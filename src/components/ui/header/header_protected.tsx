// NEXTJS IMPORTS
import Link from "next/link";
import { cookies } from "next/headers";

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

// ACTIONS
import { getUser } from "@/actions/auth/verifyAuth";

// UTILS
import { getInitials } from "@/utils/getNameInitials";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Settings, History, UserPlus, User, ClipboardList, Wallet } from 'lucide-react';

export const HeaderProtected = async () => {
    const t = await getTranslations('Header');

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const serverUserData = await getUser() as typesUser;
    
    const initials = serverUserData ? getInitials(serverUserData.fullName) : '';

    return (
        <header className="w-full bg-transparent border-b border-bg-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    <div className="flex items-center">
                        <Link href={PROTECTED_PAGE_ENDPOINTS.HOME_PAGE}>
                            <h1 className="text-lg sm:text-xl font-bold tracking-[2px]">{t('title')}</h1>
                        </Link>
                    </div>

                    {serverUserData?.isAdmin && authToken && (
                        <div className="hidden md:block flex-grow mx-4 max-w-xl">
                            <SearchBar authToken={authToken} />
                        </div>
                    )}

                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {serverUserData?.isAdmin && (
                            <div className="hidden sm:block">
                                <AddMatchButton />
                            </div>
                        )}

                        {/*<Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                        >
                            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>*/}

                        {serverUserData && (
                            <div className="flex items-center bg-secondary rounded-full px-2 py-1 sm:px-3 sm:py-1">
                                <Wallet className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm font-medium">{serverUserData.balance.toFixed(2)}</span>
                            </div>
                        )}

                        {serverUserData ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-secondary">
                                        {initials}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <Link href={`${PROTECTED_PAGE_ENDPOINTS.PLAYER_PAGE}/${serverUserData.id}`}>
                                        <DropdownMenuItem>
                                            <User className="mr-2 h-4 w-4" /> {t('profile')}
                                        </DropdownMenuItem>
                                    </Link>
                                    {serverUserData.isAdmin && (
                                        <>
                                            <Link href={ADMIN_PAGE_ENDPOINTS.MATCH_HISTORY}>
                                                <DropdownMenuItem>
                                                    <History className="mr-2 h-4 w-4" /> {t('matchHistory')}
                                                </DropdownMenuItem>
                                            </Link>
                                            <Link href={ADMIN_PAGE_ENDPOINTS.ADD_TEAM_PAGE}>
                                                <DropdownMenuItem>
                                                    <UserPlus className="mr-2 h-4 w-4" /> {t('createTeam')}
                                                </DropdownMenuItem>
                                            </Link>
                                            <Link href={ADMIN_PAGE_ENDPOINTS.ACCESS_FOR_REGISTRATIONS}>
                                                <DropdownMenuItem>
                                                    <ClipboardList className="mr-2 h-4 w-4" /> {t('registrations')}
                                                </DropdownMenuItem>
                                            </Link>
                                        </>
                                    )}
                                    <Link href={PROTECTED_PAGE_ENDPOINTS.SETTINGS_PAGE}>
                                        <DropdownMenuItem>
                                            <Settings className="mr-2 h-4 w-4" /> {t('settings')}
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuSeparator />
                                    <LogoutButton />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-secondary animate-pulse" />
                        )}
                    </div>
                </div>
            </div>

            {serverUserData?.isAdmin && authToken && (
                <div className="md:hidden px-4 py-2">
                    <SearchBar authToken={authToken} />
                </div>
            )}

            <div className="sm:hidden px-4 py-2">
                {serverUserData?.isAdmin ? (
                    <AddMatchButton />
                ) : (
                    <Button
                        variant="default"
                        size="default"
                        className="w-full"
                        asChild
                    >
                        <Link href={PROTECTED_PAGE_ENDPOINTS.HOME_PAGE}>
                            {t('home')}
                        </Link>
                    </Button>
                )}
            </div>
        </header>
    )
};