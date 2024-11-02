// COMPONENTS
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { FormFieldBase } from "./form-field-base";

type Option = {
    value: string;
    label: string;
};

type FormSelectFieldProps = {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    error?: string;
};

export const FormSelectField = ({
    label,
    name,
    value,
    onChange,
    options,
    placeholder,
    error
}: FormSelectFieldProps) => (
    <FormFieldBase label={label} name={name} error={error}>
        <Select value={value} onValueChange={(newValue) => onChange(newValue)}>
            <SelectTrigger id={name} className="transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary focus:border-transparent">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </FormFieldBase>
);