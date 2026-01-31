export function normalizeListResponse<T>(res: any): T[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as T[];
    if (typeof res === 'object' && 'content' in res && Array.isArray((res as any).content)) {
        return (res as any).content as T[];
    }
    return [];
}

/**
 * Standard paginated response interface that works with both Spring Boot 2.x and 3.x
 */
export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

/**
 * Normalizes Spring Boot Page response to handle both 2.x and 3.x formats.
 * Spring Boot 3.x puts pagination info inside a 'page' object:
 *   { content: [], page: { size, number, totalElements, totalPages } }
 * Spring Boot 2.x puts pagination info at root level:
 *   { content: [], size, number, totalElements, totalPages }
 */
export function normalizePageResponse<T>(res: any, defaultSize = 20, defaultPage = 0): PagedResponse<T> {
    const content = res?.content || [];
    // Check for Spring Boot 3.x format first (page object), fallback to 2.x format (root level)
    const pageInfo = res?.page || res;
    return {
        content: content,
        totalElements: pageInfo?.totalElements ?? 0,
        totalPages: pageInfo?.totalPages ?? 0,
        size: pageInfo?.size ?? defaultSize,
        number: pageInfo?.number ?? defaultPage
    };
}
