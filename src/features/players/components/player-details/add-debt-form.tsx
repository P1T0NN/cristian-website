"use client";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { FormInputField } from "@/shared/components/ui/forms/form-input-field";
import { Button } from "@/shared/components/ui/button";

type AddDebtFormProps = {
    formData: {
        player_name: string;
        player_debt: number;
        cristian_debt: number;
        reason?: string;
    };
    errors: Record<string, string>;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    selectedOption: 'player' | 'cristian';
    setSelectedOption: (option: 'player' | 'cristian') => void;
    initialPlayerName?: string;
};

export const AddDebtForm = ({
    formData,
    errors,
    selectedOption,
    setSelectedOption,
    handleInputChange,
    initialPlayerName,
}: AddDebtFormProps) => {
    const t = useTranslations("PlayerPage");

    return (
        <div className="flex flex-col space-y-6">
            <FormInputField
                name="player_name"
                type="text"
                value={formData.player_name}
                onChange={handleInputChange}
                placeholder={t("playerNamePlaceholder")}
                error={errors.player_name}
                disabled={!!initialPlayerName}
            />

            <div className="space-y-2">
                <label htmlFor="selectDebtType">{t("selectDebtType")}</label>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedOption === "player" ? "secondary" : "outline"}
                        onClick={() => setSelectedOption("player")}
                        className="flex-1"
                    >
                        {t("playerOwes")}
                    </Button>
                    <Button
                        variant={selectedOption === "cristian" ? "secondary" : "outline"}
                        onClick={() => setSelectedOption("cristian")}
                        className="flex-1"
                    >
                        {t("iOwe")}
                    </Button>
                </div>
            </div>

            {selectedOption === "player" && (
                <FormInputField
                    name="player_debt"
                    type="number"
                    value={formData.player_debt}
                    onChange={handleInputChange}
                    placeholder={t("playerDebtPlaceholder")}
                    error={errors.player_debt}
                />
            )}

            {selectedOption === "cristian" && (
                <FormInputField
                    name="cristian_debt"
                    type="number"
                    value={formData.cristian_debt}
                    onChange={handleInputChange}
                    placeholder={t("cristianDebtPlaceholder")}
                    error={errors.cristian_debt}
                />
            )}

            <FormInputField
                name="reason"
                type="text"
                value={formData.reason as string}
                onChange={handleInputChange}
                placeholder={t("reasonPlaceholder")}
                error={errors.reason}
            />
        </div>
    );
};