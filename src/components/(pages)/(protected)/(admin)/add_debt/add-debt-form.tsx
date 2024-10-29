"use client";

// REACTJS IMPORTS
import { useRef, useState, useEffect } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchDropdown } from "@/components/ui/search-dropdown/search-dropdown";

// ACTIONS
import { client_fetchUsers } from "@/actions/functions/data/client/debt/client_fetchUsers";

// TYPES
import type { typesAddDebtForm } from "@/types/forms/AddDebtForm";

type AddDebtFormProps = {
    authToken: string;
    formData: typesAddDebtForm;
    errors: Record<string, string>;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    selectedOption: 'player' | 'cristian';
    setSelectedOption: React.Dispatch<React.SetStateAction<'player' | 'cristian'>>;
    initialPlayerName: string;
};

type User = {
    fullName: string;
    // Add other properties of User if needed
}

export const AddDebtForm = ({
    authToken,
    formData,
    errors,
    selectedOption,
    setSelectedOption,
    handleInputChange,
    initialPlayerName,
}: AddDebtFormProps) => {
    const t = useTranslations("AddDebtPage");
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (initialPlayerName) {
            setShowDropdown(false);
        }
    }, [initialPlayerName]);

    const handleUserSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        handleInputChange(event);
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (value.length > 0) {
            searchTimeoutRef.current = setTimeout(() => {
                setShowDropdown(true);
            }, 500);
        } else {
            setShowDropdown(false);
        }
    };

    const handleUserSelect = (user: User) => {
        const event = {
            target: {
                name: 'player_name',
                value: user.fullName
            }
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleInputChange(event);
        setShowDropdown(false);
    };

    return (
        <div className="flex flex-col space-y-4">
           <div className="relative w-[350px] space-y-1">
                <Label htmlFor="player_name">{t("playerName")}</Label>
                <Input
                    type="text"
                    name="player_name"
                    value={formData.player_name}
                    onChange={handleUserSearch}
                    placeholder={t("playerNamePlaceholder")}
                    autoComplete="off"
                    disabled={!!initialPlayerName}
                />
                {errors.player_name && (
                    <p className="text-red-500 text-sm">{errors.player_name}</p>
                )}

                {!initialPlayerName && (
                    <SearchDropdown<User>
                        authToken={authToken}
                        searchTerm={formData.player_name}
                        isDropdownOpen={showDropdown}
                        setIsDropdownOpen={setShowDropdown}
                        onSelect={handleUserSelect}
                        fetchData={client_fetchUsers}
                        getDisplayValue={(user) => user.fullName}
                        queryKey="users"
                    />
                )}
            </div>

            {/* Rest of the component remains unchanged */}
            <div className="flex flex-col space-y-2">
                <Label htmlFor="selectDebtType">{t("selectDebtType")}</Label>
                <div className="flex space-x-4">
                    <Button
                        variant={selectedOption === "player" ? "secondary" : "outline"}
                        onClick={() => setSelectedOption("player")}
                    >
                        {t("playerOwes")}
                    </Button>
                    <Button
                        variant={selectedOption === "cristian" ? "secondary" : "outline"}
                        onClick={() => setSelectedOption("cristian")}
                    >
                        {t("iOwe")}
                    </Button>
                </div>
            </div>

            {selectedOption === "player" && (
                <div className="relative w-[350px] space-y-1">
                    <Label htmlFor="player_debt">{t("debt")}</Label>
                    <Input
                        type="number"
                        name="player_debt"
                        value={formData.player_debt === 0 ? '' : formData.player_debt.toString()}
                        onChange={handleInputChange}
                        placeholder={t("playerDebtPlaceholder")}
                    />
                    {errors.player_debt && <p className="text-red-500 text-sm">{errors.player_debt}</p>}
                </div>
            )}

            {selectedOption === "cristian" && (
                <div className="relative w-[350px] space-y-1">
                    <Label htmlFor="cristian_debt">{t("debt")}</Label>
                    <Input
                        type="number"
                        name="cristian_debt"
                        value={formData.cristian_debt === 0 ? '' : formData.cristian_debt.toString()}
                        onChange={handleInputChange}
                        placeholder={t("cristianDebtPlaceholder")}
                    />
                    {errors.cristian_debt && <p className="text-red-500 text-sm">{errors.cristian_debt}</p>}
                </div>
            )}

            <div className="relative w-[350px] space-y-1">
                <Label htmlFor="reason">{t("reason")}</Label>
                <Input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder={t("reasonPlaceholder")}
                />
                {errors.reason && <p className="text-red-500 text-sm">{errors.reason}</p>}
            </div>
        </div>
    );
};