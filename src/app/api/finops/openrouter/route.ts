import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';
const DB_NAME = process.env.MONGODB_DB || 'finops_3';
const COLLECTION_NAME = 'finops_3';

let cachedClient: MongoClient | null = null;

async function getMongoClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient;
}

export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const docs = await collection
      .find({
        $or: [
          { operation: 'OpenRouterGatewaySync' },
          { ProviderName: 'OpenRouter' },
          { 'tags.Provider': 'OpenRouter' },
        ],
      })
      .sort({ amortizedCost: -1 })
      .toArray();

    if (!docs || docs.length === 0) {
      return NextResponse.json({
        success: true,
        connectionId: 'Production OpenRouter',
        totalUsage: 0,
        creditLimit: null,
        remainingBalance: null,
        recordsIngested: 0,
        keysList: [],
        topModelsBySpend: [],
        dateWiseTelemetry: [],
      });
    }

    // Extract the embedded summary metadata if present in documents[0] or compile directly
    const firstWithMeta = docs.find((d: any) => d.keysList && d.keysList.length > 0);

    const keysList = firstWithMeta?.keysList || docs.map((d: any, idx: number) => ({
      keyId: d.resourceId || `key_${idx + 1}`,
      name: d.SubServiceName || (d.service ? d.service.replace('OpenRouter - ', '') : `Key ${idx + 1}`),
      label: d.tags?.KeyLabel || '',
      usage: Number(d.amortizedCost || d.unblendedCost || 0),
      limit: null,
      remaining: null,
      createdAt: d.ChargePeriodStart || d.date || d.createdAt,
      environment: d.tags?.Environment || 'production',
      productTag: d.tags?.Project || 'SHARED_GATEWAY',
    }));

    const totalUsage = firstWithMeta?.totalUsage !== undefined
      ? Number(firstWithMeta.totalUsage)
      : Number(docs.reduce((acc: number, d: any) => acc + (Number(d.amortizedCost) || 0), 0).toFixed(4));

    const creditLimit = typeof firstWithMeta?.creditLimit === 'number'
      ? firstWithMeta.creditLimit
      : Number(keysList.reduce((acc: number, k: any) => acc + (Number(k.limit) || 0), 0).toFixed(2));

    const remainingBalance = typeof firstWithMeta?.remainingBalance === 'number'
      ? firstWithMeta.remainingBalance
      : Number(keysList.reduce((acc: number, k: any) => acc + (Number(k.remaining) || 0), 0).toFixed(2));

    const topModelsBySpend = firstWithMeta?.topModelsBySpend || keysList
      .map((k: any) => ({
        name: k.name,
        provider: 'OpenRouter',
        label: k.label,
        cost: Number(k.usage || 0),
        share: totalUsage > 0 ? Number(((Number(k.usage || 0) / totalUsage) * 100).toFixed(1)) : 0,
        dailyCost: Number(k.usageDaily || 0),
        weeklyCost: Number(k.usageWeekly || 0),
        monthlyCost: Number(k.usageMonthly || 0),
        limit: k.limit,
        remaining: k.remaining,
        createdAt: k.createdAt,
      }))
      .sort((a: any, b: any) => b.cost - a.cost);

    const dateWiseTelemetry = firstWithMeta?.dateWiseTelemetry || docs.map((d: any) => ({
      id: `telemetry_${d.resourceId || d._id}`,
      date: d.date,
      keyName: d.SubServiceName || (d.service ? d.service.replace('OpenRouter - ', '') : 'API Key'),
      keyLabel: d.tags?.KeyLabel || '',
      app: d.tags?.Project || 'SHARED_GATEWAY',
      model: '',
      cost: Number(d.amortizedCost || 0),
      dailyCost: 0,
      weeklyCost: 0,
      monthlyCost: 0,
      environment: d.tags?.Environment || 'production',
    }));

    return NextResponse.json({
      success: true,
      connectionId: docs[0]?.connectionId || 'Production OpenRouter',
      connectionName: docs[0]?.accountName || 'Production OpenRouter',
      productTag: docs[0]?.tags?.Project || 'SHARED_GATEWAY',
      environment: docs[0]?.tags?.Environment || 'production',
      totalUsage,
      creditLimit,
      remainingBalance,
      recordsIngested: keysList.length,
      keysList,
      topModelsBySpend,
      dateWiseTelemetry,
      focusRecords: docs,
      lastSyncedAt: docs[0]?.updatedAt || new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('API /api/finops/openrouter error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to query OpenRouter data' },
      { status: 500 }
    );
  }
}
