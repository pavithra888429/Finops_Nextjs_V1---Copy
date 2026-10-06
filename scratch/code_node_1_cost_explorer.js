// ===============================================================
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
