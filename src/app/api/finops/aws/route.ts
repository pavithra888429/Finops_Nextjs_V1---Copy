import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';
const DB_NAME = process.env.MONGODB_DB || 'finops_3';
const COLLECTION_NAME = 'awsconnections';

let cachedClient: MongoClient | null = null;

async function getMongoClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    const awsAccountId = searchParams.get('awsAccountId');

    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Handle dedicated AWS Cost Explorer / Dashboard view query
    const viewParam = searchParams.get('view');
    const requestedBillingPeriod = searchParams.get('billingPeriod');

    if (viewParam === 'cost-explorer' || viewParam === 'dashboard') {
      const ceCol = db.collection('awscostexplorer');
      const connection = await collection.findOne({ status: 'connected' }, { sort: { updatedAt: -1, _id: -1 } });
      let distinctPeriods: string[] = [];
      try {
        distinctPeriods = await ceCol.distinct('billingPeriod');
      } catch (e) {}

      // Helper to format a MongoDB Cost Explorer document into the full dashboard payload
      const formatCeDoc = (ceDoc: any, prevDoc?: any) => {
        const totalSpend = Number(ceDoc.summary?.totalUnblendedCost || 0);
        const totalAmortized = Number(ceDoc.summary?.totalAmortizedCost || totalSpend);
        const rawServices = Array.isArray(ceDoc.serviceSummary) ? ceDoc.serviceSummary : [];
        const dailyTotals = Array.isArray(ceDoc.dailyTotals) ? ceDoc.dailyTotals : [];
        const serviceWiseDaily = Array.isArray(ceDoc.serviceWiseDaily) ? ceDoc.serviceWiseDaily : [];

        const daysCount = dailyTotals.length || (ceDoc.billingPeriod === '2026-10' ? 5 : 30);
        const dailyAvg = Number((totalSpend / daysCount).toFixed(2));

        // Previous month comparison (strictly calendar month before)
        const hasPrev = Boolean(prevDoc);
        const prevTotalSpend = hasPrev ? Number(prevDoc?.summary?.totalUnblendedCost || 0) : null;
        const prevDailyTotals = (hasPrev && Array.isArray(prevDoc?.dailyTotals)) ? prevDoc.dailyTotals : [];
        const prevDaysCount = prevDailyTotals.length || 30;
        const prevProjects = (hasPrev && Array.isArray(prevDoc?.projectSummary)) ? prevDoc.projectSummary : [];
        const prevServices = (hasPrev && Array.isArray(prevDoc?.serviceSummary)) ? prevDoc.serviceSummary : [];

        const totalCurrDaily = totalSpend / Math.max(1, daysCount);
        const totalPrevDaily = (prevTotalSpend !== null) ? prevTotalSpend / Math.max(1, prevDaysCount) : null;
        const totalSpendChange = (totalPrevDaily !== null && totalPrevDaily > 0)
          ? Math.round(((totalCurrDaily - totalPrevDaily) / totalPrevDaily) * 1000) / 10 
          : null;

        const rawProjects = Array.isArray(ceDoc.projectSummary) ? ceDoc.projectSummary : [];
        const projectSummary = rawProjects.map((p: any) => {
          const pName = p.projectName || p.project_name || 'Untagged';
          const prevP = hasPrev ? prevProjects.find((pp: any) => (pp.projectName || pp.project_name) === pName) : null;
          const cost = Number(p.unblendedCost || 0);
          const prevCost = hasPrev ? Number(prevP?.unblendedCost || 0) : null;
          const currDaily = cost / Math.max(1, daysCount);
          const prevDaily = (prevCost !== null) ? prevCost / Math.max(1, prevDaysCount) : null;
          const projChange = (prevDaily !== null && prevDaily > 0)
            ? Math.round(((currDaily - prevDaily) / prevDaily) * 1000) / 10 
            : null;

          const pServices = Array.isArray(p.services) ? p.services : [];
          const enrichedServices = pServices.map((s: any) => {
            const prevS = prevP?.services?.find((ps: any) => ps.service === s.service);
            const sCost = Number(s.unblendedCost || 0);
            const sPrevCost = hasPrev ? Number(prevS?.unblendedCost || 0) : null;
            const sCurrDaily = sCost / Math.max(1, daysCount);
            const sPrevDaily = (sPrevCost !== null) ? sPrevCost / Math.max(1, prevDaysCount) : null;
            const sChange = (sPrevDaily !== null && sPrevDaily > 0)
              ? Math.round(((sCurrDaily - sPrevDaily) / sPrevDaily) * 1000) / 10
              : null;
            return { ...s, unblendedCost: sCost, prevCost: sPrevCost, change: sChange };
          });

          return { ...p, projectName: pName, unblendedCost: cost, prevCost, change: projChange, services: enrichedServices };
        });

        const services = rawServices.map((s: any) => {
          const prevS = hasPrev ? prevServices.find((ps: any) => ps.service === s.service) : null;
          const cost = Number(s.unblendedCost || 0);
          const prevCost = hasPrev ? Number(prevS?.unblendedCost || 0) : null;
          const currDaily = cost / Math.max(1, daysCount);
          const prevDaily = (prevCost !== null) ? prevCost / Math.max(1, prevDaysCount) : null;
          const change = (prevDaily !== null && prevDaily > 0)
            ? Math.round(((currDaily - prevDaily) / prevDaily) * 1000) / 10 
            : null;
          return { ...s, unblendedCost: cost, prevCost, change };
        });

        const topService = services[0] || null;
        const topServiceCost = topService ? Number(topService.unblendedCost || 0) : 0;
        const topServiceShare = totalSpend > 0 ? Number(((topServiceCost / totalSpend) * 100).toFixed(1)) : 0;

        const untaggedItem = projectSummary.find((p: any) => (p.projectName || p.project_name) === 'Untagged');
        const untaggedSpend = untaggedItem ? Number(untaggedItem.unblendedCost || 0) : 0;
        const taggedSpend = Number(Math.max(0, totalSpend - untaggedSpend).toFixed(2));
        const tagCoveragePercentage = totalSpend > 0 ? Number(((taggedSpend / totalSpend) * 100).toFixed(1)) : 0;

        const topProject = projectSummary[0] ? {
          name: projectSummary[0].projectName || projectSummary[0].project_name,
          cost: Number(projectSummary[0].unblendedCost || 0),
          share: totalSpend > 0 ? Number(((Number(projectSummary[0].unblendedCost || 0) / totalSpend) * 100).toFixed(1)) : 0,
        } : null;

        // Build matrix if missing
        let normalizedMatrix = ceDoc.matrix;
        if (!normalizedMatrix || !Array.isArray(normalizedMatrix.rows) || normalizedMatrix.rows.length === 0) {
          const matrixServices = services.map((s: any) => s.service);
          const matrixRows = projectSummary.map((p: any) => {
            const pName = p.projectName || p.project_name || 'Untagged';
            const serviceCosts: Record<string, number> = {};
            if (Array.isArray(p.services)) {
              p.services.forEach((s: any) => {
                serviceCosts[s.service] = Number(s.unblendedCost || 0);
              });
            }
            return {
              productId: pName,
              productName: pName,
              project: pName,
              projectName: pName,
              project_name: pName,
              services: serviceCosts,
              serviceCosts,
              total: Number(p.unblendedCost || 0),
              totalCost: Number(p.unblendedCost || 0),
              prevCost: p.prevCost || 0,
              change: p.change || 0,
            };
          });
          normalizedMatrix = { services: matrixServices, rows: matrixRows };
        }

        const topCostDrivers = (ceDoc.topCostDrivers && ceDoc.topCostDrivers.length > 0)
          ? ceDoc.topCostDrivers
          : projectSummary.slice(0, 5).map((p: any) => ({
              name: p.projectName || p.project_name,
              cost: Number(p.unblendedCost || 0),
              share: totalSpend > 0 ? Number(((Number(p.unblendedCost || 0) / totalSpend) * 100).toFixed(1)) : 0,
            }));

        const kpis = {
          totalSpend,
          totalAmortized,
          currency: ceDoc.summary?.currency || 'USD',
          dailyAvg,
          daysCount,
          projectsCount: projectSummary.length,
          servicesCount: services.length,
          taggedSpend,
          untaggedSpend,
          tagCoveragePercentage,
          prevTotalSpend,
          totalSpendChange,
          previousBillingPeriod: prevDoc?.billingPeriod || '2026-09',
          topProject,
          topService: {
            name: topService?.service || 'None',
            cost: topServiceCost,
            share: topServiceShare,
          },
        };

        return {
          success: true,
          source: 'mongodb_direct',
          accountId: ceDoc.accountId || connection?.awsAccountId || '864981730114',
          accountName: ceDoc.accountName || connection?.connectionName || 'Production AWS Account',
          billingPeriod: ceDoc.billingPeriod || '2026-09',
          previousBillingPeriod: prevDoc?.billingPeriod || '2026-09',
          timePeriod: ceDoc.timePeriod || { start: '2026-09-01', end: '2026-10-01' },
          availableBillingPeriods: distinctPeriods,
          kpis,
          totalSpend,
          totalAmortized,
          prevTotalSpend,
          totalSpendChange,
          currency: ceDoc.summary?.currency || 'USD',
          dailyAvg,
          daysCount,
          topService: kpis.topService,
          topProject,
          servicesCount: services.length,
          services,
          serviceSummary: services,
          dailyTotals,
          dailyTimeline: dailyTotals,
          serviceWiseDaily,
          projects: projectSummary,
          projectSummary,
          matrix: normalizedMatrix,
          topCostDrivers,
          curDetails: ceDoc.curDetails || null,
          tagDimension: ceDoc.tagDimension || 'project_name',
          taggedSpend,
          untaggedSpend,
          tagCoveragePercentage,
          projectsCount: projectSummary.length,
          fetchedAt: ceDoc.fetchedAt || connection?.lastCostExplorerSyncedAt,
          connection: {
            connectionId: connection?.connectionId,
            status: connection?.status || 'connected',
            roleArn: connection?.roleArn,
            region: connection?.region || 'us-east-1',
            lastSyncDate: connection?.lastCostExplorerSyncDate,
            lastSyncedAt: connection?.lastCostExplorerSyncedAt,
          },
        };
      };

      // 1. Primary: Try calling the production AgentBuilder Workflow first
      const WORKFLOW_PROD_URL =
        'https://api.agents.snsihub.ai/webhook/7c53bda3-c369-4e08-bb54-c645901b89c2';

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const workflowUrlWithQuery = requestedBillingPeriod
          ? `${WORKFLOW_PROD_URL}?billingPeriod=${encodeURIComponent(requestedBillingPeriod)}`
          : WORKFLOW_PROD_URL;

        const workflowRes = await fetch(workflowUrlWithQuery, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            trigger: 'nextjs_dashboard', 
            billingPeriod: requestedBillingPeriod || undefined,
            timestamp: new Date().toISOString() 
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (workflowRes.ok) {
          const raw = await workflowRes.json();
          const data = raw._responseData || raw;

          // Only accept workflow response if it matches requested period (or if no period requested)
          const matchesPeriod = !requestedBillingPeriod || data.billingPeriod === requestedBillingPeriod;

          if (matchesPeriod && data && (data.success || data.kpis || data.totalSpend)) {
            // Normalize matrix rows so all UI consumers receive standard fields
            let normalizedMatrix = data.matrix;
            if (normalizedMatrix && Array.isArray(normalizedMatrix.rows)) {
              normalizedMatrix = {
                ...normalizedMatrix,
                rows: normalizedMatrix.rows.map((r: any) => {
                  const pName = r.productName || r.project || r.projectName || r.project_name || 'Untagged';
                  const sMap = r.services || r.serviceCosts || {};
                  return {
                    ...r,
                    productId: r.productId || pName,
                    productName: pName,
                    project: pName,
                    projectName: pName,
                    project_name: pName,
                    services: sMap,
                    serviceCosts: sMap,
                    total: Number(r.totalCost ?? r.total ?? 0),
                    totalCost: Number(r.totalCost ?? r.total ?? 0),
                  };
                }),
              };
            }

            return NextResponse.json({
              ...data,
              success: true,
              source: 'agentbuilder_workflow',
              availableBillingPeriods: distinctPeriods,
              kpis: data.kpis,
              totalSpend: data.kpis?.totalSpend ?? data.totalSpend,
              totalAmortized: data.kpis?.totalAmortized ?? data.totalSpend,
              prevTotalSpend: data.prevTotalSpend ?? data.kpis?.prevTotalSpend,
              totalSpendChange: data.totalSpendChange ?? data.kpis?.totalSpendChange,
              dailyAvg: data.kpis?.dailyAvg,
              daysCount: data.kpis?.daysCount,
              projectsCount: data.kpis?.projectsCount ?? (data.projects?.length || 0),
              servicesCount: data.kpis?.servicesCount ?? (data.services?.length || 0),
              taggedSpend: data.kpis?.taggedSpend,
              untaggedSpend: data.kpis?.untaggedSpend,
              tagCoveragePercentage: data.kpis?.tagCoveragePercentage,
              topProject: data.kpis?.topProject,
              topService: data.kpis?.topService,
              projects: data.projects,
              projectSummary: data.projects || data.projectSummary,
              services: data.services,
              serviceSummary: data.services || data.serviceSummary,
              matrix: normalizedMatrix,
              dailyTotals: data.dailyTimeline || data.dailyTotals,
              dailyTimeline: data.dailyTimeline,
              topCostDrivers: (data.topCostDrivers && data.topCostDrivers.length > 0)
                ? data.topCostDrivers
                : (data.projects || []).slice(0, 5).map((p: any) => ({
                    name: p.projectName || p.project_name,
                    cost: Number(p.unblendedCost || 0),
                    share: (data.kpis?.totalSpend || data.totalSpend) > 0 
                      ? Number(((Number(p.unblendedCost || 0) / (data.kpis?.totalSpend || data.totalSpend)) * 100).toFixed(1)) 
                      : 0,
                  })),
              curDetails: data.curDetails,
              fetchedAt: data.fetchedAt || new Date().toISOString(),
            });
          }
        }
      } catch (wfErr) {
        console.warn('AgentBuilder workflow call failed or timed out, falling back to MongoDB:', wfErr);
      }

      // 3. Direct MongoDB fallback (retrieve requested or latest document)
      const query: any = requestedBillingPeriod ? { billingPeriod: requestedBillingPeriod } : {};
      let ceDoc = await ceCol.findOne(query, { sort: { fetchedAt: -1, _id: -1 } });

      if (!ceDoc && requestedBillingPeriod) {
        // Fallback to latest available if requested month is not found
        ceDoc = await ceCol.findOne({}, { sort: { fetchedAt: -1, _id: -1 } });
      }

      if (!ceDoc) {
        return NextResponse.json({
          success: false,
          message: 'No AWS Cost Explorer data found in MongoDB',
          totalSpend: 0,
          services: [],
          dailyTotals: [],
          projects: [],
          availableBillingPeriods: distinctPeriods,
        });
      }

      let prevDoc = null;
      if (ceDoc?.billingPeriod && /^\d{4}-\d{2}$/.test(ceDoc.billingPeriod)) {
        const [currY, currM] = ceDoc.billingPeriod.split('-').map(Number);
        const prevDate = new Date(currY, currM - 2, 1);
        const prevPeriodStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
        prevDoc = await ceCol.findOne({ billingPeriod: prevPeriodStr });
      }

      return NextResponse.json(formatCeDoc(ceDoc, prevDoc));
    }

    let query: any = {};
    if (connectionId && awsAccountId) {
      query = {
        $or: [{ connectionId }, { awsAccountId }],
      };
    } else if (connectionId) {
      query = { connectionId };
    } else if (awsAccountId) {
      query = { awsAccountId };
    }

    let doc = await collection.findOne(query, {
      sort: { updatedAt: -1, _id: -1 },
    });

    if (!doc && DB_NAME !== 'finops_2') {
      try {
        const fallbackCol = client.db('finops_2').collection(COLLECTION_NAME);
        doc = await fallbackCol.findOne(query, {
          sort: { updatedAt: -1, _id: -1 },
        });
      } catch (e) {}
    }

    if (Object.keys(query).length > 0) {
      if (!doc) {
        return NextResponse.json(
          {
            success: false,
            message: 'No connection record found for given ID/Account.',
            connection: null,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        connection: doc,
      });
    }

    // Otherwise return list of connections
    let connections = await collection
      .find({})
      .sort({ updatedAt: -1, _id: -1 })
      .limit(10)
      .toArray();

    if ((!connections || connections.length === 0) && DB_NAME !== 'finops_2') {
      try {
        const fallbackCol = client.db('finops_2').collection(COLLECTION_NAME);
        connections = await fallbackCol
          .find({})
          .sort({ updatedAt: -1, _id: -1 })
          .limit(10)
          .toArray();
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      connections: connections || [],
    });
  } catch (error: any) {
    console.error('Error fetching live AWS connections from MongoDB:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Database query error',
        connections: [],
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    const awsAccountId = searchParams.get('awsAccountId');

    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    let query: any = {};
    if (connectionId && awsAccountId) {
      query = {
        $or: [{ connectionId }, { awsAccountId }],
      };
    } else if (connectionId) {
      query = { connectionId };
    } else if (awsAccountId) {
      query = { awsAccountId };
    }

    if (Object.keys(query).length > 0) {
      const result = await collection.deleteMany(query);
      return NextResponse.json({
        success: true,
        message: 'Connection disconnected and removed from MongoDB.',
        deletedCount: result.deletedCount,
      });
    }

    // If no query parameters provided, delete all connections
    const result = await collection.deleteMany({});
    return NextResponse.json({
      success: true,
      message: 'All AWS connections disconnected and removed.',
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Error disconnecting AWS connection from MongoDB:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to disconnect from database',
      },
      { status: 500 }
    );
  }
}
