// REACTJS IMPORTS
import { useMemo } from 'react';

// TYPES
import type { typesMatchType, typesMatchGender } from '../types/typesMatch';

export const useFormatMatchType = (type: typesMatchType, gender: typesMatchGender) => {
    return useMemo(() => {
        const formattedType = (() => {
            switch (type) {
                case "F8": return "8v8"
                case "F7": return "7v7"
                case "F11": return "11v11"
                default: return type
            }
        })();

        return `${formattedType} ${gender}`;
    }, [type, gender]);
};