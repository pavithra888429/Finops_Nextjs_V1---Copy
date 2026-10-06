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

// In-place processing without allocating any sub-array!
function processSliceInPlace(curRecords, startIndex, endIndex) {
  const svcRegionCost = {};
  const regionCost = {};
  let curTotal = 0;
  let processed = 0;

  const start = Math.max(0, startIndex);
  const end = Math.min(curRecords.length, endIndex);

  for (let i = start; i < end; i++) {
    const rec = curRecords[i];
    processed++;
    const cost = Number(rec.unblendedCost || 0);
    if (cost <= 0) continue;

    const svc = ceServiceName(rec);
    const region = regionFromUsageType(rec.service, rec.usageType);

    svcRegionCost[svc] = svcRegionCost[svc] || {};
    svcRegionCost[svc][region] = (svcRegionCost[svc][region] || 0) + cost;

    regionCost[region] = (regionCost[region] || 0) + cost;
    curTotal += cost;
  }

  return {
    curTotal: Number(curTotal.toFixed(4)),
    recordCount: processed,
    regionCost,
    svcRegionCost
  };
}

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db('finops_3');

  console.log('Loading single document from finopscostrecords for 2026-09...');
  const doc = await db.collection('finopscostrecords').findOne({ billingPeriod: '2026-09' });
  const records = doc.records;
  console.log('Total records in single document:', records.length);

  // Batch 1: 0 to 11500
  const t1 = Date.now();
  const b1 = processSliceInPlace(records, 0, 11500);
  console.log(`Batch 1: ${b1.recordCount} records processed in ${Date.now() - t1}ms, cost: $${b1.curTotal}`);

  // Batch 2: 11500 to 23000
  const t2 = Date.now();
  const b2 = processSliceInPlace(records, 11500, 23000);
  console.log(`Batch 2: ${b2.recordCount} records processed in ${Date.now() - t2}ms, cost: $${b2.curTotal}`);

  // Batch 3: 23000 to end
  const t3 = Date.now();
  const b3 = processSliceInPlace(records, 23000, records.length);
  console.log(`Batch 3: ${b3.recordCount} records processed in ${Date.now() - t3}ms, cost: $${b3.curTotal}`);

  // Merge
  const svcRegionCost = {};
  const regionCost = {};
  let curTotal = 0;
  [b1, b2, b3].forEach(b => {
    curTotal += b.curTotal;
    for (const r in b.regionCost) regionCost[r] = (regionCost[r] || 0) + b.regionCost[r];
    for (const s in b.svcRegionCost) {
      svcRegionCost[s] = svcRegionCost[s] || {};
      for (const r in b.svcRegionCost[s]) {
        svcRegionCost[s][r] = (svcRegionCost[s][r] || 0) + b.svcRegionCost[s][r];
      }
    }
  });

  console.log(`Total combined cost: $${curTotal.toFixed(2)}`);
  console.log('Region sums:', regionCost);

  await client.close();
}

run().catch(console.error);
