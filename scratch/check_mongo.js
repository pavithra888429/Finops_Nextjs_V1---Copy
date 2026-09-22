const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';
MongoClient.connect(uri).then(async client => {
  const db = client.db('finops_3');
  const doc = await db.collection('finops_3').findOne({ _id: new (require('mongodb').ObjectId)('6ab12697cb01f6bc5e9ed6ba') });
  console.log('Doc keysList names and labels:');
  doc.keysList.forEach((k, idx) => console.log(`${idx+1}. "${k.name}" | label="${k.label}" | usage=${k.usage} | isActive=${k.isActive}`));
  process.exit(0);
});
