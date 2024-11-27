// REACTJS IMPORTS
import { useState } from "react";

// LIBRARIES
import { ZodSchema } from "zod";
import { toast } from "sonner";

// UTILS
import { mapZodErrors } from "@/utils/mapZodErrors";

type UseFormProps<T> = {
    initialValues: T;
    validationSchema: ZodSchema<T>;
    onSubmit: (values: T) => void;
    useToastForErrors?: boolean;
};

export const useForm = <T extends Record<string, unknown>>({
    initialValues,
    validationSchema,
    onSubmit,
    useToastForErrors = false,
}: UseFormProps<T>) => {
    const [formData, setFormData] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = event.target;
        
        const finalValue = type === 'number' 
            ? value === '' ? 0 : parseFloat(value)
            : value;
            
        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const setFieldValue = (name: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = (): boolean => {
        const result = validationSchema.safeParse(formData);
    
        if (!result.success) {
            const fieldErrors = mapZodErrors(result.error.errors);
            setErrors(fieldErrors);
            
            if (useToastForErrors) {
                Object.values(fieldErrors).forEach(error => {
                    toast.error(error);
                });
            }
            return false;
        } else {
            setErrors({});
            return true;
        }
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return {
        formData,
        errors,
        handleInputChange,
        setFieldValue,
        handleSubmit,
        validateForm,
    };
};