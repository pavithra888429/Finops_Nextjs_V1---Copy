// ===============================================================
// Code: CUR Batch 1 (Processes records 0 to 11,500)
// Upstream: Find Document (Cost Records)
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

// Retrieve CUR document from upstream Find Document node
const curDocs = inputItem.documents || [inputItem];
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

// AWS Standard region prefixes
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

// BATCH 1: Process index 0 to 11,500 (in-place without allocating extra arrays)
const start = 0;
const end = Math.min(11500, curRecords.length);

for (let i = start; i < end; i++) {
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

return {
  json: {
    curTotal: Number(curTotal.toFixed(4)),
    recordCount: end - start,
    billingPeriod,
    regionCost,
    svcRegionCost
  }
};
