// COMPONENTS
import { Switch } from "@/components/ui/switch";
import { FormFieldBase } from "./form-field-base";

type FormSwitchFieldProps = {
    label: string;
    name: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    error?: string;
};

export const FormSwitchField = ({
    label,
    name,
    checked,
    onCheckedChange,
    error
}: FormSwitchFieldProps) => (
    <FormFieldBase label={label} name={name} error={error}>
        <div className="flex items-center space-x-2">
            <Switch
                id={name}
                checked={checked}
                onCheckedChange={onCheckedChange}
                className="transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <label htmlFor={name} className="text-sm text-gray-700 cursor-pointer">
                {checked ? "Yes" : "No"}
            </label>
        </div>
    </FormFieldBase>
);