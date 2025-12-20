export interface Tariff {
 id: number;
 name: string;
 warehouseId?: number | null;
 valid_from: string;
 valid_to?: string | null;
 type: TariffType;
 rules: TariffRule[];
}

export enum TariffType {
 SIMPLE = 'SIMPLE',
 RANGE = 'RANGE',
 HYBRID = 'HYBRID',
}