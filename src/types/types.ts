export interface CsvItem {
  COLOR: string;
  SIZE: string;
  QTY: number;
  ITEM_DESCRIPTION?: string;
  ITEM_CODE?: string;
  PRICE?: number;
  EP_NO?: string;
  RUN?: string;
  SHEET?: string;
}

export interface OptimizationResult {
  COLOR: string;
  SIZE: string;
  QTY: number;
  PLATE: string;
  OPTIMAL_UPS: number;
  SHEETS_NEEDED: number;
  QTY_PRODUCED: number;
  EXCESS: number;
  ITEM_DESCRIPTION?: string;
  ITEM_CODE?: string;
  PRICE?: number;
  EP_NO?: string;
  RUN?: string;
  SHEET?: string;
}

export interface OptimizationSummary {
  totalSheets: number;
  totalProduced: number;
  totalExcess: number;
  wastePercentage: number;
  totalPlates: number;
  totalItems: number;
  upsCapacity: number;
}

export interface OptimizationResponse {
  results: OptimizationResult[];
  summary: OptimizationSummary;
}

export interface OrderInfo {
  factory?: string;
  po?: string;
  job?: string;
  brand?: string;
  item?: string;
}

export interface EfficiencyValue {
  efficiency: number;
}