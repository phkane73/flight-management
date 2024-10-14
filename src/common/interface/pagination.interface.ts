export interface Pagination<T> {
    data: T[];
    total: number,
    totalPages:number,
    currentPage: number,
}
