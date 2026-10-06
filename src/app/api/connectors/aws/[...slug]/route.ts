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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const connectionId = slug?.[0];

  try {
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const doc = await collection.findOne(
      { connectionId },
      { sort: { updatedAt: -1, _id: -1 } }
    );

    return NextResponse.json({
      success: true,
      connection: doc,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const connectionId = slug?.[0];
  const action = slug?.[1];

  try {
    const body = await request.json().catch(() => ({}));
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    if (action === 'cloudformation' || slug?.includes('confirm')) {
      await collection.updateOne(
        { connectionId },
        {
          $set: {
            userConfirmed: true,
            userConfirmedAt: new Date().toISOString(),
            status: 'verification_pending',
          },
        }
      );
    }

    if (action === 'sync') {
      const now = new Date().toISOString();
      const existing = await collection.findOne({ connectionId });
      const awsAccountId = body?.awsAccountId || existing?.awsAccountId;

      // Update attempt timestamp
      await collection.updateOne(
        { connectionId },
        {
          $set: {
            lastSyncAttempt: now,
            syncStatus: 'syncing',
          },
        }
      );

      const webhookUrl =
        process.env.NEXT_PUBLIC_AWS_CUR_INGESTION_WEBHOOK_URL ||
        'https://api.agents.snsihub.ai/webhook/2384b920-a830-48b2-8388-8a0031f5171c';

      let webhookData: any = null;
      try {
        const fetchRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connectionId,
            awsAccountId,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (fetchRes.ok) {
          webhookData = await fetchRes.json().catch(() => null);
        }
      } catch (err: any) {
        console.warn('[AWS Sync Route] Webhook upstream note:', err.message);
      }

      // Re-fetch latest connection from DB
      const updated = await collection.findOne({ connectionId });

      return NextResponse.json({
        success: true,
        connectionId,
        action: 'sync',
        syncStatus: updated?.syncStatus || 'pending_aws_export',
        recordsProcessed: updated?.recordsProcessed || 0,
        connection: updated,
        upstream: webhookData,
      });
    }

    if (action === 'cost-explorer-sync' || action === 'sync-cost-explorer') {
      const now = new Date().toISOString();
      const existing = await collection.findOne({ connectionId });
      const awsAccountId = body?.awsAccountId || existing?.awsAccountId;
      const force = Boolean(body?.force || false);

      await collection.updateOne(
        { connectionId },
        {
          $set: {
            lastCostExplorerSyncAttempt: now,
          },
        }
      );

      const webhookUrl =
        process.env.NEXT_PUBLIC_AWS_COST_EXPLORER_WEBHOOK_URL ||
        'https://api.agents.snsihub.ai/webhook/5f28a43e-4f27-4a2a-9516-c0dc10196038';

      let webhookData: any = null;
      try {
        const fetchRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connectionId,
            awsAccountId,
            force,
          }),
          signal: AbortSignal.timeout(35000),
        });

        if (fetchRes.ok) {
          webhookData = await fetchRes.json().catch(() => null);
        }
      } catch (err: any) {
        console.warn('[AWS Cost Explorer Sync Route] Webhook upstream note:', err.message);
      }

      const updated = await collection.findOne({ connectionId });

      return NextResponse.json({
        success: true,
        connectionId,
        action: 'cost-explorer-sync',
        lastCostExplorerSyncDate: updated?.lastCostExplorerSyncDate,
        totalSpend: updated?.totalSpend,
        connection: updated,
        upstream: webhookData,
      });
    }

    return NextResponse.json({
      success: true,
      connectionId,
      action,
      acknowledged: true,
    });
  } catch (error: any) {
    return NextResponse.json({ success: true, fallback: true });
  }
}
