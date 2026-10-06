const fs = require('fs');
const path = require('path');

// Read the original workflow file or create the updated one
const originalWorkflowPath = path.join(__dirname, '..', 'workflow-1790739983803.json');

// Let's create the clean fixed workflow
const fixedNodes = [
  {
    id: "webhook-1790568044023001",
    data: {
      label: "Webhook Trigger",
      inputs: {
        path: "2384b920-a830-48b2-8388-8a0031f5171c",
        method: "POST",
        options: {},
        allowedRoles: "admin, staff",
        jwtAlgorithm: "HS256",
        responseMode: "respondWithNode",
        roleClaimKey: "role",
        sessionClaim: "sub",
        sessionSource: "none",
        authentication: "none",
        requireRoleCheck: false
      },
      toolId: "webhook",
      isTrigger: true,
      isPrimaryTrigger: true
    },
    type: "webhook",
    width: 220,
    height: 100,
    position: { x: 182, y: 300 }
  },
  {
    id: "mongodb.find_document-1790568218526002",
    data: {
      label: "Find Document",
      inputs: {
        query: "{\n  \"$or\": [\n    { \"awsAccountId\": \"{{ $json.body.awsAccountId || '992382766703' }}\" },\n    { \"connectionId\": \"{{ $json.body.connectionId }}\" }\n  ]\n}\n",
        database: "finops_3",
        collection: "awsconnections",
        credentialId: "692b7c41-2b38-462c-b30b-d6f3e3ceff96"
      },
      toolId: "mongodb.find_document"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 436, y: 302 }
  },
  {
    id: "httpRequest-1790568302468003",
    data: {
      label: "Http Request",
      inputs: {
        url: "https://sts.amazonaws.com/",
        method: "POST",
        timeout: 300000,
        bodyType: "json",
        contentType: "json",
        authentication: {
          type: "predefinedCredentialType",
          config: {
            credentialId: "ede77268-8d19-45df-bfbc-9b79d770ade5",
            credentialType: "awsApi"
          }
        },
        includeHeaders: false,
        responseFormat: "auto",
        queryParameters: {
          Action: "AssumeRole",
          RoleArn: "{{ 'arn:aws:iam::' + ($json.documents[0].awsAccountId || '864981730114') + ':role/' + ($json.documents[0].roleName || 'FinOpsAwsIntegrationRole') }} ",
          Version: "2011-06-15",
          ExternalId: "{{ $json.documents[0].externalId }}",
          DurationSeconds: "3600",
          RoleSessionName: "FinOpsWorkbenchIngestion"
        },
        lowercaseHeaders: true,
        allowUnauthorized: false,
        ignoreResponseCode: false,
        outputPropertyName: "data"
      },
      toolId: "httpRequest"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 673, y: 302 }
  },
  {
    id: "httpRequest-1790568498761004",
    data: {
      label: "Http Request",
      inputs: {
        url: "https://{{ ($node[\"Find Document\"]?.json?.documents?.[0]?.bucketName || 'finops-cur2-864981730114-v1') }}.s3.{{ ($node[\"Find Document\"]?.json?.documents?.[0]?.bucketRegion || $node[\"Find Document\"]?.json?.documents?.[0]?.region || 'us-east-1') }}.amazonaws.com/?list-type=2  ",
        method: "GET",
        timeout: 300000,
        bodyType: "json",
        contentType: "json",
        authentication: {
          type: "predefinedCredentialType",
          config: {
            credentialId: "ede77268-8d19-45df-bfbc-9b79d770ade5",
            credentialType: "awsApi"
          }
        },
        includeHeaders: false,
        responseFormat: "auto",
        lowercaseHeaders: true,
        allowUnauthorized: false,
        ignoreResponseCode: false,
        outputPropertyName: "data"
      },
      toolId: "httpRequest"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 947, y: 306 }
  },
  {
    id: "code.execute-1790568570096005",
    data: {
      label: "Code",
      inputs: {
        code: `const item = $input.first().json;
const rawBody = item.body || item;

// 1. Resolve connection details from MongoDB Find Document
const conn = 
  $node["Find Document"]?.json?.documents?.[0] || 
  $node["Find Document"]?.json || 
  {};
const lastSyncedFile = conn.lastSyncedFile || '';

// 2. Check for manual/force sync flag from webhook trigger
const webhookBody = 
  $node["Webhook Trigger"]?.json?.body || 
  $node["Ingestion Webhook Trigger"]?.json?.body || 
  {};
const isForceSync = webhookBody.force === true || webhookBody.forceSync === true;

let fileKeys = [];

// 3. Parse XML from S3 ListBucket (or JSON object)
if (typeof rawBody === 'string') {
  const matches = rawBody.match(/<Key>(.*?)<\\/Key>/g) || [];
  fileKeys = matches
    .map(m => m.replace(/<\\/?Key>/g, ''))
    .filter(k => 
      (k.endsWith('.parquet') || k.endsWith('.csv.gz')) && 
      !k.includes('-Manifest.json') && 
      !k.includes('/metadata/') && 
      !k.includes('test-object')
    );
} else if (rawBody && typeof rawBody === 'object') {
  const contents = rawBody.ListBucketResult?.Contents || rawBody.Contents || [];
  const list = Array.isArray(contents) ? contents : [contents];
  fileKeys = list
    .map(c => c?.Key || c?.key || '')
    .filter(k => 
      (k.endsWith('.parquet') || k.endsWith('.csv.gz')) && 
      !k.includes('-Manifest.json') && 
      !k.includes('/metadata/') && 
      !k.includes('test-object')
    );
}

// 4. If no cost files found in S3 yet
if (fileKeys.length === 0) {
  return {
    json: {
      hasData: false,
      status: 'pending_aws_export',
      message: 'S3 bucket is connected and ready. Awaiting first AWS daily CUR 2.0 export delivery (AWS exports take up to 24 hours).',
      recordsProcessed: 0
    }
  };
}

const latestFile = fileKeys[fileKeys.length - 1];

// 5. ⚡ DEDUPLICATION: Only skip if file was ALREADY ingested AND records actually exist in the DB
const recordsAlreadyProcessed = (conn.recordsProcessed || 0) > 0 && conn.syncStatus === 'synced';

if (!isForceSync && recordsAlreadyProcessed && lastSyncedFile && lastSyncedFile === latestFile) {
  return {
    json: {
      hasData: false, // Routes to IF Condition False branch (already up to date)
      status: 'already_synced',
      message: \`S3 data is already up to date. Latest export file (\${latestFile.split('/').pop()}) has already been ingested.\`,
      latestFile: latestFile,
      recordsProcessed: conn.recordsProcessed || 0
    }
  };
}

// 6. When a new/unprocessed export file exists, or sync is re-requested:
return {
  json: {
    hasData: true, // Routes to IF Condition True branch (downloads & ingests parquet)
    status: 'files_found',
    latestFile: latestFile,
    totalFiles: fileKeys.length,
    isForceSync: isForceSync
  }
};`,
        mode: "all",
        language: "javascript"
      },
      toolId: "code.execute"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 1204, y: 304 }
  },
  {
    id: "ifnode-1790568714966006",
    data: {
      label: "IF Condition",
      inputs: {
        conditions: {
          combinator: "and",
          conditions: [
            {
              id: "031zw3xjo",
              operator: {
                name: "filter.operator.equals",
                type: "string",
                operation: "equals"
              },
              leftValue: "{{ $json.hasData }}",
              rightValue: "true"
            }
          ]
        }
      },
      toolId: "ifnode"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 1467, y: 303 }
  },
  {
    id: "mongodb.update_document-1790568800142007",
    data: {
      label: "Update Document",
      inputs: {
        mode: "updateOne",
        query: "{ \"awsAccountId\": \"{{ $node[\\\"Find Document\\\"].json.documents[0].awsAccountId || '992382766703' }}\" }\n\n",
        update: "{   \"$set\": {     \"syncStatus\": \"pending_aws_export\",     \"lastSyncAttempt\": \"{{ $now }}\",     \"recordsProcessed\": 0   } }   ",
        upsert: false,
        database: "finops_3",
        collection: "awsconnections",
        credentialId: "692b7c41-2b38-462c-b30b-d6f3e3ceff96"
      },
      toolId: "mongodb.update_document"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 1774, y: 377 }
  },
  {
    id: "respondToWebhook-1790568889372008",
    data: {
      label: "Webhook Response",
      inputs: {
        respondWith: "All Incoming Items",
        inputFieldName: "data"
      },
      toolId: "respondToWebhook"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 2020, y: 366 }
  },
  {
    id: "httpRequest-1790569032056009",
    data: {
      label: "Http Request",
      inputs: {
        url: "https://{{$node[\"mongodb.find_document-1790568218526002\"].json[\"documents\"][0][\"bucketName\"]}}.s3.{{$node[\"mongodb.find_document-1790568218526002\"].json[\"documents\"][0][\"bucketRegion\"]}}.amazonaws.com/{{$node[\"code.execute-1790568570096005\"].json[\"latestFile\"]}} ",
        method: "GET",
        timeout: 300000,
        bodyType: "json",
        contentType: "json",
        authentication: {
          type: "predefinedCredentialType",
          config: {
            credentialId: "ede77268-8d19-45df-bfbc-9b79d770ade5",
            credentialType: "awsApi"
          }
        },
        includeHeaders: false,
        responseFormat: "auto",
        lowercaseHeaders: true,
        allowUnauthorized: false,
        ignoreResponseCode: false,
        outputPropertyName: "data"
      },
      toolId: "httpRequest"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 1774, y: 209 }
  },
  {
    id: "code.execute-1790569089089010",
    data: {
      label: "Code",
      inputs: {
        code: `// 1. Resolve Connection & Account details dynamically from upstream nodes
const conn = 
  $node["Find Document"]?.json?.documents?.[0] || 
  $node["Get Active Connection Details"]?.json?.documents?.[0] || 
  $node["Find Document"]?.json || 
  $node["Get Active Connection Details"]?.json || 
  {};

const webhookBody = 
  $node["Webhook Trigger"]?.json?.body || 
  $node["Ingestion Webhook Trigger"]?.json?.body || 
  {};

const connectionId = String(conn.connectionId || conn._id || webhookBody.connectionId || '');
const awsAccountId = String(conn.awsAccountId || webhookBody.awsAccountId || '');
const targetRegion = String(conn.bucketRegion || conn.region || 'us-east-1');

// 2. Extract raw Base64 Parquet file from previous Http Request step
const firstItem = $input.first();
const rawBody = 
  firstItem?.json?.body || 
  firstItem?.json?.data || 
  firstItem?.body || 
  firstItem?.data || 
  '';

// 3. Fast Base64 Decoder (uses native Buffer when available, pure JS fallback)
function decodeBase64Fallback(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

  const clean = str.replace(/[^A-Za-z0-9+/=]/g, '');
  let len = clean.length;
  if (clean.endsWith('==')) len -= 2;
  else if (clean.endsWith('=')) len -= 1;
  const byteLen = Math.floor((len * 3) / 4);
  const u8 = new Uint8Array(byteLen);
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const a = lookup[clean.charCodeAt(i)];
    const b = lookup[clean.charCodeAt(i + 1)];
    const c = lookup[clean.charCodeAt(i + 2)];
    const d = lookup[clean.charCodeAt(i + 3)];
    if (p < byteLen) u8[p++] = (a << 2) | (b >> 4);
    if (p < byteLen) u8[p++] = ((b & 15) << 4) | (c >> 2);
    if (p < byteLen) u8[p++] = ((c & 3) << 6) | (d & 63);
  }
  return u8;
}

if (!rawBody || typeof rawBody !== 'string') {
  return {
    json: {
      status: 'skipped',
      message: 'No Parquet binary available in previous step. Run the full workflow to download S3 data.'
    }
  };
}

const bytes = (typeof Buffer !== 'undefined') ? Buffer.from(rawBody, 'base64') : decodeBase64Fallback(rawBody);

if (!bytes || bytes.length < 12) {
  return {
    json: {
      status: 'skipped',
      message: 'Empty or invalid Parquet file received. Make sure the S3 download step executed successfully.'
    }
  };
}

// 4. Thrift Compact Protocol Deserializer
function readVarInt(r) {
  let res = 0, shift = 0;
  while (r.offset < r.view.byteLength) {
    const b = r.view.getUint8(r.offset++);
    res |= (b & 0x7f) << shift;
    if (!(b & 0x80)) return res;
    shift += 7;
  }
  return res;
}
function readZigZag(r) { const z = readVarInt(r); return z >>> 1 ^ -(z & 1); }
function deserializeThrift(r) {
  const val = {};
  let fid = 0;
  while (r.offset < r.view.byteLength) {
    const byte = r.view.getUint8(r.offset++);
    const type = byte & 0x0f;
    if (type === 0) break;
    const delta = byte >> 4;
    fid = delta ? fid + delta : readZigZag(r);
    val['field_' + fid] = readElem(r, type);
  }
  return val;
}
function readElem(r, type) {
  if (type === 1) return true;
  if (type === 2) return false;
  if (type === 3) return r.view.getInt8(r.offset++);
  if (type === 4 || type === 5) return readZigZag(r);
  if (type === 6) {
    let res = 0n, shift = 0n;
    while (r.offset < r.view.byteLength) {
      const b = r.view.getUint8(r.offset++);
      res |= BigInt(b & 0x7f) << shift;
      if (!(b & 0x80)) break;
      shift += 7n;
    }
    return Number(res >> 1n ^ -(res & 1n));
  }
  if (type === 7) { const v = r.view.getFloat64(r.offset, true); r.offset += 8; return v; }
  if (type === 8) {
    const len = readVarInt(r);
    const b = new Uint8Array(r.view.buffer, r.view.byteOffset + r.offset, len);
    r.offset += len;
    return b;
  }
  if (type === 9) {
    const b = r.view.getUint8(r.offset++);
    const elemType = b & 0x0f;
    let sz = b >> 4;
    if (sz === 15) sz = readVarInt(r);
    const arr = new Array(sz);
    for (let i = 0; i < sz; i++) arr[i] = readElem(r, elemType);
    return arr;
  }
  if (type === 12) return deserializeThrift(r);
  return null;
}

// 5. Snappy Decompressor
function snappy(src) {
  let p = 0;
  while (p < src.length && src[p++] >= 128) {}
  const out = [];
  while (p < src.length) {
    const b = src[p++];
    const t = b & 3;
    if (t === 0) {
      let l = (b >> 2) + 1;
      if (l > 60) {
        let e = l - 60; l = 0;
        for (let i = 0; i < e; i++) l |= src[p++] << (i * 8);
        l += 1;
      }
      for (let i = 0; i < l; i++) out.push(src[p++]);
    } else if (t === 1) {
      const l = ((b >> 2) & 7) + 4;
      const off = ((b >> 5) << 8) | src[p++];
      for (let i = 0; i < l; i++) out.push(out[out.length - off]);
    } else if (t === 2) {
      const l = (b >> 2) + 1;
      const off = src[p++] | (src[p++] << 8);
      for (let i = 0; i < l; i++) out.push(out[out.length - off]);
    } else if (t === 3) {
      const l = (b >> 2) + 1;
      const off = src[p++] | (src[p++] << 8) | (src[p++] << 16) | (src[p++] << 24);
      for (let i = 0; i < l; i++) out.push(out[out.length - off]);
    }
  }
  return new Uint8Array(out);
}

// 6. RLE & Bit-Packed Hybrid Decoder
function readRleBitPackedHybrid(reader, width, output, length) {
  if (length === undefined) {
    length = reader.view.getUint32(reader.offset, true);
    reader.offset += 4;
  }
  const startOffset = reader.offset;
  let seen = 0;
  while (seen < output.length && reader.offset < startOffset + length) {
    const header = readVarInt(reader);
    if (header & 1) {
      let count = (header >> 1) * 8;
      const mask = (1 << width) - 1;
      let data = 0, left = 8, right = 0;
      if (reader.offset < reader.view.byteLength) data = reader.view.getUint8(reader.offset++);
      while (count > 0 && seen < output.length) {
        if (right > 8) {
          right -= 8; left -= 8; data >>>= 8;
        } else if (left - right < width) {
          if (reader.offset < reader.view.byteLength) data |= reader.view.getUint8(reader.offset++) << left;
          left += 8;
        } else {
          output[seen++] = (data >> right) & mask;
          count--;
          right += width;
        }
      }
    } else {
      const count = header >>> 1;
      let val = 0;
      const byteWidth = (width + 7) >> 3;
      for (let i = 0; i < byteWidth; i++) val |= reader.view.getUint8(reader.offset++) << (i * 8);
      for (let i = 0; i < count; i++) if (seen < output.length) output[seen++] = val;
    }
  }
}

// 7. Parse Parquet Metadata
const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const metaLen = view.getUint32(bytes.length - 8, true);
const metaOffset = bytes.length - 8 - metaLen;
const meta = deserializeThrift({ view, offset: metaOffset });
const numRows = meta.field_3 || 0;
const schema = meta.field_2 || [];
const colNames = schema.slice(1).map(s => {
  const sb = s.field_4;
  let str = '';
  if (sb) {
    for (let i = 0; i < sb.length; i++) str += String.fromCharCode(sb[i]);
  }
  return str;
});
const colChunks = (meta.field_4 && meta.field_4[0] && meta.field_4[0].field_1) || [];

// 8. ⚡ OPTIMIZATION: ONLY decode the 10 columns we actually use
const NEEDED_COLUMNS = new Set([
  'line_item_usage_start_date',
  'line_item_usage_account_id',
  'bill_payer_account_id',
  'line_item_product_code',
  'line_item_resource_id',
  'line_item_usage_type',
  'line_item_operation',
  'line_item_unblended_cost',
  'line_item_blended_cost',
  'line_item_line_item_description'
]);

const columnsData = {};

for (let cIdx = 0; cIdx < colChunks.length; cIdx++) {
  const colName = colNames[cIdx];
  if (!NEEDED_COLUMNS.has(colName)) continue;

  const m = colChunks[cIdx].field_3;
  const colType = m.field_1;
  const dictOffset = m.field_11;
  const dataOffset = m.field_9;

  let dictValues = [];
  if (dictOffset !== undefined) {
    let r = { view, offset: dictOffset };
    const dictH = deserializeThrift(r);
    const dictBytes = snappy(bytes.subarray(r.offset, r.offset + dictH.field_3));
    const dView = new DataView(dictBytes.buffer, dictBytes.byteOffset, dictBytes.byteLength);
    let dOff = 0;
    const count = (dictH.field_7 && dictH.field_7.field_1) || 0;
    for (let i = 0; i < count; i++) {
      if (colType === 6) {
        const len = dView.getInt32(dOff, true); dOff += 4;
        let s = '';
        for (let j = 0; j < len; j++) s += String.fromCharCode(dictBytes[dOff + j]);
        dOff += len;
        dictValues.push(s);
      } else if (colType === 5) {
        dictValues.push(dView.getFloat64(dOff, true));
        dOff += 8;
      } else if (colType === 3) {
        const nano = dView.getBigInt64(dOff, true);
        const julianDay = dView.getInt32(dOff + 8, true);
        dOff += 12;
        const millis = (julianDay - 2440588) * 86400000 + Number(nano / 1000000n);
        dictValues.push(new Date(millis).toISOString());
      } else {
        dictValues.push(null);
      }
    }
  }

  let r = { view, offset: dataOffset };
  const dataH = deserializeThrift(r);
  const dataBytes = snappy(bytes.subarray(r.offset, r.offset + dataH.field_3));
  const pReader = { view: new DataView(dataBytes.buffer, dataBytes.byteOffset, dataBytes.byteLength), offset: 0 };
  
  const defLevels = new Array(numRows);
  readRleBitPackedHybrid(pReader, 1, defLevels);

  const bitWidth = pReader.view.getUint8(pReader.offset++);
  let values = [];
  if (bitWidth === 0) {
    values = new Array(numRows).fill(0);
  } else {
    values = new Array(numRows);
    readRleBitPackedHybrid(pReader, bitWidth, values, pReader.view.byteLength - pReader.offset);
  }

  const colResult = new Array(numRows);
  let nonNullIdx = 0;
  for (let i = 0; i < numRows; i++) {
    if (defLevels[i] === 0) {
      colResult[i] = null;
    } else {
      colResult[i] = dictValues.length > 0 ? dictValues[values[nonNullIdx++]] : values[nonNullIdx++];
    }
  }
  columnsData[colName] = colResult;
}

// 9. ⚡ FAST SINGLE-PASS DIRECT MAPPING
const d_date = columnsData['line_item_usage_start_date'] || [];
const d_acct = columnsData['line_item_usage_account_id'] || columnsData['bill_payer_account_id'] || [];
const d_prod = columnsData['line_item_product_code'] || [];
const d_res  = columnsData['line_item_resource_id'] || [];
const d_type = columnsData['line_item_usage_type'] || [];
const d_oper = columnsData['line_item_operation'] || [];
const d_cost = columnsData['line_item_unblended_cost'] || [];
const d_bcost = columnsData['line_item_blended_cost'] || [];
const d_desc = columnsData['line_item_line_item_description'] || [];

const today = new Date().toISOString().substring(0, 10);
let detectedBillingPeriod = today.substring(0, 7);
const parsedRecords = new Array(numRows);

for (let i = 0; i < numRows; i++) {
  const fileDate = d_date[i];
  const dateStr = fileDate ? String(fileDate).substring(0, 10) : today;
  if (i === 0 && dateStr.length >= 7) detectedBillingPeriod = dateStr.substring(0, 7);

  const recordAccountId = String(d_acct[i] || awsAccountId);

  parsedRecords[i] = {
    connectionId: connectionId,
    billingPeriod: detectedBillingPeriod,
    date: dateStr,
    accountId: recordAccountId,
    accountName: 'Production AWS Account',
    service: String(d_prod[i] || ''),
    region: targetRegion,
    resourceId: String(d_res[i] || ''),
    usageType: String(d_type[i] || ''),
    operation: String(d_oper[i] || ''),
    unblendedCost: Number(d_cost[i] || 0),
    blendedCost: Number(d_bcost[i] || 0),
    amortizedCost: Number(d_cost[i] || 0),
    netCost: Number(d_cost[i] || 0),
    usageAmount: 1.0,
    description: String(d_desc[i] || '')
  };
}

const activeRunId = webhookBody.runId || ('run_' + Date.now().toString(36));
const fileName = 
  $node["code.execute-1790568570096005"]?.json?.latestFile || 
  $node["Evaluate S3 Files"]?.json?.latestFile || 
  $node["Code"]?.json?.latestFile || 
  'cur_export.parquet';
const completedTimestamp = new Date().toISOString();

// 10. ⚡ Prepare Upsert Document (Updates the single monthly document in place)
const costDocument = {
  connectionId: connectionId,
  awsAccountId: awsAccountId,
  runId: activeRunId,
  billingPeriod: detectedBillingPeriod,
  records: parsedRecords,
  recordsProcessed: parsedRecords.length,
  status: 'completed',
  fileName: fileName,
  completedAt: completedTimestamp
};

return {
  connectionId: connectionId,
  awsAccountId: awsAccountId,
  runId: activeRunId,
  billingPeriod: detectedBillingPeriod,
  records: parsedRecords,
  recordsProcessed: parsedRecords.length,
  status: 'completed',
  fileName: fileName,
  completedAt: completedTimestamp,
  document: costDocument
};`,
        mode: "all",
        language: "javascript"
      },
      toolId: "code.execute"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 2014, y: 209 }
  },
  {
    id: "mongodb.update_document-1790684435848005",
    data: {
      label: "Update Document",
      inputs: {
        mode: "updateOne",
        query: "{\n  \"awsAccountId\": \"{{ $json.awsAccountId }}\",\n  \"billingPeriod\": \"{{ $json.billingPeriod }}\"\n}\n",
        update: "{\n  \"$set\": {{ JSON.stringify($json.document) }}\n}",
        upsert: true,
        database: "finops_3",
        collection: "finopscostrecords",
        credentialId: "692b7c41-2b38-462c-b30b-d6f3e3ceff96"
      },
      toolId: "mongodb.update_document"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 2300, y: 208 }
  },
  {
    id: "mongodb.insert_document-1790569337053012",
    data: {
      label: "Insert Document",
      inputs: {
        fields: "runId, connectionId, awsAccountId, status, recordsProcessed, fileName, message, completedAt ",
        database: "finops_3",
        collection: "finops_ingestion_logs",
        credentialId: "692b7c41-2b38-462c-b30b-d6f3e3ceff96"
      },
      toolId: "mongodb.insert_document"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 2612, y: 195 }
  },
  {
    id: "mongodb.update_document-1790569467148013",
    data: {
      label: "Update Document",
      inputs: {
        mode: "updateMany",
        query: "{ \"awsAccountId\": \"{{ $json.awsAccountId || $node[\\\"Code\\\"].json.awsAccountId }}\" }\n",
        update: "{   \"$set\": {     \"syncStatus\": \"synced\",     \"lastSyncedAt\": \"{{ $now }}\",     \"lastSyncedFile\": \"{{ $json.fileName || $node[\\\"Code\\\"].json.fileName }}\",     \"recordsProcessed\": {{ $json.recordsProcessed || $node[\\\"Code\\\"].json.recordsProcessed || 0 }}   } }    ",
        upsert: false,
        database: "finops_3",
        collection: "awsconnections",
        credentialId: "692b7c41-2b38-462c-b30b-d6f3e3ceff96"
      },
      toolId: "mongodb.update_document"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 2875, y: 179 }
  },
  {
    id: "respondToWebhook-1790569508987014",
    data: {
      label: "Webhook Response",
      inputs: {
        respondWith: "All Incoming Items",
        inputFieldName: "data"
      },
      toolId: "respondToWebhook"
    },
    type: "action",
    width: 220,
    height: 94,
    position: { x: 3114, y: 180 }
  }
];

const fixedEdges = [
  {
    id: "reactflow__edge-webhook-1790568044023001-mongodb.find_document-1790568218526002",
    type: "custom",
    source: "webhook-1790568044023001",
    target: "mongodb.find_document-1790568218526002"
  },
  {
    id: "reactflow__edge-mongodb.find_document-1790568218526002-httpRequest-1790568302468003",
    type: "custom",
    source: "mongodb.find_document-1790568218526002",
    target: "httpRequest-1790568302468003"
  },
  {
    id: "reactflow__edge-httpRequest-1790568302468003-httpRequest-1790568498761004",
    type: "custom",
    source: "httpRequest-1790568302468003",
    target: "httpRequest-1790568498761004"
  },
  {
    id: "reactflow__edge-httpRequest-1790568498761004-code.execute-1790568570096005",
    type: "custom",
    source: "httpRequest-1790568498761004",
    target: "code.execute-1790568570096005"
  },
  {
    id: "reactflow__edge-code.execute-1790568570096005-ifnode-1790568714966006",
    type: "custom",
    source: "code.execute-1790568570096005",
    target: "ifnode-1790568714966006"
  },
  {
    id: "reactflow__edge-ifnode-1790568714966006false-mongodb.update_document-1790568800142007",
    type: "custom",
    source: "ifnode-1790568714966006",
    target: "mongodb.update_document-1790568800142007",
    sourceHandle: "false"
  },
  {
    id: "reactflow__edge-mongodb.update_document-1790568800142007-respondToWebhook-1790568889372008",
    type: "custom",
    source: "mongodb.update_document-1790568800142007",
    target: "respondToWebhook-1790568889372008"
  },
  {
    id: "reactflow__edge-ifnode-1790568714966006true-httpRequest-1790569032056009",
    type: "custom",
    source: "ifnode-1790568714966006",
    target: "httpRequest-1790569032056009",
    sourceHandle: "true"
  },
  {
    id: "reactflow__edge-httpRequest-1790569032056009-code.execute-1790569089089010",
    type: "custom",
    source: "httpRequest-1790569032056009",
    target: "code.execute-1790569089089010"
  },
  {
    id: "reactflow__edge-code.execute-1790569089089010-mongodb.update_document-1790684435848005",
    type: "custom",
    source: "code.execute-1790569089089010",
    target: "mongodb.update_document-1790684435848005"
  },
  {
    id: "reactflow__edge-code.execute-1790569089089010-mongodb.insert_document-1790569337053012",
    type: "custom",
    source: "code.execute-1790569089089010",
    target: "mongodb.insert_document-1790569337053012"
  },
  {
    id: "reactflow__edge-mongodb.insert_document-1790569337053012-mongodb.update_document-1790569467148013",
    type: "custom",
    source: "mongodb.insert_document-1790569337053012",
    target: "mongodb.update_document-1790569467148013"
  },
  {
    id: "reactflow__edge-mongodb.update_document-1790569467148013-respondToWebhook-1790569508987014",
    type: "custom",
    source: "mongodb.update_document-1790569467148013",
    target: "respondToWebhook-1790569508987014"
  }
];

const fixedWorkflow = {
  _platform: "agentbuilder",
  _version: 1,
  _exportedAt: new Date().toISOString(),
  nodes: fixedNodes,
  edges: fixedEdges
};

const outputPath = path.join(__dirname, '..', 'workflow-cur-ingestion-upsert-fixed.json');
fs.writeFileSync(outputPath, JSON.stringify(fixedWorkflow, null, 2), 'utf8');
console.log('Successfully created', outputPath);
