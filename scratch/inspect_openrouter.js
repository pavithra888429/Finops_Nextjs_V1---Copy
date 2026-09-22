const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

async function inspect() {
  const client = await MongoClient.connect(uri);
  const db = client.db('finops_3');
  const col = db.collection('finops_3');

  // Search with various regexes
  const docs = await col.find({
    $or: [
      { operation: 'OpenRouterGatewaySync' },
      { ProviderName: /openrouter/i },
      { 'tags.Provider': /openrouter/i },
      { service: /openrouter/i },
      { connectionName: /openrouter/i },
      { connectionId: /openrouter/i },
      { chargeDescription: /openrouter/i }
    ]
  }).toArray();

  console.log(`Found ${docs.length} matching OpenRouter document(s) in finops_3.finops_3:`);
  docs.forEach((d, i) => {
    console.log(`\nDoc ${i+1}:`);
    console.log(`_id: ${d._id}`);
    console.log(`operation: ${d.operation}`);
    console.log(`connectionName: ${d.connectionName}`);
    console.log(`service: ${d.service}`);
    console.log(`updatedAt: ${d.updatedAt}`);
    console.log(`keysList length: ${d.keysList?.length}`);
    console.log(`topModelsBySpend length: ${d.topModelsBySpend?.length}`);
    console.log(`focusRecords length: ${d.focusRecords?.length}`);
  });

  await client.close();
}
inspect();
