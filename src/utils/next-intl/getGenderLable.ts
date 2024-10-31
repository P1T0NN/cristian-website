export const getGenderLabel = (locale: string, gender: string) => {
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