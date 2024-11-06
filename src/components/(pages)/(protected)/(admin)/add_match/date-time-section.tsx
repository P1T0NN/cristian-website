// COMPONENTS
import { FormDateField } from "@/components/ui/forms/form-date-field";
import { FormTimeField } from "@/components/ui/forms/form-time-field";

// TYPES
import type { typesAddMatchForm } from "@/types/forms/AddMatchForm";

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
                name="starts_at_day"
                value={formData.starts_at_day}
                onChange={(date) => handleInputChange({
                    target: { name: "starts_at_day", value: date as string }
                } as React.ChangeEvent<HTMLInputElement>)}
                error={errors.starts_at_day}
            />
            <FormTimeField
                label={t("time")}
                name="starts_at_hour"
                value={formData.starts_at_hour}
                onChange={handleInputChange}
                error={errors.starts_at_hour}
            />
        </div>
    );
};