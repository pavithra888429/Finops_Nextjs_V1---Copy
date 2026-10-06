// ===============================================================
// Code: Merge Cost Explorer + 3 CUR Batches
// Upstream: 
//   - Code: Process Cost Explorer
//   - Code: CUR Batch 1
//   - Code: CUR Batch 2
//   - Code: CUR Batch 3
// ===============================================================

// 1. Resolve Cost Explorer output
const ceResult = 
  $node["Code: Process Cost Explorer"]?.json || 
  $node["Code"]?.json || 
  {};

// 2. Resolve the 3 CUR batches
const b1 = $node["Code: CUR Batch 1"]?.json || $node["Code 1"]?.json || {};
const b2 = $node["Code: CUR Batch 2"]?.json || $node["Code 2"]?.json || {};
const b3 = $node["Code: CUR Batch 3"]?.json || $node["Code 3"]?.json || {};

const totalSpend = ceResult.totalSpend || 0;
const projects = ceResult.projects || [];

// 3. Sum the 3 batches into a single aggregate map
const svcRegionCost = {};
const regionCost = {};
let curTotal = 0;
let totalRecords = 0;

[b1, b2, b3].forEach(batch => {
  if (!batch) return;
  curTotal += Number(batch.curTotal || 0);
  totalRecords += Number(batch.recordCount || 0);

  // Sum region totals
  for (const r in (batch.regionCost || {})) {
    regionCost[r] = (regionCost[r] || 0) + Number(batch.regionCost[r] || 0);
  }

  // Sum service-to-region costs
  for (const svc in (batch.svcRegionCost || {})) {
    svcRegionCost[svc] = svcRegionCost[svc] || {};
    for (const r in batch.svcRegionCost[svc]) {
      svcRegionCost[svc][r] = (svcRegionCost[svc][r] || 0) + Number(batch.svcRegionCost[svc][r] || 0);
    }
  }
});

// 4. Calculate service-level region breakdown
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

// 5. Calculate overall region summary (scaled to CE totalSpend)
const regionSummary = Object.entries(regionCost)
  .map(([region, cost]) => ({
    region,
    share: curTotal > 0 ? Number(((cost / curTotal) * 100).toFixed(1)) : 0,
    cost: curTotal > 0 ? Number(((cost / curTotal) * totalSpend).toFixed(2)) : 0
  }))
  .filter(r => r.cost >= 0.01)
  .sort((a, b) => b.cost - a.cost);

// 6. Build Explorer Rows: Project x Service x Region
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

// 7. Output complete response for Webhook Response node
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
      available: totalRecords > 0,
      billingPeriod: b1.billingPeriod || ceResult.billingPeriod,
      curLineItems: totalRecords,
      curTotalCost: Number(curTotal.toFixed(2)),
      costExplorerTotal: totalSpend,
      curCoveragePct: totalSpend > 0 ? Number(((curTotal / totalSpend) * 100).toFixed(1)) : 0,
      method: '3-batch slice ingestion: CUR usageType prefix parsed into regions'
    }
  }
};
