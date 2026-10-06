const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

// Region helpers
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

// -------------------------------------------------------------
// Helper to process a single batch into accumulator
// -------------------------------------------------------------
function processBatch(records, accumulator = { svcRegionCost: {}, regionCost: {}, curTotal: 0, count: 0 }) {
  const { svcRegionCost, regionCost } = accumulator;
  let curTotal = accumulator.curTotal;
  let count = accumulator.count;

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const cost = Number(rec.unblendedCost || 0);
    count++;
    if (cost <= 0) continue;

    const svc = ceServiceName(rec);
    const region = regionFromUsageType(rec.service, rec.usageType);

    svcRegionCost[svc] = svcRegionCost[svc] || {};
    svcRegionCost[svc][region] = (svcRegionCost[svc][region] || 0) + cost;

    regionCost[region] = (regionCost[region] || 0) + cost;
    curTotal += cost;
  }

  return { svcRegionCost, regionCost, curTotal, count };
}

// -------------------------------------------------------------
// Test running 3 sequential batches
// -------------------------------------------------------------
async function test() {
  const client = await MongoClient.connect(uri);
  const db = client.db('finops_3');

  console.log('--- FETCHING BATCH 1 (0..11500) ---');
  const d1 = await db.collection('finopscostrecords').findOne(
    { billingPeriod: '2026-09' },
    { projection: { billingPeriod: 1, records: { $slice: [0, 11500] } } }
  );
  console.log('Batch 1 records:', d1.records.length);
  const acc1 = processBatch(d1.records);
  console.log('Batch 1 done. Total so far: $' + acc1.curTotal.toFixed(2), 'Accumulator size (bytes):', JSON.stringify(acc1).length);

  console.log('--- FETCHING BATCH 2 (11500..11500) ---');
  const d2 = await db.collection('finopscostrecords').findOne(
    { billingPeriod: '2026-09' },
    { projection: { billingPeriod: 1, records: { $slice: [11500, 11500] } } }
  );
  console.log('Batch 2 records:', d2.records.length);
  const acc2 = processBatch(d2.records, acc1);
  console.log('Batch 2 done. Total so far: $' + acc2.curTotal.toFixed(2), 'Accumulator size (bytes):', JSON.stringify(acc2).length);

  console.log('--- FETCHING BATCH 3 (23000..11500) ---');
  const d3 = await db.collection('finopscostrecords').findOne(
    { billingPeriod: '2026-09' },
    { projection: { billingPeriod: 1, records: { $slice: [23000, 11500] } } }
  );
  console.log('Batch 3 records:', d3.records.length);
  const acc3 = processBatch(d3.records, acc2);
  console.log('Batch 3 done. Total processed: $' + acc3.curTotal.toFixed(2), 'Processed items count:', acc3.count);

  // Final summary calculation in Batch 3
  const serviceRegionBreakdown = {};
  for (const svc in acc3.svcRegionCost) {
    const regMap = acc3.svcRegionCost[svc];
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

  const regionSummary = Object.entries(acc3.regionCost)
    .map(([region, cost]) => ({
      region,
      curCost: Number(cost.toFixed(2)),
      share: acc3.curTotal > 0 ? Number(((cost / acc3.curTotal) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.curCost - a.curCost);

  console.log('Final regionSummary:');
  console.log(regionSummary.slice(0, 3));
  console.log('Final serviceRegionBreakdown services count:', Object.keys(serviceRegionBreakdown).length);

  await client.close();
}

test().catch(console.error);
