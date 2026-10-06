const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('finops_3');
  
  const res = await db.collection('awsconnections').updateOne(
    { awsAccountId: '864981730114' },
    {
      $set: {
        syncStatus: 'synced',
        recordsProcessed: 33437,
        lastSyncedAt: new Date().toISOString(),
        lastSyncedFile: 'daily-cur-export/daily-cur-export/data/BILLING_PERIOD=2026-09/daily-cur-export-00001.snappy.parquet'
      }
    }
  );
  console.log('Update result:', res);
  
  const conn = await db.collection('awsconnections').findOne({ awsAccountId: '864981730114' });
  console.log('Connection in DB:', {
    awsAccountId: conn.awsAccountId,
    recordsProcessed: conn.recordsProcessed,
    syncStatus: conn.syncStatus,
    lastSyncedAt: conn.lastSyncedAt,
    lastSyncedFile: conn.lastSyncedFile
  });
  
  await client.close();
}

main().catch(console.error);
