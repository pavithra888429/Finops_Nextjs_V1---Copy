const fs = require('fs');
const path = require('path');

// Read existing workflow-1791028664333.json as base
const baseWf = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'workflow-1791028664333.json'), 'utf8'));

// Code 1: Process Cost Explorer
const code1CE = `// ===============================================================
// Code Node 1: Process AWS Cost Explorer Document
// Upstream: Find Document (awscostexplorer)
// ===============================================================

// 1. Resolve Requested Billing Period
const webhookData = 
  $node["Webhook Trigger"]?.json || 
  $node["Webhook"]?.json || 
  {};
const webhookBody = webhookData.body || webhookData;

const inputItem = (typeof $input !== 'undefined' && typeof $input.first === 'function') 
  ? ($input.first()?.json || {}) 
  : {};

const requestedBillingPeriod = 
  webhookBody.billingPeriod || 
  webhookData.query?.billingPeriod || 
  inputItem.billingPeriod || 
  '';

// 2. Resolve Cost Explorer documents
const docs = 
  inputItem.documents || 
  $node["Find Document (Cost Explorer)"]?.json?.documents || 
  $node["Find Document"]?.json?.documents || 
  [];

const availableBillingPeriods = Array.from(new Set(
  docs.map(d => d.billingPeriod).filter(Boolean)
)).sort();

let doc = null;
if (requestedBillingPeriod) {
  doc = docs.find(d => d.billingPeriod === requestedBillingPeriod);
}
if (!doc && docs.length > 0) {
  doc = [...docs].sort((a, b) => {
    const pa = a.billingPeriod || '', pb = b.billingPeriod || '';
    if (pa !== pb) return pb.localeCompare(pa);
    return (new Date(b.fetchedAt || 0).getTime()) - (new Date(a.fetchedAt || 0).getTime());
  })[0];
}
if (!doc) doc = inputItem.billingPeriod ? inputItem : {};

// 3. Extract Core Metrics
const accountId = doc.accountId || '864981730114';
const accountName = doc.accountName || 'Production AWS Account';
const billingPeriod = doc.billingPeriod || (doc.timePeriod?.start ? doc.timePeriod.start.slice(0, 7) : requestedBillingPeriod || '2026-09');
const timePeriod = doc.timePeriod || { start: \`\${billingPeriod}-01\`, end: \`\${billingPeriod}-30\` };

const totalSpend = Number(doc.summary?.totalUnblendedCost || 0);
const totalAmortized = Number(doc.summary?.totalAmortizedCost || totalSpend);
const currency = doc.summary?.currency || 'USD';

const projects = Array.isArray(doc.projectSummary) ? doc.projectSummary : [];
const services = Array.isArray(doc.serviceSummary) ? doc.serviceSummary : [];
const dailyTotals = Array.isArray(doc.dailyTotals) ? doc.dailyTotals : [];
const serviceWiseDaily = Array.isArray(doc.serviceWiseDaily) ? doc.serviceWiseDaily : [];

const daysCount = dailyTotals.length > 0 ? dailyTotals.length : 30;
const dailyAvg = totalSpend > 0 ? Number((totalSpend / daysCount).toFixed(2)) : 0;

// Top Project
const topProj = projects.find(p => (p.projectName || p.project_name) !== 'Untagged') || projects[0] || null;
const topProjName = topProj ? (topProj.projectName || topProj.project_name) : 'N/A';
const topProjCost = topProj ? Number(topProj.unblendedCost || 0) : 0;
const topProjShare = totalSpend > 0 ? Number(((topProjCost / totalSpend) * 100).toFixed(1)) : 0;

// Top Service
const topSvc = services[0] || null;
const topSvcName = topSvc?.service || 'N/A';
const topSvcCost = topSvc ? Number(topSvc.unblendedCost || 0) : 0;
const topSvcShare = totalSpend > 0 ? Number(((topSvcCost / totalSpend) * 100).toFixed(1)) : 0;

// Governance
const untaggedItem = projects.find(p => (p.projectName || p.project_name) === 'Untagged');
const untaggedSpend = untaggedItem ? Number(Number(untaggedItem.unblendedCost || 0).toFixed(2)) : 0;
const taggedSpend = Number(Math.max(0, totalSpend - untaggedSpend).toFixed(2));
const tagCoveragePercentage = totalSpend > 0 ? Number(((taggedSpend / totalSpend) * 100).toFixed(1)) : 0;

// Matrix
const topMatrixServices = services.slice(0, 10).map(s => s.service);
const matrixRows = projects.slice(0, 10).map(p => {
  const pName = p.projectName || p.project_name || 'Untagged';
  const srvCostMap = {};
  (p.services || []).forEach(s => { srvCostMap[s.service] = Number(s.unblendedCost || 0); });
  return {
    productId: pName, productName: pName, project: pName, projectName: pName, project_name: pName,
    services: srvCostMap, serviceCosts: srvCostMap,
    total: Number(p.unblendedCost || 0), totalCost: Number(p.unblendedCost || 0),
  };
});
const matrix = { services: topMatrixServices, rows: matrixRows };

const topCostDrivers = projects.slice(0, 5).map(p => ({
  name: p.projectName || p.project_name,
  cost: Number(p.unblendedCost || 0),
  share: totalSpend > 0 ? Number(((Number(p.unblendedCost || 0) / totalSpend) * 100).toFixed(1)) : 0,
}));

const kpis = {
  totalSpend, totalAmortized, currency, dailyAvg, daysCount,
  projectsCount: projects.length, servicesCount: services.length,
  taggedSpend, untaggedSpend, tagCoveragePercentage,
  topProject: { name: topProjName, cost: topProjCost, share: topProjShare },
  topService: { name: topSvcName, cost: topSvcCost, share: topSvcShare },
};

return {
  json: {
    accountId, accountName, billingPeriod, timePeriod, availableBillingPeriods,
    kpis, totalSpend, totalAmortized, currency, dailyAvg, daysCount,
    projectsCount: projects.length, servicesCount: services.length,
    taggedSpend, untaggedSpend, tagCoveragePercentage,
    topProject: kpis.topProject, topService: kpis.topService,
    projects, projectSummary: projects,
    services, serviceSummary: services,
    dailyTotals, dailyTimeline: dailyTotals, serviceWiseDaily,
    matrix, topCostDrivers,
    fetchedAt: doc.fetchedAt || new Date().toISOString()
  }
};
`;

// Code 2: Process CUR Region Mapping
const code2CUR = `// ===============================================================
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
  const m = String(usageType || '').match(/^([A-Z]{2,4}\\d?)-/);
  if (m && REGION_PREFIX[m[1]]) return REGION_PREFIX[m[1]];
  if (GLOBAL_PRODUCT_CODES.has(productCode)) return 'global';
  return 'us-east-1';
}

function ceServiceName(rec) {
  const code = rec.service || '';
  if (/^Tax\\b/i.test(rec.description || '')) return 'Tax';
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
`;

// Code 3: Merge Final Response
const code3Merge = `// ===============================================================
// Code Node 3: Merge Cost Explorer & CUR Region Outputs
// Upstream: Code: Process Cost Explorer + Code: Process CUR Region
// ===============================================================

// 1. Resolve outputs from both upstream Code nodes
const ceResult = 
  $node["Code: Process Cost Explorer"]?.json || 
  $node["Code"]?.json || 
  {};

const curResult = 
  $node["Code: Process CUR Region"]?.json || 
  $node["Code 1"]?.json || 
  {};

const totalSpend = ceResult.totalSpend || 0;
const projects = ceResult.projects || [];
const serviceRegionBreakdown = curResult.serviceRegionBreakdown || {};

// 2. Scale regionSummary cost to match Cost Explorer totalSpend
const regionSummary = (curResult.regionSummary || []).map(r => ({
  region: r.region,
  share: r.share,
  cost: Number(((r.share / 100) * totalSpend).toFixed(2))
})).filter(r => r.cost >= 0.01);

// 3. Build Explorer Rows: Project x Service x Region
const explorerRows = [];
projects.forEach(p => {
  const pName = p.projectName || p.project_name || 'Untagged';
  (p.services || []).forEach(s => {
    const cost = Number(s.unblendedCost || 0);
    if (cost <= 0) return;

    const splits = serviceRegionBreakdown[s.service];
    if (!splits || splits.length === 0) {
      explorerRows.push({
        project: pName,
        service: s.service,
        region: 'unmapped',
        cost: Number(cost.toFixed(2)),
        regionShare: 1,
        regionSource: 'none'
      });
      return;
    }

    splits.forEach(sp => {
      const allocated = cost * sp.share;
      if (allocated < 0.005) return;
      explorerRows.push({
        project: pName,
        service: s.service,
        region: sp.region,
        cost: Number(allocated.toFixed(2)),
        regionShare: sp.share,
        regionSource: splits.length === 1 ? 'cur_exact' : 'cur_allocated'
      });
    });
  });
});
explorerRows.sort((a, b) => b.cost - a.cost);

const topRegion = regionSummary[0] || null;
const kpis = {
  ...(ceResult.kpis || {}),
  topRegion
};

// 4. Return Final Combined Payload for Webhook Response
return {
  json: {
    success: true,
    source: 'agentbuilder_workflow',
    ...ceResult,
    kpis,
    topRegion,
    regionSummary,
    serviceRegionBreakdown,
    explorerRows,
    curRegionMeta: {
      available: curResult.curAvailable || false,
      billingPeriod: curResult.curBillingPeriod,
      curLineItems: curResult.curLineItems || 0,
      curTotalCost: curResult.curTotalCost || 0,
      costExplorerTotal: totalSpend,
      curCoveragePct: totalSpend > 0 ? Number(((curResult.curTotalCost / totalSpend) * 100).toFixed(1)) : 0,
      method: 'CUR usageType parsed in Code 2; merged with Cost Explorer in Code 3'
    }
  }
};
`;

// Save individual clean JS files for user convenience
fs.writeFileSync(path.join(__dirname, 'code_node_1_cost_explorer.js'), code1CE, 'utf8');
fs.writeFileSync(path.join(__dirname, 'code_node_2_cur_region.js'), code2CUR, 'utf8');
fs.writeFileSync(path.join(__dirname, 'code_node_3_merge.js'), code3Merge, 'utf8');

console.log('Successfully wrote the 3 modular code files to scratch/ directory!');
