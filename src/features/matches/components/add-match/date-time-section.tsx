// COMPONENTS
import { FormDateField } from "@/shared/components/ui/forms/form-date-field";
import { FormTimeField } from "@/shared/components/ui/forms/form-time-field";

// TYPES
import type { typesAddMatchForm } from "../../types/AddMatchForm";

type DateTimeSectionProps = {
    formData: typesAddMatchForm;
    errors: Record<string, string>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    t: (key: string) => string;
}

export const DateTimeSection = ({
    formData,
    errors,
    handleInputChange,
    t
}: DateTimeSectionProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("dateAndTime")}</h3>
            <FormDateField
                label={t("date")}
                name="startsAtDay"
                value={formData.startsAtDay}
                onChange={(date) => handleInputChange({
                    target: { name: "startsAtDay", value: date as string }
                } as React.ChangeEvent<HTMLInputElement>)}
                error={errors.startsAtDay}
            />
            <FormTimeField
                label={t("time")}
                name="startsAtHour"
                value={formData.startsAtHour}
                onChange={handleInputChange}
                error={errors.startsAtHour}
                every15Min
            />
        </div>
    );
};