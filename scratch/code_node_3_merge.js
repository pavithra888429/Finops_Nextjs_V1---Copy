// ===============================================================
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
