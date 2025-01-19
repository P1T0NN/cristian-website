// COMPONENTS
import { Textarea } from "@/shared/components/ui/textarea";
import { FormFieldBase } from "./form-field-base";

type FormTextareaFieldProps = {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    error?: string;
};

export const FormTextareaField = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    error,
}: FormTextareaFieldProps) => (
    <FormFieldBase label={label} name={name} error={error}>
        <Textarea
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary focus:border-transparent"
        />
    </FormFieldBase>
);