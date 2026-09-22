const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

async function check() {
  const client = await MongoClient.connect(uri);
  const dbs = await client.db().admin().listDatabases();
  console.log('Databases:', dbs.databases.map(d => d.name));

  for (const dbName of ['finops_3', 'finops_2']) {
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`\n=== Collections in ${dbName} ===`);
    for (const c of collections) {
      const col = db.collection(c.name);
      const total = await col.countDocuments();
      const openrouterCount = await col.countDocuments({
        $or: [
          { operation: 'OpenRouterGatewaySync' },
          { ProviderName: 'OpenRouter' },
          { 'tags.Provider': 'OpenRouter' },
          { service: /OpenRouter/i },
          { connectionName: /OpenRouter/i },
          { connectionId: /OpenRouter/i }
        ]
      });
      console.log(`- ${c.name}: total docs = ${total}, OpenRouter docs = ${openrouterCount}`);
    }
  }
  await client.close();
}
check();
