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
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    label?: string;
    error?: string;
    icon?: React.ReactNode;
};

export const FormSelectField = ({
    name,
    value,
    onChange,
    options,
    placeholder,
    error,
    icon
}: FormSelectFieldProps) => (
    <FormFieldBase name={name} error={error}>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                    {icon}
                </div>
            )}
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={name} className={`transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary focus:border-transparent ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}>
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
        </div>
    </FormFieldBase>
);