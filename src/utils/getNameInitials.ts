export const getInitials = (fullName: string): string => {
    // Split the name into words and filter out empty strings
    const words = fullName.split(' ').filter(word => word.length > 0);
    
    if (words.length === 1) {
        // If only one word, return first letter
        return words[0].charAt(0).toUpperCase();
    } else {
        // Take first letter of first word and first letter of last word
        // This handles cases of 2 or more words
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
};