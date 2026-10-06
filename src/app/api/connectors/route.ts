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
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    let connections = await collection
      .find({})
      .sort({ updatedAt: -1, _id: -1 })
      .limit(20)
      .toArray();

    if ((!connections || connections.length === 0) && DB_NAME !== 'finops_2') {
      try {
        const fallbackCol = client.db('finops_2').collection(COLLECTION_NAME);
        connections = await fallbackCol
          .find({})
          .sort({ updatedAt: -1, _id: -1 })
          .limit(20)
          .toArray();
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      connections: connections || [],
    });
  } catch (error: any) {
    console.error('Error fetching connectors:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to fetch connectors',
        connections: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'Acknowledged' });
}
