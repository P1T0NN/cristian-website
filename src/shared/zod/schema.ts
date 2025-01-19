// LIBRARIES
import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    fullName: z.string().min(1, 'Full name is required').max(50, 'Full name cannot be more than 100 characters'),
    phoneNumber: z.string().min(1 , 'Phone number is required').max(20, 'Phone number cannot be more than 20 characters'),
    gender: z.enum(['Male', 'Female', 'Other'], {
        errorMap: () => ({ message: 'Gender must be Male, Female, or Other' })
    }),
    player_position: z.enum(['Goalkeeper', 'Defender', 'Midfielder', 'Forward'], {
        errorMap: () => ({ message: "You must choose correct position" })
    }),
    dni: z.string().min(6, "DNI is too short").max(20, "DNI is too long"),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"],
});