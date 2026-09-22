const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

async function deleteOpenRouter() {
  const client = await MongoClient.connect(uri);
  const db = client.db('finops_3');
  const col = db.collection('finops_3');

  const query = {
    $or: [
      { operation: 'OpenRouterGatewaySync' },
      { ProviderName: 'OpenRouter' },
      { 'tags.Provider': 'OpenRouter' },
      { connectionName: /OpenRouter/i },
      { connectionId: /OpenRouter/i }
    ]
  };

  const totalBefore = await col.countDocuments();
  const matchingBefore = await col.find(query).toArray();

  console.log(`Total documents before: ${totalBefore}`);
  console.log(`Matching OpenRouter records to delete: ${matchingBefore.length}`);
  matchingBefore.forEach((d, i) => {
    console.log(`  - Target ${i + 1}: _id=${d._id}, operation=${d.operation}, connectionName=${d.connectionName}, ProviderName=${d.ProviderName}`);
  });

  if (matchingBefore.length === 0) {
    console.log('No OpenRouter records found to delete.');
    await client.close();
    return;
  }

  const result = await col.deleteMany(query);
  console.log(`\nSuccessfully deleted ${result.deletedCount} OpenRouter record(s).`);

  const totalAfter = await col.countDocuments();
  const matchingAfter = await col.countDocuments(query);

  console.log(`Total documents after: ${totalAfter}`);
  console.log(`Remaining OpenRouter records: ${matchingAfter}`);

  await client.close();
}

deleteOpenRouter().catch(err => {
  console.error('Error during deletion:', err);
  process.exit(1);
});
