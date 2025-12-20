export interface User {
 id: number;
 createdAt: string; // ISO string
 updatedAt: string;
 email: string;
 password: string;
 hashedRt?: string | null;
 firstname?: string | null;
 lastname?: string | null;
 warehouseId?: number | null;
 role: Role;
}
