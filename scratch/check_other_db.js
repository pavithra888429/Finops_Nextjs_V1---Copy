const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

async function checkAll() {
  const client = await MongoClient.connect(uri);
  const db = client.db('finops');
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const col = db.collection(c.name);
    const count = await col.countDocuments({
      $or: [
        { operation: 'OpenRouterGatewaySync' },
        { ProviderName: /openrouter/i },
        { 'tags.Provider': /openrouter/i },
        { service: /openrouter/i },
        { connectionName: /openrouter/i }
      ]
    });
    if (count > 0) {
      console.log(`finops.${c.name} has ${count} openrouter docs`);
    }
  }
  await client.close();
}
checkAll();
