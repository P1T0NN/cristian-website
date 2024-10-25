// REACTJS IMPORTS
import { useState } from "react";

// LIBRARIES
import { ZodSchema } from "zod";

// UTILS
import { mapZodErrors } from "@/utils/mapZodErrors";

type UseFormProps<T> = {
    initialValues: T;
    validationSchema: ZodSchema<T>;
    onSubmit: (values: T) => void; // Optional, used for submit actions
};

export const useForm = <T extends Record<string, unknown>>({
    initialValues,
    validationSchema,
    onSubmit,
}: UseFormProps<T>) => {
    const [formData, setFormData] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = event.target;
        
        // For number inputs, convert empty string to 0 or parse the number
        const finalValue = type === 'number' 
            ? value === '' ? 0 : parseFloat(value)
            : value;
            
        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const handleSubmit = () => {
        const result = validationSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = mapZodErrors(result.error.errors);
            setErrors(fieldErrors);
        } else {
            setErrors({});
            onSubmit(formData);
        }
    };

    return {
        formData,
        errors,
        handleInputChange,
        handleSubmit,
    };
};