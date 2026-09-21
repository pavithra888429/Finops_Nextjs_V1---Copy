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
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = body.apiKey || process.env.OPENROUTER_API_KEY;
    const userId = body.userId || 'default_user';
    const connectionId = body.connectionId || body.connectionName || 'Production OpenRouter';
    const connectionName = body.connectionName || 'Production OpenRouter';
    const productTag = (body.productTag || 'SHARED_GATEWAY').toUpperCase();
    const environment = (body.environment || 'production').toLowerCase();

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key is required' }, { status: 400 });
    }

    // 1. Fetch Workspace Keys from OpenRouter Management API
    let keysRes: any = null;
    try {
      const kFetch = await fetch('https://openrouter.ai/api/v1/keys', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (kFetch.ok) {
        keysRes = await kFetch.json();
      }
    } catch (e) {
      console.warn('OpenRouter keys direct fetch warning:', e);
    }

    const rawKeys: any[] = keysRes?.data || [];
    let totalLifetimeSpend = 0;
    let totalLimit = 0;
    let hasLimit = false;
    let totalRemaining = 0;

    const keyMap: Record<string, any> = {};
    const cleanedKeys = rawKeys.map((k: any, idx: number) => {
      const usage = Number(k.usage) || 0;
      const limit = typeof k.limit === 'number' ? Number(k.limit) : null;
      const remaining = typeof k.limit_remaining === 'number'
        ? Number(k.limit_remaining)
        : (limit !== null ? Math.max(0, limit - usage) : null);

      totalLifetimeSpend += usage;
      if (limit !== null) {
        totalLimit += limit;
        hasLimit = true;
      }
      if (remaining !== null) {
        totalRemaining += remaining;
      }

      const item = {
        keyId: k.hash || k.id || `key_${idx + 1}`,
        name: (k.name || k.label || `Key ${idx + 1}`).trim(),
        label: (k.label || '').trim(),
        createdAt: k.created_at || new Date().toISOString(),
        usage: Number(usage.toFixed(4)),
        usageDaily: Number((k.usage_daily || 0).toFixed(4)),
        usageWeekly: Number((k.usage_weekly || 0).toFixed(4)),
        usageMonthly: Number((k.usage_monthly || 0).toFixed(4)),
        limit: limit !== null ? Number(limit.toFixed(2)) : null,
        remaining: remaining !== null ? Number(remaining.toFixed(2)) : null,
        disabled: Boolean(k.disabled),
        workspaceId: k.workspace_id || null,
        environment,
        productTag,
      };

      if (item.keyId) keyMap[item.keyId] = item;
      if (item.name) keyMap[item.name] = item;
      if (item.label) keyMap[item.label] = item;
      return item;
    });

    // 2. Fetch Analytics Models breakdown from OpenRouter
    let modelsRes: any = null;
    try {
      const mFetch = await fetch('https://openrouter.ai/api/v1/analytics/query', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dimensions: ['model', 'api_key_id'],
          metrics: ['total_usage', 'request_count', 'tokens_prompt', 'tokens_completion'],
        }),
      });
      if (mFetch.ok) {
        modelsRes = await mFetch.json();
      }
    } catch (e) {
      console.warn('OpenRouter analytics direct fetch warning:', e);
    }

    const rawModels: any[] = modelsRes?.data?.data || modelsRes?.data || [];
    const topModelsBySpend = rawModels.map((m: any) => {
      const cost = Number(m.total_usage) || 0;
      const apiKeyId = m.api_key_id ? String(m.api_key_id).trim() : null;
      const matchedKey = apiKeyId && keyMap[apiKeyId] ? keyMap[apiKeyId] : null;
      const provider = m.model && m.model.includes('/') ? m.model.split('/')[0] : 'OpenRouter';

      return {
        model: m.model,
        name: m.model,
        provider: provider.charAt(0).toUpperCase() + provider.slice(1),
        apiKeyId,
        keyName: matchedKey ? matchedKey.name : (apiKeyId || 'Default Key'),
        keyLabel: matchedKey ? matchedKey.label : '',
        cost: Number(cost.toFixed(4)),
        requests: Number(m.request_count) || 0,
        promptTokens: Number(m.tokens_prompt) || 0,
        completionTokens: Number(m.tokens_completion) || 0,
        totalTokens: (Number(m.tokens_prompt) || 0) + (Number(m.tokens_completion) || 0),
      };
    }).sort((a: any, b: any) => b.cost - a.cost);

    // 3. Generate FOCUS 1.0 MongoDB Records and Persist
    const nowStr = new Date().toISOString();
    const todayDate = nowStr.split('T')[0];
    const billingPeriod = todayDate.substring(0, 7);

    const focusRecords = topModelsBySpend.length > 0
      ? topModelsBySpend.map((m: any, idx: number) => ({
          date: todayDate,
          service: `OpenRouter - ${m.model}`,
          userId,
          connectionId,
          operation: 'OpenRouterGatewaySync',
          accountId: 'openrouter-workspace',
          accountName: connectionName,
          amortizedCost: m.cost,
          billingPeriod,
          blendedCost: m.cost,
          chargeDescription: `OpenRouter Inference - ${m.model} (${m.keyName})`,
          chargeType: 'Usage',
          netAmortizedCost: m.cost,
          netCost: m.cost,
          unblendedCost: m.cost,
          originalId: null,
          pricingCurrency: 'USD',
          pricingUnit: 'Tokens',
          region: 'global',
          resourceId: m.apiKeyId || `model_${idx}`,
          tags: {
            Project: productTag,
            Environment: environment,
            Model: m.model,
            Provider: m.provider,
            KeyName: m.keyName,
            KeyId: m.apiKeyId || '',
          },
          createdAt: nowStr,
          updatedAt: nowStr,
          ChargePeriodStart: todayDate,
          ChargePeriodEnd: nowStr,
          ProviderName: 'OpenRouter',
          ServiceName: 'OpenRouter AI Gateway',
          SubServiceName: m.model,
          BilledCost: m.cost,
          EffectiveCost: m.cost,
        }))
      : cleanedKeys.map((k: any) => ({
          date: (k.createdAt || nowStr).split('T')[0],
          service: `OpenRouter - ${k.name}`,
          userId,
          connectionId,
          operation: 'OpenRouterGatewaySync',
          accountId: k.workspaceId || 'openrouter-workspace',
          accountName: connectionName,
          amortizedCost: k.usage,
          billingPeriod: (k.createdAt || nowStr).split('T')[0].substring(0, 7),
          blendedCost: k.usage,
          chargeDescription: `OpenRouter Key Inference - ${k.name}`,
          chargeType: 'Usage',
          netAmortizedCost: k.usage,
          netCost: k.usage,
          unblendedCost: k.usage,
          originalId: null,
          pricingCurrency: 'USD',
          pricingUnit: 'Tokens',
          region: 'global',
          resourceId: k.keyId,
          tags: {
            Project: productTag,
            Environment: environment,
            KeyLabel: k.label,
            Provider: 'OpenRouter',
          },
          createdAt: nowStr,
          updatedAt: nowStr,
          ChargePeriodStart: k.createdAt,
          ChargePeriodEnd: nowStr,
          ProviderName: 'OpenRouter',
          ServiceName: 'OpenRouter AI Gateway',
          SubServiceName: k.name,
          BilledCost: k.usage,
          EffectiveCost: k.usage,
        }));

    // Save to MongoDB finops_3
    try {
      const client = await getMongoClient();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_NAME);

      const bulkOps = focusRecords.map((doc: any) => ({
        updateOne: {
          filter: { userId: doc.userId, resourceId: doc.resourceId, service: doc.service },
          update: {
            $set: { ...doc, keysList: cleanedKeys, topModelsBySpend, totalUsage: Number(totalLifetimeSpend.toFixed(4)), creditLimit: hasLimit ? Number(totalLimit.toFixed(2)) : null, remainingBalance: hasLimit ? Number(totalRemaining.toFixed(2)) : null },
            $setOnInsert: { createdAt: doc.createdAt },
          },
          upsert: true,
        },
      }));

      if (bulkOps.length > 0) {
        await collection.bulkWrite(bulkOps);
      }
    } catch (dbError) {
      console.warn('MongoDB direct upsert notice:', dbError);
    }

    return NextResponse.json({
      success: true,
      userId,
      connectionId,
      connectionName,
      productTag,
      environment,
      totalUsage: Number(totalLifetimeSpend.toFixed(4)),
      creditLimit: hasLimit ? Number(totalLimit.toFixed(2)) : null,
      remainingBalance: hasLimit ? Number(totalRemaining.toFixed(2)) : null,
      keysCount: cleanedKeys.length,
      modelsCount: topModelsBySpend.length,
      recordsIngested: focusRecords.length,
      keysList: cleanedKeys,
      topModelsBySpend,
      focusRecords,
      lastSyncedAt: nowStr,
    });
  } catch (err: any) {
    console.error('API /api/finops/openrouter POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to ingest OpenRouter data' },
      { status: 500 }
    );
  }
}
