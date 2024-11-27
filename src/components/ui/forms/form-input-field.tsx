// COMPONENTS
import { Input } from "@/components/ui/input";
import { FormFieldBase } from "./form-field-base";

type FormInputFieldProps = {
    name: string;
    type: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    autoComplete?: string;
    icon?: React.ReactNode;
};

export const FormInputField = ({
    name,
    type,
    value,
    onChange,
    placeholder,
    error,
    autoComplete = "on",
    icon
}: FormInputFieldProps) => (
    <FormFieldBase name={name} error={error}>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
            )}
            <Input
                type={type}
                name={name}
                id={name}
                value={type === "number" && value === 0 ? "" : value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className={`transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary focus:border-transparent ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}
            />
        </div>
    </FormFieldBase>
);