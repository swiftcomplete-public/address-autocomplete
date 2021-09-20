export function setAPIKey(key: string): void;
export function autocomplete(text: string, options: {
    biasTowards?: string;
    countries?: string;
    container?: string;
    distanceUnits?: ("metric" | "imperial" | "m" | "km" | "ft" | "mi");
    maxDistance?: number;
    maxResults?: number;
}): Promise<any>;
export function populateResult(index: number, results: any): Promise<any>;
