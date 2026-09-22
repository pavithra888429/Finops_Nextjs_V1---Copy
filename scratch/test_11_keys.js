const fs = require('fs');

// Read rawKeys from scratch/find_keys.js logic
const transcript = fs.readFileSync('C:/Users/HP/.gemini/antigravity-ide/brain/f7607841-41ab-42cf-9781-993b9107ede6/.system_generated/logs/transcript_full.jsonl', 'utf8');
const lines = transcript.split('\n');
let rawKeys = [];
for (const line of lines) {
  if (line.includes('PF 1 - Aug 04')) {
    const step = JSON.parse(line);
    const content = typeof step.content === 'string' ? step.content : JSON.stringify(step);
    const match = content.match(/"data":\s*(\[\s*\{[\s\S]*?\}\s*\])/);
    if (match) {
      rawKeys = JSON.parse(match[1]);
      break;
    }
  }
}

console.log('Total Raw Workspace Keys:', rawKeys.length);

// Also get topModelsBySpend from mongodb doc
const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

MongoClient.connect(uri).then(async client => {
  const db = client.db('finops_3');
  const doc = await db.collection('finops_3').findOne({ operation: 'OpenRouterGatewaySync' });
  const topModelsBySpend = doc.topModelsBySpend || [];

  // Group models by keyName or apiKeyId
  const keyModelMap = {};
  for (const m of topModelsBySpend) {
    const kName = (m.keyName || m.apiKeyId || '').trim();
    if (!keyModelMap[kName]) keyModelMap[kName] = new Set();
    if (m.model) keyModelMap[kName].add(m.model);
  }

  // BUILD keysList starting from the 11 LIVE WORKSPACE KEYS
  const keysList = rawKeys.map((k, idx) => {
    const cleanName = (k.name || k.label || `Key ${idx + 1}`).trim();
    const cleanLabel = (k.label || '').trim();
    const usage = Number(k.usage) || 0;
    const limit = typeof k.limit === 'number' ? Number(k.limit) : null;
    const remaining = typeof k.limit_remaining === 'number' ? Number(k.limit_remaining) : (limit !== null ? Math.max(0, limit - usage) : null);

    // Get models used by this key
    const modelsSet = keyModelMap[cleanName] || keyModelMap[cleanLabel] || new Set();

    return {
      keyId: k.hash || k.id || `key_${idx + 1}`,
      name: cleanName,
      label: cleanLabel,
      createdAt: k.created_at || null,
      usage: Number(usage.toFixed(4)),
      usageDaily: Number((k.usage_daily || 0).toFixed(4)),
      usageWeekly: Number((k.usage_weekly || 0).toFixed(4)),
      usageMonthly: Number((k.usage_monthly || 0).toFixed(4)),
      limit: limit !== null ? Number(limit.toFixed(2)) : null,
      remaining: remaining !== null ? Number(remaining.toFixed(2)) : null,
      isActive: true,
      models: Array.from(modelsSet)
    };
  }).sort((a, b) => b.usage - a.usage);

  console.log(`\nGenerated keysList count: ${keysList.length}`);
  keysList.forEach((k, i) => {
    console.log(`${i+1}. "${k.name}" | Usage: $${k.usage} | Limit: $${k.limit} | Remaining: $${k.remaining} | Models: [${k.models.join(', ')}]`);
  });

  await client.close();
});
