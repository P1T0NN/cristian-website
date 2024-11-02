// COMPONENTS
import { Input } from "@/components/ui/input";
import { FormFieldBase } from "./form-field-base";

type FormInputFieldProps = {
    label: string;
    name: string;
    type: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    autoComplete?: string;
};

export const FormInputField = ({
    label,
    name,
    type,
    value,
    onChange,
    placeholder,
    error,
    autoComplete = "on"
}: FormInputFieldProps) => (
    <FormFieldBase label={label} name={name} error={error}>
        <Input
            type={type}
            name={name}
            id={name}
            value={type === "number" && value === 0 ? "" : value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary focus:border-transparent"
        />
    </FormFieldBase>
);