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
        lastSyncedFile: '',
        syncStatus: 'pending_aws_export',
        recordsProcessed: 0
      } 
    }
  );
  console.log('Reset result:', res);
  
  const doc = await db.collection('awsconnections').findOne({ awsAccountId: '864981730114' });
  console.log('New state in DB:', {
    awsAccountId: doc.awsAccountId,
    lastSyncedFile: doc.lastSyncedFile,
    syncStatus: doc.syncStatus,
    recordsProcessed: doc.recordsProcessed
  });
  
  await client.close();
}

main().catch(console.error);
