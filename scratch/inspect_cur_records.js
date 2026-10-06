const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

async function main() {
  const client = await MongoClient.connect(uri);
  const db = client.db('finops_3');
  const cols = await db.listCollections().toArray();
  console.log('Collections:', cols.map(c => c.name));

  const curDocs = await db.collection('finopscostrecords').find({}, { projection: { records: 0 } }).toArray();
  console.log('finopscostrecords (without records):', curDocs);

  for (const doc of curDocs) {
    console.log('Billing period:', doc.billingPeriod, 'FetchedAt:', doc.fetchedAt);
  }

  // Check one record sample
  const sample = await db.collection('finopscostrecords').findOne({ billingPeriod: '2026-09' }, { projection: { 'records': { $slice: 1 } } });
  if (sample && sample.records) {
    console.log('Sample record keys:', Object.keys(sample.records[0] || {}));
    console.log('Sample record 0:', sample.records[0]);
  }

  // Check awscostexplorer
  const expDocs = await db.collection('awscostexplorer').find({}, { projection: { projectSummary: 0, serviceSummary: 0, dailyTotals: 0 } }).toArray();
  console.log('awscostexplorer periods:', expDocs.map(d => ({ period: d.billingPeriod, fetchedAt: d.fetchedAt })));

  await client.close();
}

main().catch(console.error);
