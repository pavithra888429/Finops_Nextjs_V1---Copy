const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

async function test() {
  const client = await MongoClient.connect(uri);
  const db = client.db('finops_3');

  // Test slice 1: 0..12000
  const b1 = await db.collection('finopscostrecords').findOne(
    { billingPeriod: '2026-09' },
    { projection: { billingPeriod: 1, records: { $slice: [0, 12000] } } }
  );
  console.log('Batch 1 count:', b1?.records?.length, 'Size (KB):', (JSON.stringify(b1).length / 1024).toFixed(1));

  // Test slice 2: 12000..12000
  const b2 = await db.collection('finopscostrecords').findOne(
    { billingPeriod: '2026-09' },
    { projection: { billingPeriod: 1, records: { $slice: [12000, 12000] } } }
  );
  console.log('Batch 2 count:', b2?.records?.length, 'Size (KB):', (JSON.stringify(b2).length / 1024).toFixed(1));

  // Test slice 3: 24000..12000
  const b3 = await db.collection('finopscostrecords').findOne(
    { billingPeriod: '2026-09' },
    { projection: { billingPeriod: 1, records: { $slice: [24000, 12000] } } }
  );
  console.log('Batch 3 count:', b3?.records?.length, 'Size (KB):', (JSON.stringify(b3).length / 1024).toFixed(1));

  await client.close();
}
test().catch(console.error);
