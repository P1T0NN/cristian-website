// LIBRARIES
import crypto from "crypto";

export function generateRandomCharacters(): string {
    return crypto.randomBytes(32).toString('hex');
}