// SERVICES
import { getUserLocale } from "@/services/server/locale";

export const getPositionLabel = async (position: string) => {
    const locale = await getUserLocale();

    if (locale === "es") {
        switch (position) {
            case "Goalkeeper":
                return "Portero";
            case "Defender":
                return "Defensa";
            case "Middle":
                return "Centrocampista";
            case "Forward":
                return "Delantero";
            default:
                return position;
        }
    }
    return position;
};