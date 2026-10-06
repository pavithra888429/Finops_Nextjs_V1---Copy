const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

async function test() {
  const client = new MongoClient(uri);
  await client.connect();
  const admin = client.db().admin();
  const dbs = await admin.listDatabases();
  for (let dbInfo of dbs.databases) {
    const db = client.db(dbInfo.name);
    const cols = await db.listCollections().toArray();
    for (let col of cols) {
      try {
        const found = await db.collection(col.name).findOne({
          $or: [
            { 'nodes.id': 'code.execute-1790568570096005' },
            { 'nodes.data.label': 'Code' },
            { 'id': '2384b920-a830-48b2-8388-8a0031f5171c' },
            { 'webhookPath': { $regex: '2384b920' } }
          ]
        });
        if (found) {
          console.log('FOUND IN:', dbInfo.name, col.name, 'id:', found._id, 'name:', found.name || found.title);
        }
      } catch (e) {}
    }
  }
  await client.close();
}
test().catch(console.error);
