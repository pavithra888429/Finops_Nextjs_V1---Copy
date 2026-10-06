const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

const REGION_PREFIX = {
  USE1: 'us-east-1', USE2: 'us-east-2', USW1: 'us-west-1', USW2: 'us-west-2',
  APS1: 'ap-southeast-1', APS2: 'ap-southeast-2', APS3: 'ap-south-1', APS4: 'ap-southeast-3',
  APS5: 'ap-south-2', APN1: 'ap-northeast-1', APN2: 'ap-northeast-2', APN3: 'ap-northeast-3',
  APE1: 'ap-east-1', EU: 'eu-west-1', EUW1: 'eu-west-1', EUW2: 'eu-west-2', EUW3: 'eu-west-3',
  EUC1: 'eu-central-1', EUC2: 'eu-central-2', EUN1: 'eu-north-1', EUS1: 'eu-south-1',
  CAN1: 'ca-central-1', SAE1: 'sa-east-1', MES1: 'me-south-1', MEC1: 'me-central-1', AFS1: 'af-south-1',
};
const GLOBAL_PRODUCT_CODES = new Set(['AmazonRoute53', 'AmazonCloudFront', 'awswaf', 'AWSCostExplorer']);
const CUR_TO_CE = {
  AWSELB: 'Amazon Elastic Load Balancing',
  AmazonVPC: 'Amazon Virtual Private Cloud',
  awswaf: 'AWS WAF',
  AWSAmplify: 'AWS Amplify',
  AmazonRoute53: 'Amazon Route 53',
  AmazonS3: 'Amazon Simple Storage Service',
  AmazonCloudWatch: 'AmazonCloudWatch',
  AmazonECR: 'Amazon EC2 Container Registry (ECR)',
  AWSSecretsManager: 'AWS Secrets Manager',
  AWSCostExplorer: 'AWS Cost Explorer',
  AmazonSES: 'Amazon Simple Email Service',
  AWSGlue: 'AWS Glue',
  awskms: 'AWS Key Management Service',
  AWSLambda: 'AWS Lambda',
  AmazonCloudFront: 'Amazon CloudFront',
  AmazonECS: 'Amazon Elastic Container Service',
  AWSEvents: 'CloudWatch Events',
  ACM: 'AWS Certificate Manager',
  AWSDataTransfer: 'AWS Data Transfer',
};
const EC2_COMPUTE_PATTERN = /(BoxUsage|SpotUsage|DedicatedUsage|HostUsage|UnusedBox|ReservedHostUsage)/;

function regionFromUsageType(productCode, usageType) {
  const m = String(usageType || '').match(/^([A-Z]{2,4}\d?)-/);
  if (m && REGION_PREFIX[m[1]]) return REGION_PREFIX[m[1]];
  if (GLOBAL_PRODUCT_CODES.has(productCode)) return 'global';
  return 'us-east-1';
}

function ceServiceName(rec) {
  const code = rec.service || '';
  if (/^Tax\b/i.test(rec.description || '')) return 'Tax';
  if (code === 'AmazonEC2') {
    return EC2_COMPUTE_PATTERN.test(rec.usageType || '')
      ? 'Amazon Elastic Compute Cloud - Compute'
      : 'EC2 - Other';
  }
  return CUR_TO_CE[code] || code;
}

function runBatchCode(records) {
  const svcRegionCost = {};
  const regionCost = {};
  let curTotal = 0;

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const cost = Number(rec.unblendedCost || 0);
    if (cost <= 0) continue;

    const svc = ceServiceName(rec);
    const region = regionFromUsageType(rec.service, rec.usageType);

    svcRegionCost[svc] = svcRegionCost[svc] || {};
    svcRegionCost[svc][region] = (svcRegionCost[svc][region] || 0) + cost;

    regionCost[region] = (regionCost[region] || 0) + cost;
    curTotal += cost;
  }

  return { svcRegionCost, regionCost, curTotal, recordCount: records.length };
}

function merge3Batches(b1, b2, b3) {
  const svcRegionCost = {};
  const regionCost = {};
  let curTotal = 0;
  let totalRecords = 0;

  [b1, b2, b3].forEach(b => {
    if (!b) return;
    curTotal += (b.curTotal || 0);
    totalRecords += (b.recordCount || 0);

    for (const r in (b.regionCost || {})) {
      regionCost[r] = (regionCost[r] || 0) + b.regionCost[r];
    }

    for (const svc in (b.svcRegionCost || {})) {
      svcRegionCost[svc] = svcRegionCost[svc] || {};
      for (const r in b.svcRegionCost[svc]) {
        svcRegionCost[svc][r] = (svcRegionCost[svc][r] || 0) + b.svcRegionCost[svc][r];
      }
    }
  });

  const serviceRegionBreakdown = {};
  for (const svc in svcRegionCost) {
    const regMap = svcRegionCost[svc];
    let svcTotal = 0;
    for (const r in regMap) svcTotal += regMap[r];

    serviceRegionBreakdown[svc] = Object.entries(regMap)
      .map(([region, cost]) => ({
        region,
        curCost: Number(cost.toFixed(4)),
        share: svcTotal > 0 ? Number((cost / svcTotal).toFixed(4)) : 0
      }))
      .sort((a, b) => b.share - a.share);
  }

  const regionSummary = Object.entries(regionCost)
    .map(([region, cost]) => ({
      region,
      curCost: Number(cost.toFixed(2)),
      share: curTotal > 0 ? Number(((cost / curTotal) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.curCost - a.curCost);

  return {
    curTotal: Number(curTotal.toFixed(2)),
    totalRecords,
    regionSummary,
    serviceRegionBreakdown
  };
}

async function testPeriod(db, period) {
  console.log(`\n=== Testing Period ${period} ===`);
  const [d1, d2, d3] = await Promise.all([
    db.collection('finopscostrecords').findOne({ billingPeriod: period }, { projection: { billingPeriod: 1, records: { $slice: [0, 11500] } } }),
    db.collection('finopscostrecords').findOne({ billingPeriod: period }, { projection: { billingPeriod: 1, records: { $slice: [11500, 11500] } } }),
    db.collection('finopscostrecords').findOne({ billingPeriod: period }, { projection: { billingPeriod: 1, records: { $slice: [23000, 11500] } } })
  ]);

  const b1 = runBatchCode(d1?.records || []);
  const b2 = runBatchCode(d2?.records || []);
  const b3 = runBatchCode(d3?.records || []);

  console.log(`Batch 1: ${b1.recordCount} records, cost: $${b1.curTotal.toFixed(2)}`);
  console.log(`Batch 2: ${b2.recordCount} records, cost: $${b2.curTotal.toFixed(2)}`);
  console.log(`Batch 3: ${b3.recordCount} records, cost: $${b3.curTotal.toFixed(2)}`);

  const merged = merge3Batches(b1, b2, b3);
  console.log(`Merged Total: ${merged.totalRecords} records, cost: $${merged.curTotal}`);
  console.log('Top regions:', merged.regionSummary.slice(0, 3));
}

async function main() {
  const client = await MongoClient.connect(uri);
  const db = client.db('finops_3');
  await testPeriod(db, '2026-09');
  await testPeriod(db, '2026-10');
  await client.close();
}

main().catch(console.error);
