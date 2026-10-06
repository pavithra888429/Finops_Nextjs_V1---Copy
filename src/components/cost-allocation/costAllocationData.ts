export interface ProductAllocationRecord {
  id: string;
  name: string;
  gemini: number;
  openrouter: number;
  aws: number;
  total: number;
  share: number;
  change: number;
  dailyAvg: number;
  topProvider: string;
  topService: string;
  iconBg: string;
  dailyTimeline?: any[];
}

// 100% Dynamic - Populated via AgentBuilder production workflow and MongoDB
export const BASE_PRODUCTS: ProductAllocationRecord[] = [];

export interface TrendDataPoint {
  date: string;
  label: string;
  year?: string;
  vals?: Record<string, number>;
  dayTotal?: number;
}

export const BASE_TREND_DATA: TrendDataPoint[] = [];

export interface ProviderDistributionItem {
  id: string;
  product: string;
  gemini: number;
  openrouter: number;
  aws: number;
}

export const BASE_DISTRIBUTION: ProviderDistributionItem[] = [];
