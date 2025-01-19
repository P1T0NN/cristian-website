// SERVICES
import { getUserLocale } from "@/shared/services/server/locale";

export const getGenderLabel = async (gender: string) => {
    const locale = await getUserLocale();

    if (locale === "es") {
        switch (gender) {
            case "Male":
                return "Masculino";
            case "Female":
                return "Femenino";
            case "Mixed":
                return "Mixto";
            default:
                return gender;
        }
    }
    return gender;
};