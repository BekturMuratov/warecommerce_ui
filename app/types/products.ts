export interface Product {
 id: number;
 name: string;
 tnved_code: string;
 weight: number; // Decimal -> number
 quantity: number; // Decimal -> number
 price: number; // Decimal -> number
 currency: string;
 dvh_number: string;
 product_owner: string;
 released: boolean;
 operator_who_registered: string;
 operator_who_released?: string | null;
 deleted: boolean;
 declaration_number?: string | null;
 transit_declaration_number?: string | null;
 arrival_date: string; // ISO string
 departure_date?: string | null;
 count_of_days_in_storage?: number | null;
 price_for_storage?: number | null;
 warehouseId?: number | null;
 warehouse: Warehouse;
}

export interface Warehouse {
    id: number;
    name: string;
    address: string;
    guid: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
 data: T[];
 pagination: {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
 };
}

// Специально для твоего DVH списка
export type DvhListItem = Pick<
 Product,
 'dvh_number' | 'product_owner' | 'operator_who_registered' | 'arrival_date'
>;

export type DvhListResponse = PaginatedResponse<DvhListItem>;