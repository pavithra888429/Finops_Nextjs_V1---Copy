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
}

export const BASE_PRODUCTS: ProductAllocationRecord[] = [
  {
    id: 'dragon',
    name: 'Dragon Suite',
    gemini: 4200.00,
    openrouter: 6800.00,
    aws: 11000.20,
    total: 22000.20,
    share: 45.6,
    change: 14.2,
    dailyAvg: 733.34,
    topProvider: 'AWS',
    topService: 'AmazonEKS',
    iconBg: 'bg-[#6b21a8]',
  },
  {
    id: 'okrian',
    name: 'Okrian',
    gemini: 2100.00,
    openrouter: 2900.40,
    aws: 9500.00,
    total: 14500.40,
    share: 30.1,
    change: 9.8,
    dailyAvg: 483.35,
    topProvider: 'AWS',
    topService: 'AmazonEC2',
    iconBg: 'bg-[#047857]',
  },
  {
    id: 'workbench',
    name: 'Workbench',
    gemini: 2200.20,
    openrouter: 1500.00,
    aws: 8049.40,
    total: 11749.60,
    share: 24.3,
    change: 13.5,
    dailyAvg: 391.65,
    topProvider: 'AWS',
    topService: 'AmazonRDS',
    iconBg: 'bg-[#1d4ed8]',
  },
  {
    id: 'unallocated',
    name: 'Unallocated',
    gemini: 0.00,
    openrouter: 0.00,
    aws: 1240.00,
    total: 1240.00,
    share: 2.6,
    change: 4.1,
    dailyAvg: 41.33,
    topProvider: 'AWS',
    topService: 'Untagged resources',
    iconBg: 'bg-[#78350f]/80',
  },
];

export interface TrendDataPoint {
  date: string;
  label: string;
  dragon: { gemini: number; openrouter: number; aws: number; total: number };
  okrian: { gemini: number; openrouter: number; aws: number; total: number };
  workbench: { gemini: number; openrouter: number; aws: number; total: number };
  unallocated: { gemini: number; openrouter: number; aws: number; total: number };
}

// 15 days historical series with provider breakdown
export const BASE_TREND_DATA: TrendDataPoint[] = [
  {
    date: '2024-08-13',
    label: 'Aug 13',
    dragon: { gemini: 209, openrouter: 341, aws: 550, total: 1100 },
    okrian: { gemini: 95, openrouter: 136, aws: 449, total: 680 },
    workbench: { gemini: 93, openrouter: 64, aws: 333, total: 490 },
    unallocated: { gemini: 0, openrouter: 0, aws: 70, total: 70 },
  },
  {
    date: '2024-08-15',
    label: 'Aug 15',
    dragon: { gemini: 224, openrouter: 366, aws: 590, total: 1180 },
    okrian: { gemini: 118, openrouter: 168, aws: 554, total: 840 },
    workbench: { gemini: 106, openrouter: 73, aws: 381, total: 560 },
    unallocated: { gemini: 0, openrouter: 0, aws: 75, total: 75 },
  },
  {
    date: '2024-08-17',
    label: 'Aug 17',
    dragon: { gemini: 205, openrouter: 335, aws: 540, total: 1080 },
    okrian: { gemini: 101, openrouter: 144, aws: 475, total: 720 },
    workbench: { gemini: 91, openrouter: 62, aws: 327, total: 480 },
    unallocated: { gemini: 0, openrouter: 0, aws: 65, total: 65 },
  },
  {
    date: '2024-08-19',
    label: 'Aug 19',
    dragon: { gemini: 238, openrouter: 388, aws: 624, total: 1250 },
    okrian: { gemini: 123, openrouter: 176, aws: 581, total: 880 },
    workbench: { gemini: 112, openrouter: 77, aws: 401, total: 590 },
    unallocated: { gemini: 0, openrouter: 0, aws: 85, total: 85 },
  },
  {
    date: '2024-08-21',
    label: 'Aug 21',
    dragon: { gemini: 232, openrouter: 378, aws: 610, total: 1220 },
    okrian: { gemini: 113, openrouter: 162, aws: 535, total: 810 },
    workbench: { gemini: 101, openrouter: 69, aws: 360, total: 530 },
    unallocated: { gemini: 0, openrouter: 0, aws: 75, total: 75 },
  },
  {
    date: '2024-08-23',
    label: 'Aug 23',
    dragon: { gemini: 257, openrouter: 419, aws: 674, total: 1350 },
    okrian: { gemini: 127, openrouter: 182, aws: 601, total: 910 },
    workbench: { gemini: 120, openrouter: 82, aws: 428, total: 630 },
    unallocated: { gemini: 0, openrouter: 0, aws: 90, total: 90 },
  },
  {
    date: '2024-08-25',
    label: 'Aug 25',
    dragon: { gemini: 237.10, openrouter: 386.00, aws: 622.10, total: 1245.20 },
    okrian: { gemini: 114.86, openrouter: 164.08, aws: 541.46, total: 820.40 },
    workbench: { gemini: 106.80, openrouter: 73.07, aws: 382.23, total: 562.10 },
    unallocated: { gemini: 0.00, openrouter: 0.00, aws: 80.00, total: 80.00 },
  },
  {
    date: '2024-08-27',
    label: 'Aug 27',
    dragon: { gemini: 220, openrouter: 360, aws: 580, total: 1160 },
    okrian: { gemini: 108, openrouter: 154, aws: 508, total: 770 },
    workbench: { gemini: 97, openrouter: 66, aws: 347, total: 510 },
    unallocated: { gemini: 0, openrouter: 0, aws: 70, total: 70 },
  },
  {
    date: '2024-08-29',
    label: 'Aug 29',
    dragon: { gemini: 236, openrouter: 384, aws: 620, total: 1240 },
    okrian: { gemini: 120, openrouter: 172, aws: 568, total: 860 },
    workbench: { gemini: 110, openrouter: 75, aws: 395, total: 580 },
    unallocated: { gemini: 0, openrouter: 0, aws: 85, total: 85 },
  },
  {
    date: '2024-08-31',
    label: 'Aug 31',
    dragon: { gemini: 262, openrouter: 428, aws: 690, total: 1380 },
    okrian: { gemini: 127, openrouter: 182, aws: 601, total: 910 },
    workbench: { gemini: 118, openrouter: 81, aws: 421, total: 620 },
    unallocated: { gemini: 0, openrouter: 0, aws: 90, total: 90 },
  },
  {
    date: '2024-09-02',
    label: 'Sep 02',
    dragon: { gemini: 247, openrouter: 403, aws: 650, total: 1300 },
    okrian: { gemini: 122, openrouter: 174, aws: 574, total: 870 },
    workbench: { gemini: 108, openrouter: 74, aws: 388, total: 570 },
    unallocated: { gemini: 0, openrouter: 0, aws: 80, total: 80 },
  },
  {
    date: '2024-09-04',
    label: 'Sep 04',
    dragon: { gemini: 258, openrouter: 422, aws: 680, total: 1360 },
    okrian: { gemini: 130, openrouter: 186, aws: 614, total: 930 },
    workbench: { gemini: 120, openrouter: 82, aws: 428, total: 630 },
    unallocated: { gemini: 0, openrouter: 0, aws: 85, total: 85 },
  },
  {
    date: '2024-09-06',
    label: 'Sep 06',
    dragon: { gemini: 274, openrouter: 446, aws: 720, total: 1440 },
    okrian: { gemini: 134, openrouter: 192, aws: 634, total: 960 },
    workbench: { gemini: 125, openrouter: 86, aws: 449, total: 660 },
    unallocated: { gemini: 0, openrouter: 0, aws: 95, total: 95 },
  },
  {
    date: '2024-09-08',
    label: 'Sep 08',
    dragon: { gemini: 293, openrouter: 477, aws: 770, total: 1540 },
    okrian: { gemini: 140, openrouter: 200, aws: 660, total: 1000 },
    workbench: { gemini: 129, openrouter: 88, aws: 463, total: 680 },
    unallocated: { gemini: 0, openrouter: 0, aws: 100, total: 100 },
  },
  {
    date: '2024-09-10',
    label: 'Sep 10',
    dragon: { gemini: 333, openrouter: 543, aws: 874, total: 1750 },
    okrian: { gemini: 147, openrouter: 210, aws: 693, total: 1050 },
    workbench: { gemini: 135, openrouter: 92, aws: 483, total: 710 },
    unallocated: { gemini: 0, openrouter: 0, aws: 110, total: 110 },
  },
];

export interface ProviderDistributionItem {
  id: string;
  product: string;
  gemini: number;
  openrouter: number;
  aws: number;
}

export const BASE_DISTRIBUTION: ProviderDistributionItem[] = [
  { id: 'dragon', product: 'Dragon Suite', gemini: 19, openrouter: 31, aws: 50 },
  { id: 'okrian', product: 'Okrian', gemini: 14, openrouter: 20, aws: 66 },
  { id: 'workbench', product: 'Workbench', gemini: 19, openrouter: 13, aws: 68 },
];
