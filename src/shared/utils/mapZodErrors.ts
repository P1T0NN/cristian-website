// LIBRARIES
import { z } from "zod";

// Type to represent the errors, where the key is a string (field name) and the value is the error message
type ValidationErrorMap = Record<string, string>;

export const mapZodErrors = (errors: z.ZodIssue[]): ValidationErrorMap => {
    return errors.reduce((acc, error) => {
        if (error.path.length > 0) {
            // Convert the path array to a string (e.g., ["user", "email"] => "user.email")
            const fieldName = error.path.join(".");
            acc[fieldName] = error.message;
        }
        return acc;
    }, {} as ValidationErrorMap);
};