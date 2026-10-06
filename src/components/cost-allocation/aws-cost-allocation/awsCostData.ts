export interface ProductCostSummary {
  id: string;
  name: string;
  cost: number;
  share: number;
  prevCost: number;
  change: number;
  color: string;
  borderColor: string;
  bgColor: string;
  badgeBg: string;
  textColor: string;
  description: string;
}

export interface AwsServiceCost {
  service: string;
  cost: number;
  share: number;
  prevCost: number;
  change: number;
  iconName: string;
  category: string;
}

export interface MatrixRow {
  productId: string;
  productName: string;
  eks: number;
  ec2: number;
  rds: number;
  s3: number;
  dataTransfer: number;
  other: number;
  total: number;
}

export interface ExplorerRow {
  id: string;
  product: string;
  productId: string;
  service: string;
  account: string;
  region: string;
  environment: string;
  cost: number;
  share: number;
  change: number;
  usageType: string;
  resourceId: string;
}

export interface CostDriverRow {
  resourceId: string;
  service: string;
  product: string;
  productId: string;
  account: string;
  region: string;
  usageType: string;
  cost: number;
  change: number;
  status: 'active' | 'increasing' | 'stable';
}

export interface DailyTrendPoint {
  date: string;
  label: string;
  dayIndex: number;
  dragon: number;
  okrian: number;
  workbench: number;
  unallocated: number;
  total: number;
  prevTotal: number;
}

// Exactly specified KPI and product cost allocations (Total: $31,589.60)
export const AWS_TOTAL_COST = 31589.60;
export const AWS_PREV_TOTAL_COST = 28130.00;
export const AWS_TOTAL_CHANGE = 12.1;

export const AWS_PRODUCT_ALLOCATIONS: ProductCostSummary[] = [
  {
    id: 'dragon',
    name: 'Dragon Suite',
    cost: 11000.20,
    share: 34.8,
    prevCost: 9633.60,
    change: 14.2,
    color: '#a855f7',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/10',
    badgeBg: 'bg-purple-900/30 text-purple-300 border-purple-700/50',
    textColor: 'text-purple-400',
    description: 'AI-assisted enterprise automation suite with heavy distributed compute and indexing workloads',
  },
  {
    id: 'okrian',
    name: 'Okrian',
    cost: 9500.00,
    share: 30.1,
    prevCost: 8651.50,
    change: 9.8,
    color: '#10b981',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-500/10',
    badgeBg: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50',
    textColor: 'text-emerald-400',
    description: 'High-throughput operational stream processing engine with dedicated cluster deployments',
  },
  {
    id: 'workbench',
    name: 'Workbench',
    cost: 8049.40,
    share: 25.5,
    prevCost: 7093.20,
    change: 13.5,
    color: '#3b82f6',
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-500/10',
    badgeBg: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
    textColor: 'text-blue-400',
    description: 'Interactive developer and analytics workspace with multi-tenant relational persistence',
  },
  {
    id: 'unallocated',
    name: 'Unallocated',
    cost: 3040.00,
    share: 9.6,
    prevCost: 2751.70,
    change: 10.5,
    color: '#f59e0b',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    badgeBg: 'bg-amber-900/30 text-amber-300 border-amber-700/50',
    textColor: 'text-amber-400',
    description: 'Shared networking infrastructure, untagged storage buckets, and common NAT Gateway traffic',
  },
];

// AWS Services breakdown
export const AWS_SERVICES_DATA: AwsServiceCost[] = [
  {
    service: 'Amazon EKS',
    cost: 10420.40,
    share: 33.0,
    prevCost: 9140.00,
    change: 14.0,
    iconName: 'Server',
    category: 'Containers & Orchestration',
  },
  {
    service: 'Amazon EC2',
    cost: 7860.20,
    share: 24.9,
    prevCost: 7120.00,
    change: 10.4,
    iconName: 'Cpu',
    category: 'Compute & Virtual Machines',
  },
  {
    service: 'Amazon RDS',
    cost: 4920.00,
    share: 15.6,
    prevCost: 4480.00,
    change: 9.8,
    iconName: 'Database',
    category: 'Managed Relational Databases',
  },
  {
    service: 'Amazon S3',
    cost: 2110.20,
    share: 6.7,
    prevCost: 1980.00,
    change: 6.6,
    iconName: 'HardDrive',
    category: 'Object & Blob Storage',
  },
  {
    service: 'Data Transfer',
    cost: 1840.00,
    share: 5.8,
    prevCost: 1670.00,
    change: 10.2,
    iconName: 'ArrowLeftRight',
    category: 'Inter-AZ & Internet Egress',
  },
  {
    service: 'Other Services',
    cost: 4439.80,
    share: 14.0,
    prevCost: 3740.00,
    change: 18.7,
    iconName: 'Boxes',
    category: 'CloudWatch, KMS, Bedrock, Route53',
  },
];

// Product × AWS Service Matrix rows (exactly matching specification)
export const AWS_MATRIX_DATA: MatrixRow[] = [
  {
    productId: 'dragon',
    productName: 'Dragon Suite',
    eks: 4820.20,
    ec2: 3100.00,
    rds: 1420.00,
    s3: 680.00,
    dataTransfer: 420.00,
    other: 560.00,
    total: 11000.20,
  },
  {
    productId: 'okrian',
    productName: 'Okrian',
    eks: 3580.20,
    ec2: 2860.40,
    rds: 1520.00,
    s3: 720.00,
    dataTransfer: 480.00,
    other: 339.40,
    total: 9500.00,
  },
  {
    productId: 'workbench',
    productName: 'Workbench',
    eks: 2020.00,
    ec2: 1900.20,
    rds: 1240.20,
    s3: 710.20,
    dataTransfer: 320.00,
    other: 1858.80,
    total: 8049.40,
  },
  {
    productId: 'unallocated',
    productName: 'Unallocated',
    eks: 0.00,
    ec2: 0.00,
    rds: 739.80,
    s3: 0.00,
    dataTransfer: 620.00,
    other: 1680.20,
    total: 3040.00,
  },
];

export const AWS_MATRIX_TOTAL: MatrixRow = {
  productId: 'total',
  productName: 'Total',
  eks: 10420.40,
  ec2: 7860.20,
  rds: 4920.00,
  s3: 2110.20,
  dataTransfer: 1840.00,
  other: 4439.80,
  total: 31589.60,
};

// Cost Allocation Explorer rows (as requested in spec)
export const AWS_EXPLORER_ROWS: ExplorerRow[] = [
  {
    id: 'exp-1',
    product: 'Dragon Suite',
    productId: 'dragon',
    service: 'Amazon EKS',
    account: 'Production Platform Account',
    region: 'us-east-1',
    environment: 'production',
    cost: 4820.20,
    share: 15.3,
    change: 17.2,
    usageType: 'EKS-Compute-m5.2xlarge',
    resourceId: 'arn:aws:eks:us-east-1:864981730114:cluster/dragon-prod',
  },
  {
    id: 'exp-2',
    product: 'Dragon Suite',
    productId: 'dragon',
    service: 'Amazon EC2',
    account: 'Production Platform Account',
    region: 'us-east-1',
    environment: 'production',
    cost: 3100.00,
    share: 9.8,
    change: 9.4,
    usageType: 'BoxUsage:c6i.xlarge',
    resourceId: 'i-092bf73199a0e1b2c',
  },
  {
    id: 'exp-3',
    product: 'Okrian',
    productId: 'okrian',
    service: 'Amazon EKS',
    account: 'Product Workloads Account',
    region: 'us-east-1',
    environment: 'production',
    cost: 3580.20,
    share: 11.3,
    change: 14.1,
    usageType: 'EKS-Managed-NodeGroup',
    resourceId: 'arn:aws:eks:us-east-1:864981730114:nodegroup/okrian-ng',
  },
  {
    id: 'exp-4',
    product: 'Okrian',
    productId: 'okrian',
    service: 'Amazon EC2',
    account: 'Product Workloads Account',
    region: 'eu-west-1',
    environment: 'production',
    cost: 2860.40,
    share: 9.1,
    change: 12.0,
    usageType: 'BoxUsage:m5.large',
    resourceId: 'i-0418f729b821a00fc',
  },
  {
    id: 'exp-5',
    product: 'Workbench',
    productId: 'workbench',
    service: 'Amazon EKS',
    account: 'Workbench Production Account',
    region: 'us-east-1',
    environment: 'production',
    cost: 2020.00,
    share: 6.4,
    change: 21.8,
    usageType: 'EKS-Pod-ResourceAllocation',
    resourceId: 'arn:aws:eks:us-east-1:864981730114:cluster/workbench-prod',
  },
  {
    id: 'exp-6',
    product: 'Workbench',
    productId: 'workbench',
    service: 'Amazon RDS',
    account: 'Workbench Production Account',
    region: 'eu-west-1',
    environment: 'production',
    cost: 1240.20,
    share: 3.9,
    change: 12.6,
    usageType: 'RDS:Multi-AZ-db.r6g.large',
    resourceId: 'db-workbench-postgres-primary',
  },
  {
    id: 'exp-7',
    product: 'Unallocated',
    productId: 'unallocated',
    service: 'Data Transfer',
    account: 'Shared Services Account',
    region: 'us-east-1',
    environment: 'shared',
    cost: 620.00,
    share: 2.0,
    change: 8.1,
    usageType: 'NatGateway-Bytes-Regional',
    resourceId: 'nat-07fa21980be1247ff',
  },
  {
    id: 'exp-8',
    product: 'Dragon Suite',
    productId: 'dragon',
    service: 'Amazon RDS',
    account: 'Production Platform Account',
    region: 'us-east-1',
    environment: 'production',
    cost: 1420.00,
    share: 4.5,
    change: 8.9,
    usageType: 'RDS:db.r6g.xlarge',
    resourceId: 'db-dragon-aurora-cluster',
  },
  {
    id: 'exp-9',
    product: 'Okrian',
    productId: 'okrian',
    service: 'Amazon RDS',
    account: 'Product Workloads Account',
    region: 'us-east-1',
    environment: 'production',
    cost: 1520.00,
    share: 4.8,
    change: 7.2,
    usageType: 'RDS:db.m5.xlarge',
    resourceId: 'db-okrian-postgres',
  },
  {
    id: 'exp-10',
    product: 'Workbench',
    productId: 'workbench',
    service: 'Amazon EC2',
    account: 'Workbench Production Account',
    region: 'us-east-1',
    environment: 'production',
    cost: 1900.20,
    share: 6.0,
    change: 11.2,
    usageType: 'BoxUsage:c6i.2xlarge',
    resourceId: 'i-088ac21890bf2311',
  },
];

// Top AWS Cost Drivers rows
export const AWS_COST_DRIVERS_DATA: CostDriverRow[] = [
  {
    resourceId: 'dragon-eks-prod',
    service: 'Amazon EKS',
    product: 'Dragon Suite',
    productId: 'dragon',
    account: 'Production Platform Account',
    region: 'us-east-1',
    usageType: 'EKS compute',
    cost: 2420.20,
    change: 18.2,
    status: 'increasing',
  },
  {
    resourceId: 'okrian-api-prod',
    service: 'Amazon EC2',
    product: 'Okrian',
    productId: 'okrian',
    account: 'Product Workloads Account',
    region: 'us-east-1',
    usageType: 'BoxUsage:m5.large',
    cost: 1860.40,
    change: 12.4,
    status: 'increasing',
  },
  {
    resourceId: 'workbench-db-prod',
    service: 'Amazon RDS',
    product: 'Workbench',
    productId: 'workbench',
    account: 'Workbench Production Account',
    region: 'eu-west-1',
    usageType: 'Database instance',
    cost: 740.20,
    change: 12.6,
    status: 'increasing',
  },
  {
    resourceId: 'shared-nat-gateway',
    service: 'Data Transfer',
    product: 'Unallocated',
    productId: 'unallocated',
    account: 'Shared Services Account',
    region: 'us-east-1',
    usageType: 'NatGateway-Bytes',
    cost: 620.00,
    change: 8.1,
    status: 'stable',
  },
  {
    resourceId: 'dragon-rds-aurora-replica',
    service: 'Amazon RDS',
    product: 'Dragon Suite',
    productId: 'dragon',
    account: 'Production Platform Account',
    region: 'us-east-1',
    usageType: 'db.r6g.xlarge Multi-AZ',
    cost: 580.00,
    change: 4.2,
    status: 'stable',
  },
  {
    resourceId: 'workbench-s3-artifacts',
    service: 'Amazon S3',
    product: 'Workbench',
    productId: 'workbench',
    account: 'Workbench Production Account',
    region: 'us-east-1',
    usageType: 'StandardStorage (TB/Mo)',
    cost: 480.00,
    change: 15.3,
    status: 'increasing',
  },
  {
    resourceId: 'okrian-network-nlb',
    service: 'Amazon EC2',
    product: 'Okrian',
    productId: 'okrian',
    account: 'Product Workloads Account',
    region: 'eu-west-1',
    usageType: 'LoadBalancerUsage',
    cost: 390.00,
    change: 2.1,
    status: 'stable',
  },
  {
    resourceId: 'unallocated-untagged-snapshots',
    service: 'Other Services',
    product: 'Unallocated',
    productId: 'unallocated',
    account: 'Shared Services Account',
    region: 'us-east-1',
    usageType: 'EBS:SnapshotUsage',
    cost: 340.00,
    change: 6.8,
    status: 'stable',
  },
];

// Generates 30 days of daily stacked AWS cost data consistent with totals
export function generate30DayAwsTrend(): DailyTrendPoint[] {
  const points: DailyTrendPoint[] = [];
  const days = 30;

  // Exact target totals for 30 days:
  // Dragon: 11000.20 -> avg ~366.67/day
  // Okrian: 9500.00 -> avg ~316.67/day
  // Workbench: 8049.40 -> avg ~268.31/day
  // Unallocated: 3040.00 -> avg ~101.33/day
  // Total: 31589.60 -> avg ~1052.99/day

  const dailyWeights = [
    0.92, 0.94, 0.88, 0.91, 0.95, 0.99, 1.02,
    0.96, 0.98, 0.93, 0.97, 1.01, 1.04, 1.06,
    0.98, 0.99, 0.95, 0.98, 1.03, 1.07, 1.10,
    1.02, 1.05, 0.99, 1.03, 1.08, 1.12, 1.15,
    1.14, 1.18,
  ];

  const sumWeights = dailyWeights.reduce((a, b) => a + b, 0);

  let accDragon = 0;
  let accOkrian = 0;
  let accWorkbench = 0;
  let accUnallocated = 0;

  for (let i = 0; i < days; i++) {
    const isLast = i === days - 1;
    const w = dailyWeights[i] / sumWeights;

    let dVal = isLast ? Math.round((11000.20 - accDragon) * 100) / 100 : Math.round(11000.20 * w * 100) / 100;
    let oVal = isLast ? Math.round((9500.00 - accOkrian) * 100) / 100 : Math.round(9500.00 * w * 100) / 100;
    let wVal = isLast ? Math.round((8049.40 - accWorkbench) * 100) / 100 : Math.round(8049.40 * w * 100) / 100;
    let uVal = isLast ? Math.round((3040.00 - accUnallocated) * 100) / 100 : Math.round(3040.00 * w * 100) / 100;

    accDragon += dVal;
    accOkrian += oVal;
    accWorkbench += wVal;
    accUnallocated += uVal;

    const dayTotal = Math.round((dVal + oVal + wVal + uVal) * 100) / 100;
    // previous period comparison: ~12% lower on average with subtle variation
    const prevTotal = Math.round((dayTotal / 1.121) * 100) / 100;

    const dayNum = i + 1;
    const dateStr = `2026-09-${dayNum < 10 ? '0' + dayNum : dayNum}`;
    const labelStr = `Sep ${dayNum < 10 ? '0' + dayNum : dayNum}`;

    points.push({
      date: dateStr,
      label: labelStr,
      dayIndex: i,
      dragon: dVal,
      okrian: oVal,
      workbench: wVal,
      unallocated: uVal,
      total: dayTotal,
      prevTotal,
    });
  }

  return points;
}
