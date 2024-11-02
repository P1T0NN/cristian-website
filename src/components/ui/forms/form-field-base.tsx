// COMPONENTS
import { Label } from "@/components/ui/label";

type FormFieldBaseProps = {
    label: string;
    name: string;
    error?: string;
    children: React.ReactNode;
};

export const FormFieldBase = ({ label, name, error, children }: FormFieldBaseProps) => (
    <div className="relative flex flex-col space-y-2">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</Label>
        {children}
        {error && <p className="text-sm text-red-500 mt-1 animate-fadeIn">{error}</p>}
    </div>
);