"use client"

// LIBRARIES
import React, { useState } from 'react';

// COMPONENTS
import { Input } from "@/components/ui/input";
import { FormFieldBase } from "./form-field-base";
import { Button } from "@/components/ui/button";

// LUCIDE ICONS
import { Eye, EyeOff } from 'lucide-react';

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
    disabled?: boolean;
};

export const FormInputField = ({
    name,
    type,
    value,
    onChange,
    placeholder,
    error,
    autoComplete = "on",
    icon,
    disabled
}: FormInputFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
        <FormFieldBase name={name} error={error}>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <Input
                    type={inputType}
                    name={name}
                    id={name}
                    value={type === "number" && value === 0 ? "" : value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    className={`transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary focus:border-transparent ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${type === 'password' ? 'pr-10' : ''}`}
                />
                {type === 'password' && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                )}
            </div>
        </FormFieldBase>
    );
};