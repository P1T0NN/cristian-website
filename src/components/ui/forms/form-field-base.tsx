// COMPONENTS
import { Label } from "@/components/ui/label";

type FormFieldBaseProps = {
    label: string;
    name: string;
    error?: string;
    children: React.ReactNode;
};

export const FormFieldBase = ({ label, name, error, children }: FormFieldBaseProps) => (
    <div className="relative flex flex-col space-y-1">
        <Label htmlFor={name}>{label}</Label>
        {children}
        {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
);