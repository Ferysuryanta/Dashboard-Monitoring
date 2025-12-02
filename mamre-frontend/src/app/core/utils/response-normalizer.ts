export function normalizeListResponse<T>(res: any): T[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as T[];
    if (typeof res === 'object' && 'content' in res && Array.isArray((res as any).content)) {
        return (res as any).content as T[];
    }
    return [];
}