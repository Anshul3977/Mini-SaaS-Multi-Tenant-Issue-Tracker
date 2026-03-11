/**
 * Wraps a value in an object with `data` key — handy for
 * uniform API response shapes.
 */
export function apiResponse<T>(data: T, meta?: Record<string, unknown>) {
    return { data, ...(meta ? { meta } : {}) };
}

/**
 * Create an error with an HTTP status code attached.
 */
export function httpError(message: string, statusCode: number): Error & { statusCode: number } {
    return Object.assign(new Error(message), { statusCode });
}
