const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

// -------------------------------------------------------------
// Helper constants for CUR region extraction
// -------------------------------------------------------------
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
// SIMULATE CODE NODE 1: Process Cost Explorer Document
// -------------------------------------------------------------
function executeCodeNode1(ceInputDoc, requestedBillingPeriod = '2026-09') {
  const doc = ceInputDoc || {};
  const accountId = doc.accountId || '864981730114';
  const accountName = doc.accountName || 'Production AWS Account';
  const billingPeriod = doc.billingPeriod || requestedBillingPeriod || '2026-09';
  const timePeriod = doc.timePeriod || { start: `${billingPeriod}-01`, end: `${billingPeriod}-30` };

  const totalSpend = Number(doc.summary?.totalUnblendedCost || 0);
  const totalAmortized = Number(doc.summary?.totalAmortizedCost || totalSpend);
  const currency = doc.summary?.currency || 'USD';

  const projects = Array.isArray(doc.projectSummary) ? doc.projectSummary : [];
  const services = Array.isArray(doc.serviceSummary) ? doc.serviceSummary : [];
  const dailyTotals = Array.isArray(doc.dailyTotals) ? doc.dailyTotals : [];
  const serviceWiseDaily = Array.isArray(doc.serviceWiseDaily) ? doc.serviceWiseDaily : [];

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
    accountId, accountName, billingPeriod, timePeriod,
    kpis, totalSpend, totalAmortized, currency, dailyAvg, daysCount,
    projectsCount: projects.length, servicesCount: services.length,
    taggedSpend, untaggedSpend, tagCoveragePercentage,
    topProject: kpis.topProject, topService: kpis.topService,
    projects, projectSummary: projects,
    services, serviceSummary: services,
    dailyTotals, dailyTimeline: dailyTotals, serviceWiseDaily,
    matrix, topCostDrivers,
    fetchedAt: doc.fetchedAt || new Date().toISOString()
  };
}

// -------------------------------------------------------------
// SIMULATE CODE NODE 2: Process CUR Document for Region Mapping
// (Ultra-lean memory implementation)
// -------------------------------------------------------------
function executeCodeNode2(curInputDoc) {
  const curDoc = curInputDoc || {};
  const curRecords = Array.isArray(curDoc.records) ? curDoc.records : [];
  const billingPeriod = curDoc.billingPeriod || '';

  const svcRegionCost = {};
  const regionCost = {};
  let curTotal = 0;

  // Ultra-lean loop: no intermediate objects created
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

  // Calculate percentage shares per service
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

  // Top region summary
  const regionSummary = Object.entries(regionCost)
    .map(([region, cost]) => ({
      region,
      curCost: Number(cost.toFixed(2)),
      share: curTotal > 0 ? Number(((cost / curTotal) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.curCost - a.curCost);

  return {
    curAvailable: curRecords.length > 0,
    curBillingPeriod: billingPeriod,
    curLineItems: curRecords.length,
    curTotalCost: Number(curTotal.toFixed(2)),
    serviceRegionBreakdown,
    regionSummary
  };
}

// -------------------------------------------------------------
// SIMULATE CODE NODE 3: Merge CE Output + CUR Region Output
// -------------------------------------------------------------
function executeCodeNode3(ceResult, curResult) {
  const ce = ceResult || {};
  const cur = curResult || {};

  const totalSpend = ce.totalSpend || 0;
  const projects = ce.projects || [];
  const serviceRegionBreakdown = cur.serviceRegionBreakdown || {};

  // Scale regionSummary $ to match Cost Explorer totalSpend
  const regionSummary = (cur.regionSummary || []).map(r => ({
    region: r.region,
    share: r.share,
    cost: Number(((r.share / 100) * totalSpend).toFixed(2))
  })).filter(r => r.cost >= 0.01);

  // Generate explorerRows (Project x Service x Region)
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

  const kpis = {
    ...ce.kpis,
    topRegion: regionSummary[0] || null
  };

  return {
    success: true,
    source: 'agentbuilder_workflow',
    ...ce,
    kpis,
    topRegion: regionSummary[0] || null,
    regionSummary,
    serviceRegionBreakdown,
    explorerRows,
    curRegionMeta: {
      available: cur.curAvailable || false,
      billingPeriod: cur.curBillingPeriod,
      curLineItems: cur.curLineItems || 0,
      curTotalCost: cur.curTotalCost || 0,
      costExplorerTotal: totalSpend,
      curCoveragePct: totalSpend > 0 ? Number(((cur.curTotalCost / totalSpend) * 100).toFixed(1)) : 0,
      method: 'CUR usageType prefix parsed into regions; project rows split by service-level region share'
    }
  };
}

async function testAll() {
  const client = await MongoClient.connect(uri);
  const db = client.db('finops_3');

  console.log('Loading Cost Explorer doc for 2026-09...');
  const ceDoc = await db.collection('awscostexplorer').findOne({ billingPeriod: '2026-09' });

  console.log('Loading CUR doc for 2026-09...');
  const curDoc = await db.collection('finopscostrecords').findOne({ billingPeriod: '2026-09' });

  console.log('1. Executing Code Node 1...');
  const t1 = Date.now();
  const ceRes = executeCodeNode1(ceDoc, '2026-09');
  console.log(`Code Node 1 finished in ${Date.now() - t1}ms. Total spend: $${ceRes.totalSpend}, Projects: ${ceRes.projects.length}`);

  console.log('2. Executing Code Node 2...');
  const t2 = Date.now();
  const curRes = executeCodeNode2(curDoc);
  console.log(`Code Node 2 finished in ${Date.now() - t2}ms. Processed ${curRes.curLineItems} records. Top regions:`, curRes.regionSummary);

  console.log('3. Executing Code Node 3 (Merge)...');
  const t3 = Date.now();
  const mergedRes = executeCodeNode3(ceRes, curRes);
  console.log(`Code Node 3 finished in ${Date.now() - t3}ms. Generated ${mergedRes.explorerRows.length} explorerRows.`);
  console.log('Sample explorer row 0:', mergedRes.explorerRows[0]);
  console.log('Sample explorer row 1:', mergedRes.explorerRows[1]);

  await client.close();
}

testAll().catch(console.error);
