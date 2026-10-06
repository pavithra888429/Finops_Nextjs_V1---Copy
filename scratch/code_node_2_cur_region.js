// ===============================================================
// Code Node 2: Process CUR Document for Region Mapping
// Upstream: Find Document (finopscostrecords)
// ===============================================================

const webhookData = 
  $node["Webhook Trigger"]?.json || 
  $node["Webhook"]?.json || 
  {};
const webhookBody = webhookData.body || webhookData;
const requestedBillingPeriod = 
  webhookBody.billingPeriod || 
  webhookData.query?.billingPeriod || 
  '';

const inputItem = (typeof $input !== 'undefined' && typeof $input.first === 'function') 
  ? ($input.first()?.json || {}) 
  : {};

// Retrieve documents from upstream node
const curDocs = 
  inputItem.documents || 
  $node["Find Document (Cost Records)"]?.json?.documents || 
  $node["Find Document 1"]?.json?.documents || 
  [inputItem];

let curDoc = null;
if (requestedBillingPeriod) {
  curDoc = curDocs.find(d => d.billingPeriod === requestedBillingPeriod);
}
if (!curDoc && curDocs.length > 0) {
  curDoc = curDocs[0];
}
if (!curDoc) curDoc = {};

const curRecords = Array.isArray(curDoc.records) ? curDoc.records : [];
const billingPeriod = curDoc.billingPeriod || requestedBillingPeriod || '';

// Region Prefix Mapping (AWS Standard prefixes)
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

const svcRegionCost = {};
const regionCost = {};
let curTotal = 0;

// High performance, low-memory loop
for (let i = 0; i < curRecords.length; i++) {
  const rec = curRecords[i];
  const cost = Number(rec.unblendedCost || 0);
  if (cost <= 0) continue;

  const svc = ceServiceName(rec);
  const region = regionFromUsageType(rec.service, rec.usageType);

  svcRegionCost[svc] = svcRegionCost[svc] || {};
  svcRegionCost[svc][region] = (svcRegionCost[svc][region] || 0) + cost;

  regionCost[region] = (regionCost[region] || 0) + cost;
  curTotal += cost;
}

// Calculate service-level region breakdown
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

// Overall region breakdown
const regionSummary = Object.entries(regionCost)
  .map(([region, cost]) => ({
    region,
    curCost: Number(cost.toFixed(2)),
    share: curTotal > 0 ? Number(((cost / curTotal) * 100).toFixed(1)) : 0
  }))
  .sort((a, b) => b.curCost - a.curCost);

return {
  json: {
    curAvailable: curRecords.length > 0,
    curBillingPeriod: billingPeriod,
    curLineItems: curRecords.length,
    curTotalCost: Number(curTotal.toFixed(2)),
    serviceRegionBreakdown,
    regionSummary
  }
};
