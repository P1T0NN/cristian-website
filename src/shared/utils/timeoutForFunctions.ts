/**
 * A promise-based setTimeout function that works in both Node.js and browser environments.
 * 
 * @param ms The number of milliseconds to wait
 * @returns A promise that resolves after the specified time
 */
const setTimeoutPromise = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Executes an operation and ensures it takes at least the specified minimum time to complete.
 * This helps protect against timing attacks by making all operations appear to take the same amount of time.
 * 
 * @param operation The operation to execute
 * @param minDuration The minimum duration in milliseconds
 * @returns A promise that resolves with the result of the operation
 */
export async function executeWithMinimumDuration<T>(
    operation: () => Promise<T>,
    minDuration: number = 1000
): Promise<T> {
    const start = Date.now();
    const result = await operation();
    const elapsed = Date.now() - start;
    const remainingTime = Math.max(0, minDuration - elapsed);
    
    if (remainingTime > 0) {
        await setTimeoutPromise(remainingTime);
    }
    
    return result;
}