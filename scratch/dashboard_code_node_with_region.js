// ===============================================================
// Dashboard Workflow - Code node (AWS Cost Explorer + CUR Region)
// Upstream chain: Webhook Trigger -> Find Document (awscostexplorer)
//                 -> Find CUR Records (finopscostrecords) -> Code
// ===============================================================

// ---------------------------------------------------------------
// 1. Resolve Requested Billing Period (Live Webhook + Canvas Test)
// ---------------------------------------------------------------
const webhookData =
  $node["Webhook Trigger"]?.json ||
  $node["Webhook"]?.json ||
  $node["webhook-1790843991079001"]?.json ||
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

// ---------------------------------------------------------------
// 2. Resolve Documents by node name (two Mongo nodes upstream)
// ---------------------------------------------------------------
const ceDocsRaw =
  $node["Find Document"]?.json?.documents ||
  $node["mongodb.find_document-1790844000266002"]?.json?.documents ||
  [];
const curDocsRaw =
  $node["Find CUR Records"]?.json?.documents ||
  $node["mongodb.find_document-cur-region-001"]?.json?.documents ||
  [];

// Safety: classify by shape in case node outputs get swapped
const allDocs = [...ceDocsRaw, ...curDocsRaw, ...(inputItem.documents || [])];
const docs = allDocs.filter(d => d && Array.isArray(d.projectSummary));
const curDocs = allDocs.filter(d => d && Array.isArray(d.records));

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
if (!doc) doc = {};

// ---------------------------------------------------------------
// 3. Extract Core Properties
// ---------------------------------------------------------------
const accountId = doc.accountId || '864981730114';
const accountName = doc.accountName || 'Production AWS Account';
const billingPeriod = doc.billingPeriod || (doc.timePeriod?.start ? doc.timePeriod.start.slice(0, 7) : requestedBillingPeriod);
const timePeriod = doc.timePeriod || { start: `${billingPeriod}-01`, end: `${billingPeriod}-30` };

const totalSpend = Number(doc.summary?.totalUnblendedCost || 0);
const totalAmortized = Number(doc.summary?.totalAmortizedCost || totalSpend);
const currency = doc.summary?.currency || 'USD';

const projects = Array.isArray(doc.projectSummary) ? doc.projectSummary : [];
const services = Array.isArray(doc.serviceSummary) ? doc.serviceSummary : [];
const dailyTotals = Array.isArray(doc.dailyTotals) ? doc.dailyTotals : [];
const serviceWiseDaily = Array.isArray(doc.serviceWiseDaily) ? doc.serviceWiseDaily : [];

// ---------------------------------------------------------------
// 4. CUR Region Mapping (same month as Cost Explorer doc)
//    NOTE: stored records[].region is unreliable (always us-east-1),
//    so the real region is derived from the usageType prefix.
// ---------------------------------------------------------------
const REGION_PREFIX = {
  USE1: 'us-east-1', USE2: 'us-east-2', USW1: 'us-west-1', USW2: 'us-west-2',
  APS1: 'ap-southeast-1', APS2: 'ap-southeast-2', APS3: 'ap-south-1', APS4: 'ap-southeast-3',
  APS5: 'ap-south-2', APN1: 'ap-northeast-1', APN2: 'ap-northeast-2', APN3: 'ap-northeast-3',
  APE1: 'ap-east-1', EU: 'eu-west-1', EUW1: 'eu-west-1', EUW2: 'eu-west-2', EUW3: 'eu-west-3',
  EUC1: 'eu-central-1', EUC2: 'eu-central-2', EUN1: 'eu-north-1', EUS1: 'eu-south-1',
  CAN1: 'ca-central-1', SAE1: 'sa-east-1', MES1: 'me-south-1', MEC1: 'me-central-1', AFS1: 'af-south-1',
};
const GLOBAL_PRODUCT_CODES = new Set(['AmazonRoute53', 'AmazonCloudFront', 'awswaf', 'AWSCostExplorer']);

// CUR product code -> Cost Explorer service name
const CUR_TO_CE_SERVICE = {
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
  return 'us-east-1'; // AWS convention: usage types without a prefix are us-east-1
}

function ceServiceName(rec) {
  const code = rec.service || '';
  if (/^Tax\b/i.test(rec.description || '')) return 'Tax';
  if (code === 'AmazonEC2') {
    return EC2_COMPUTE_PATTERN.test(rec.usageType || '')
      ? 'Amazon Elastic Compute Cloud - Compute'
      : 'EC2 - Other';
  }
  return CUR_TO_CE_SERVICE[code] || code;
}

const curDoc = curDocs.find(d => d.billingPeriod === billingPeriod) || null;
const curRecords = curDoc && Array.isArray(curDoc.records) ? curDoc.records : [];

const svcRegionCost = {};   // { ceService: { region: cost } }
const regionCost = {};      // { region: cost }
let curTotal = 0;

curRecords.forEach(rec => {
  const cost = Number(rec.unblendedCost || 0);
  if (!cost) return;
  const svc = ceServiceName(rec);
  const region = regionFromUsageType(rec.service, rec.usageType);
  svcRegionCost[svc] = svcRegionCost[svc] || {};
  svcRegionCost[svc][region] = (svcRegionCost[svc][region] || 0) + cost;
  regionCost[region] = (regionCost[region] || 0) + cost;
  curTotal += cost;
});

// Service -> [{ region, share }] (shares, not absolute $, since CUR may be partial)
const serviceRegionBreakdown = {};
Object.entries(svcRegionCost).forEach(([svc, regions]) => {
  const svcTotal = Object.values(regions).reduce((s, v) => s + v, 0);
  serviceRegionBreakdown[svc] = Object.entries(regions)
    .map(([region, cost]) => ({
      region,
      curCost: Number(cost.toFixed(4)),
      share: svcTotal > 0 ? Number((cost / svcTotal).toFixed(4)) : 0,
    }))
    .sort((a, b) => b.share - a.share);
});

const regionSummary = Object.entries(regionCost)
  .map(([region, cost]) => ({
    region,
    share: curTotal > 0 ? Number(((cost / curTotal) * 100).toFixed(1)) : 0,
    // Scaled to Cost Explorer total so $ matches the dashboard KPIs
    cost: curTotal > 0 ? Number(((cost / curTotal) * totalSpend).toFixed(2)) : 0,
  }))
  .filter(r => r.cost >= 0.01)
  .sort((a, b) => b.cost - a.cost);

// ---------------------------------------------------------------
// 5. Explorer rows: Project x Service x Region
//    Project/service cost = Cost Explorer (real).
//    Region split = CUR service-level region shares (allocated).
// ---------------------------------------------------------------
const explorerRows = [];
projects.forEach(p => {
  const pName = p.projectName || p.project_name || 'Untagged';
  (p.services || []).forEach(s => {
    const cost = Number(s.unblendedCost || 0);
    if (cost <= 0) return;
    const splits = serviceRegionBreakdown[s.service];
    if (!splits || splits.length === 0) {
      explorerRows.push({
        project: pName, service: s.service, region: 'unmapped',
        cost: Number(cost.toFixed(2)), regionShare: 1, regionSource: 'none',
      });
      return;
    }
    splits.forEach(sp => {
      const allocated = cost * sp.share;
      if (allocated < 0.005) return;
      explorerRows.push({
        project: pName, service: s.service, region: sp.region,
        cost: Number(allocated.toFixed(2)),
        regionShare: sp.share,
        regionSource: splits.length === 1 ? 'cur_exact' : 'cur_allocated',
      });
    });
  });
});
explorerRows.sort((a, b) => b.cost - a.cost);

const curRegionMeta = {
  available: curRecords.length > 0,
  billingPeriod: curDoc?.billingPeriod || null,
  curLineItems: curRecords.length,
  curTotalCost: Number(curTotal.toFixed(2)),
  costExplorerTotal: totalSpend,
  curCoveragePct: totalSpend > 0 ? Number(((curTotal / totalSpend) * 100).toFixed(1)) : 0,
  method: 'region derived from CUR usageType prefix; project rows split by service-level region share',
};

// ---------------------------------------------------------------
// 6. KPIs
// ---------------------------------------------------------------
const daysCount = dailyTotals.length > 0 ? dailyTotals.length : 30;
const dailyAvg = totalSpend > 0 ? Number((totalSpend / daysCount).toFixed(2)) : 0;

const topProj = projects.find(p => (p.projectName || p.project_name) !== 'Untagged') || projects[0] || null;
const topProjName = topProj ? (topProj.projectName || topProj.project_name) : 'N/A';
const topProjCost = topProj ? Number(topProj.unblendedCost || 0) : 0;
const topProjShare = totalSpend > 0 ? Number(((topProjCost / totalSpend) * 100).toFixed(1)) : 0;

const topSvc = services[0] || null;
const topSvcName = topSvc?.service || 'N/A';
const topSvcCost = topSvc ? Number(topSvc.unblendedCost || 0) : 0;
const topSvcShare = totalSpend > 0 ? Number(((topSvcCost / totalSpend) * 100).toFixed(1)) : 0;

const untaggedItem = projects.find(p => (p.projectName || p.project_name) === 'Untagged');
const untaggedSpend = untaggedItem ? Number(Number(untaggedItem.unblendedCost || 0).toFixed(2)) : 0;
const taggedSpend = Number(Math.max(0, totalSpend - untaggedSpend).toFixed(2));
const tagCoveragePercentage = totalSpend > 0 ? Number(((taggedSpend / totalSpend) * 100).toFixed(1)) : 0;

// ---------------------------------------------------------------
// 7. Project x Service Matrix
// ---------------------------------------------------------------
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
  topRegion: regionSummary[0] || null,
};

// ---------------------------------------------------------------
// 8. Response
// ---------------------------------------------------------------
return {
  json: {
    success: true,
    source: 'agentbuilder_workflow',
    accountId, accountName, billingPeriod, timePeriod, availableBillingPeriods,
    kpis, totalSpend, totalAmortized, currency, dailyAvg, daysCount,
    projectsCount: projects.length, servicesCount: services.length,
    taggedSpend, untaggedSpend, tagCoveragePercentage,
    topProject: kpis.topProject, topService: kpis.topService,
    projects, projectSummary: projects,
    services, serviceSummary: services,
    dailyTotals, dailyTimeline: dailyTotals, serviceWiseDaily,
    matrix, topCostDrivers,
    regionSummary, serviceRegionBreakdown, explorerRows, curRegionMeta,
    fetchedAt: doc.fetchedAt || new Date().toISOString(),
  },
};
