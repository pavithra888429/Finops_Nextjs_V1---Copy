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
      .sort({ updatedAt: -1 })
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

    // The workflow now stores ONE document per userId with all arrays embedded
    const firstWithMeta = docs.find((d: any) => d.topModelsBySpend && Array.isArray(d.topModelsBySpend) && d.topModelsBySpend.length > 0)
      || docs[0];

    // Read embedded arrays directly from the single document
    const rawTopModels: any[] = firstWithMeta?.topModelsBySpend || [];
    const totalUsage = Number(firstWithMeta?.totalUsage || 0);
    const creditLimit = typeof firstWithMeta?.creditLimit === 'number' ? firstWithMeta.creditLimit : null;
    const remainingBalance = typeof firstWithMeta?.remainingBalance === 'number' ? firstWithMeta.remainingBalance : null;

    // Build keysList by grouping topModelsBySpend by keyName
    // (keysList stored in workflow is the raw API keys — may be empty if analytics path taken)
    let keysList: any[] = [];
    const storedKeysList = firstWithMeta?.keysList;
    if (storedKeysList && Array.isArray(storedKeysList) && storedKeysList.length > 0) {
      keysList = storedKeysList.filter((k: any) => {
        const isInactive = k.isActive === false;
        const isDeletedLabel = typeof k.label === 'string' && k.label.toLowerCase().includes('deleted');
        return !isInactive && !isDeletedLabel;
      });
    } else if (rawTopModels.length > 0) {
      // Reconstruct key list by grouping models by their parent API key
      const keyMap: Record<string, any> = {};
      for (const m of rawTopModels) {
        const keyName = m.keyName || 'Unknown Key';
        if (!keyMap[keyName]) {
          keyMap[keyName] = {
            keyId: m.apiKeyId || keyName,
            name: keyName,
            label: m.keyLabel || '',
            usage: 0,
            limit: null,
            remaining: null,
            createdAt: firstWithMeta?.lastSyncedAt || new Date().toISOString(),
            environment: firstWithMeta?.environment || 'production',
            productTag: firstWithMeta?.productTag || 'SHARED_GATEWAY',
            models: [],
          };
        }
        keyMap[keyName].usage = Number((keyMap[keyName].usage + (m.cost || 0)).toFixed(4));
        if (m.model && !keyMap[keyName].models.includes(m.model)) {
          keyMap[keyName].models.push(m.model);
        }
      }
      keysList = Object.values(keyMap).sort((a: any, b: any) => b.usage - a.usage);
    }

    const activeNames = new Set(keysList.map((k: any) => (k.name || '').trim().toLowerCase()));
    const activeLabels = new Set(keysList.map((k: any) => (k.label || '').trim().toLowerCase()).filter(Boolean));
    const activeIds = new Set(keysList.map((k: any) => (k.keyId || '').trim().toLowerCase()).filter(Boolean));

    const isFromActiveKey = (r: any) => {
      if (keysList.length === 0) return true;
      const kn = (r.keyName || r.name || r.key || '').trim().toLowerCase();
      const kl = (r.keyLabel || r.label || '').trim().toLowerCase();
      const kid = (r.apiKeyId || r.keyId || '').trim().toLowerCase();
      return (
        (kn && activeNames.has(kn)) ||
        (kl && activeLabels.has(kl)) ||
        (kid && activeIds.has(kid)) ||
        (kn && activeLabels.has(kn)) ||
        (kl && activeNames.has(kl))
      );
    };

    const topModelsBySpend = rawTopModels.filter(isFromActiveKey);
    const dateWiseTelemetry = (firstWithMeta?.dateWiseTelemetry || []).filter(isFromActiveKey);

    return NextResponse.json({
      success: true,
      connectionId: firstWithMeta?.connectionId || 'Production OpenRouter',
      connectionName: firstWithMeta?.connectionName || 'Production OpenRouter',
      productTag: firstWithMeta?.productTag || 'SHARED_GATEWAY',
      environment: firstWithMeta?.environment || 'production',
      totalUsage,
      creditLimit,
      remainingBalance,
      recordsIngested: firstWithMeta?.recordsIngested || topModelsBySpend.length,
      keysList,
      topModelsBySpend,
      dateWiseTelemetry,
      focusRecords: firstWithMeta?.focusRecords || [],
      lastSyncedAt: firstWithMeta?.lastSyncedAt || new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('API /api/finops/openrouter error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to query OpenRouter data' },
      { status: 500 }
    );
  }
}
