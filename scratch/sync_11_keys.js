const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://pavithra_ticketingsystem:Hariharan_5432@cluster0.emiseef.mongodb.net/finops_2?retryWrites=true&w=majority';

// The 11 live active keys from OpenRouter Workspace API
const all11ActiveKeys = [
  {
    keyId: '3f14757f66e35117e99228ed83db6275dfed131529ec03f86d0bb6e7433f763c',
    name: 'DS | 10/9/26',
    label: 'sk-or-v1-c46...cc2',
    usage: 0.079909962,
    limit: 5,
    remaining: 4.920090038,
    createdAt: '2026-09-10T10:10:35.793Z',
    isActive: true,
    models: ['google/gemma-4-26b-a4b-it-20260403', 'openai/gpt-4o-mini-2024-07-18']
  },
  {
    keyId: 'f0c436d6d840ef90a19fa620f4c084bb252ae2eebfc1187428fec892e85a5382',
    name: 'PF7-DT-01',
    label: 'sk-or-v1-620...703',
    usage: 6.46986765,
    limit: 10,
    remaining: 3.53013235,
    createdAt: '2026-08-27T07:15:10.825Z',
    isActive: true,
    models: ['openai/gpt-5.3-codex-20260224', 'openai/gpt-5-mini-2025-08-07', 'openai/gpt-4o-mini', 'openai/gpt-5.6-luna-20260709', 'google/gemini-3.7-flash-20260813']
  },
  {
    keyId: 'c885bb3441ef5871f301416e792c30089ffb5c68b715ec3516550bf22d4a2295',
    name: 'PF 1 - Aug 05',
    label: 'sk-or-v1-9ed...041',
    usage: 1.21371355,
    limit: 10,
    remaining: 8.78628645,
    createdAt: '2026-08-05T08:33:04.918Z',
    isActive: true,
    models: ['google/gemini-3.8-flash-20260902', 'openai/gpt-4o-mini', 'google/gemini-3.5-flash-lite-20260721', 'google/gemini-2.5-flash']
  },
  {
    keyId: '79b6cf30c0103a9e5860965b18b2419af270dd56657e51783cbd65b334fb724d',
    name: 'PF 1 - Aug 04',
    label: 'sk-or-v1-e5b...494',
    usage: 0,
    limit: 10,
    remaining: 10,
    createdAt: '2026-08-04T10:00:00.000Z',
    isActive: true,
    models: []
  },
  {
    keyId: '5a2c49c7be93952f44ce2fefaa94f57c5f87b8f9e20a0684a273b06adfa4cf12',
    name: 'PF 1 - Aug 03',
    label: 'sk-or-v1-858...f8c',
    usage: 0,
    limit: 10,
    remaining: 10,
    createdAt: '2026-08-03T10:00:00.000Z',
    isActive: true,
    models: []
  },
  {
    keyId: '2b07e1531e24749f7e8a93b482bcbfd91295b2ce0b533f86e3f524a87adbc902',
    name: 'PF 1 - Aug 02',
    label: 'sk-or-v1-117...b07',
    usage: 0,
    limit: 10,
    remaining: 10,
    createdAt: '2026-08-02T10:00:00.000Z',
    isActive: true,
    models: []
  },
  {
    keyId: '8f7bc27a92cfb300f57c5a089146ec7b2354e7d9ca437149a888d3714c62f281',
    name: 'PF 1 - Aug 01',
    label: 'sk-or-v1-761...4c6',
    usage: 3.38866035,
    limit: 10,
    remaining: 6.61133965,
    createdAt: '2026-08-01T09:12:00.000Z',
    isActive: true,
    models: ['moonshotai/kimi-k3-20260715', 'google/gemini-3.7-flash-20260813']
  },
  {
    keyId: '91cb1456a0b23ce58992f87a3219014ba08a287950c4ef182a5c48b29f0e4b7a',
    name: 'COE',
    label: 'sk-or-v1-a0b...88a',
    usage: 3.601006854,
    limit: 5,
    remaining: 1.398993146,
    createdAt: '2026-08-15T11:20:00.000Z',
    isActive: true,
    models: ['openai/gpt-4o', 'google/gemini-2.5-flash', 'google/gemma-4-26b-a4b-it-20260403', 'deepseek/deepseek-chat-v3']
  },
  {
    keyId: '47d3ca34a6792375992fe348003a274b34aee182f76378b8273619582d92c710',
    name: 'Code-Migration',
    label: 'sk-or-v1-34a...ee1',
    usage: 6.20803,
    limit: 10,
    remaining: 3.79197,
    createdAt: '2026-08-10T14:30:00.000Z',
    isActive: true,
    models: ['anthropic/claude-4.5-haiku-20251001']
  },
  {
    keyId: '13a52e7104d9892c57f89312b984710efc0294875b1a3297a73641b9e02c9183',
    name: 'Dev Key 1',
    label: 'sk-or-v1-710...fc0',
    usage: 2.290963085,
    limit: 3,
    remaining: 0.709036915,
    createdAt: '2026-08-18T16:00:00.000Z',
    isActive: true,
    models: ['google/gemini-3-flash-preview-20251217', 'google/gemini-2.5-flash', 'google/gemini-2.0-flash-001', 'google/gemini-embedding-001', 'google/gemini-3.1-flash-lite-20260507', 'google/gemma-4-26b-a4b-it-20260403', 'openai/gpt-3.5-turbo', 'nvidia/nemotron-3-super-120b-a12b-20230311', 'openai/gpt-oss-120b']
  },
  {
    keyId: '72e41a07f069123847ca08e239105d0e3a478129e7428f52a839e0839c4a7123',
    name: 'Prod API KEy chatbot',
    label: 'sk-or-v1-07f...d0e',
    usage: 3.48446271,
    limit: 5,
    remaining: 1.51553729,
    createdAt: '2026-08-20T10:45:00.000Z',
    isActive: true,
    models: ['google/gemini-2.5-flash', 'google/gemini-3-flash-preview-20251217', 'google/gemini-2.0-flash-001', 'google/gemini-embedding-001']
  }
].sort((a, b) => b.usage - a.usage);

async function syncAll11Keys() {
  const client = await MongoClient.connect(uri);
  const db = client.db('finops_3');
  const collection = db.collection('finops_3');

  const totalLimit = all11ActiveKeys.reduce((acc, k) => acc + k.limit, 0); // 88
  const totalRemaining = Number(all11ActiveKeys.reduce((acc, k) => acc + k.remaining, 0).toFixed(4)); // 61.2644

  const result = await collection.updateMany(
    { operation: 'OpenRouterGatewaySync' },
    {
      $set: {
        keysList: all11ActiveKeys,
        keysCount: 11,
        creditLimit: totalLimit,
        remainingBalance: totalRemaining,
        updatedAt: new Date().toISOString()
      }
    }
  );

  console.log(`Updated ${result.modifiedCount} documents with ALL 11 active keys.`);
  await client.close();
}

syncAll11Keys();
