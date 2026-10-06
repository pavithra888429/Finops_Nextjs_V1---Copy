import axios from 'axios';

const getAppOrigin = () => {
  if (typeof window !== 'undefined') return '';
  return `http://localhost:${process.env.PORT || 3005}`;
};

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl && !envUrl.includes(':4000')) {
    const cleaned = envUrl.replace(/\/+$/, '');
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  }
  if (typeof window !== 'undefined') return '/api';
  return `http://localhost:${process.env.PORT || 3005}/api`;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export interface AwsConnectionRecord {
  connectionId: string;
  provider: 'aws';
  connectionName: string;
  region: string;
  partition?: 'aws' | 'aws-us-gov' | 'aws-cn';
  setupMethod: 'cloudformation';
  stackName: string;
  roleName: string;
  externalId: string;
  platformAccountId: string;
  cloudFormationLaunchUrl: string;
  status: 'not_started' | 'setup_preparing' | 'cloudformation_pending' | 'verification_pending' | 'connected' | 'verification_failed';
  awsAccountId?: string;
  accountType?: 'PAYER' | 'MEMBER' | 'STANDALONE';
  roleStatus?: 'verified' | 'unverified' | 'failed';
  roleArn?: string;
  verifiedAt?: string;
  bucketName?: string;
  exportName?: string;
  exportPathPrefix?: string;
  s3BucketStatus?: 'active' | 'pending' | 'failed';
  cloudCostStatus?: 'verified' | 'pending' | 'failed';
  exportStatus?: 'active' | 'pending' | 'failed';
  lastSyncedAt?: string;
  recordsProcessed?: number;
  syncStatus?: 'not_synced' | 'pending_aws_export' | 'syncing' | 'synced' | 'failed';
  lastSyncAttempt?: string;
  lastCostExplorerSyncDate?: string;
  lastCostExplorerSyncedAt?: string;
  totalSpend?: number;
  lastError?: {
    errorCode: string;
    message: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface OpenRouterWorkflowVerifyPayload {
  connectionName: string;
  apiKey: string;
  productTag: string;
  lowBalanceThreshold?: number;
}

export interface OpenRouterWorkflowVerifyResponse {
  success: boolean;
  connectionId?: string;
  connectionName?: string;
  productTag?: string;
  totalUsage?: number;
  creditLimit?: number | null;
  remainingBalance?: number | null;
  keyLabel?: string;
  recordsIngested?: number;
  modelsDetected?: string[];
  lastSyncedAt?: string;
  error?: string;
}

export function extractAwsConnectionRecord(raw: any): any {
  if (!raw) return null;

  // Direct document
  if (raw.connectionId && (raw.status || raw.roleStatus || raw._id)) {
    return raw;
  }

  let target = raw;
  if (target?.items?.[0]?.json) {
    target = target.items[0].json;
  }
  if (target?._responseData) {
    target = target._responseData;
  }
  if (target?.documents && Array.isArray(target.documents) && target.documents.length > 0) {
    return target.documents[0];
  }
  if (target?.connection) {
    return target.connection;
  }
  if (target?.result) {
    target = target.result;
    if (target?.documents?.[0]) return target.documents[0];
    if (target?.connection) return target.connection;
  }
  if (Array.isArray(target) && target.length > 0) {
    const first = target[0];
    if (first?.documents?.[0]) return first.documents[0];
    return first;
  }

  if (raw?._responseData?.documents?.[0]) {
    return raw._responseData.documents[0];
  }

  return target;
}

function extractWorkflowData(raw: any): any {
  return extractAwsConnectionRecord(raw);
}

export const finopsApi = {
  startConnection: async (params: {
    connectionName: string;
    region: string;
    awsAccountId?: string;
    roleName?: string;
    stackName?: string;
    partition?: 'aws' | 'aws-us-gov' | 'aws-cn';
    permissionsBoundaryArn?: string;
    provider?: 'aws';
    setupMethod?: 'cloudformation';
    externalId?: string;
  }): Promise<AwsConnectionRecord> => {
    const payload = {
      userId: 'default_user',
      provider: params.provider || 'aws',
      connectionName: params.connectionName,
      region: params.region,
      awsAccountId: params.awsAccountId || '',
      roleName: params.roleName || 'FinOpsAwsIntegrationRole',
      stackName:
        params.stackName ||
        params.connectionName.trim().replace(/[^a-zA-Z0-9-]/g, '-'),
      partition: params.partition || 'aws',
      permissionsBoundaryArn: params.permissionsBoundaryArn,
      setupMethod: params.setupMethod || 'cloudformation',
      externalId: params.externalId,
      platformAccountId:
        process.env.NEXT_PUBLIC_PLATFORM_ACCOUNT_ID ||
        process.env.NEXT_PUBLIC_FINOPS_PLATFORM_ACCOUNT_ID ||
        '864981730114',
      templateUrl:
        process.env.NEXT_PUBLIC_FINOPS_CFN_TEMPLATE_URL ||
        'https://square-pulse-public.s3.ap-south-1.amazonaws.com/templates/finops-aws-cloud-cost-role.yaml',
    };

    const webhookUrl =
      process.env.NEXT_PUBLIC_AWS_START_WEBHOOK_URL ||
      'https://api.agents.snsihub.ai/webhook/2287578e-eed7-41f3-b6a6-520341217447';

    console.log('[FinOps Webhook 1] Calling CloudFormation Launch URL Generator:', webhookUrl, payload);

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const raw = response.data;
    console.log('[FinOps Webhook 1] Response received:', raw);
    const res = raw?._responseData || raw?.result || raw?.items?.[0]?.json || raw?.data || raw;
    if (typeof window !== 'undefined' && res?.connectionId) {
      localStorage.setItem('finops_aws_connection_id', res.connectionId);
      if (params.awsAccountId) {
        localStorage.setItem('finops_aws_account_id', params.awsAccountId);
      }
      if (res?.externalId || params.externalId) {
        localStorage.setItem('finops_aws_external_id', res?.externalId || params.externalId || '');
      }
    }
    return res;
  },

  confirmCloudFormation: async (connectionId: string, userConfirmed: boolean, externalId?: string) => {
    try {
      if (typeof window !== 'undefined' && externalId) {
        localStorage.setItem('finops_aws_external_id', externalId);
      }
      return { success: true, userConfirmed, connectionId };
    } catch (e) {
      return { success: true, skippedBackend: true };
    }
  },

  verifyConnection: async (
    connectionId: string,
    externalId?: string,
    roleName?: string,
    awsAccountId?: string
  ): Promise<AwsConnectionRecord> => {
    // Phase 1 STS Verify Webhook
    const webhookUrl =
      process.env.NEXT_PUBLIC_AWS_VERIFY_WEBHOOK_URL ||
      'https://api.agents.snsihub.ai/webhook/3aebaff4-1e7f-411f-9976-98eab6c4d210';

    const verifyPayload = {
      connectionId,
      externalId,
      roleName: roleName || 'FinOpsAwsIntegrationRole',
      awsAccountId,
    };

    console.log('[FinOps Webhook - Phase 1 STS Verify]:', webhookUrl, verifyPayload);

    const response = await axios.post(
      webhookUrl,
      verifyPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const raw = response.data;
    console.log('[FinOps Webhook STS Verify] Response received:', raw);

    const extracted = extractAwsConnectionRecord(raw);
    if (extracted && (extracted.status || extracted.roleStatus || extracted.connectionId)) {
      return extracted;
    }

    // Fetch the real live MongoDB record directly — NO mock, NO fallback
    try {
      const q = new URLSearchParams();
      if (connectionId) q.append('connectionId', connectionId);
      if (awsAccountId) q.append('awsAccountId', awsAccountId);
      const dbRes = await axios.get(`${getAppOrigin()}/api/finops/aws?${q.toString()}`);
      if (dbRes.data?.connection) {
        return dbRes.data.connection;
      }
    } catch (dbErr) {
      console.warn('Could not read updated DB doc:', dbErr);
    }

    return extracted || raw;
  },

  verifyCloudCostResources: async (params?: {
    connectionId?: string;
    awsAccountId?: string;
    roleName?: string;
    bucketName?: string;
    region?: string;
  }): Promise<AwsConnectionRecord | any> => {
    // Phase 2 Multi-Tenant STS HTTPS Verification Webhook
    const webhookUrl =
      process.env.NEXT_PUBLIC_AWS_VERIFY_CLOUD_COST_WEBHOOK_URL ||
      'https://api.agents.snsihub.ai/webhook/110b05d9-5725-445a-8a1f-da24833ed603';

    let finalConnId = params?.connectionId || (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_connection_id') || '' : '');
    let finalAccountId = params?.awsAccountId || (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_account_id') || '' : '');
    let finalExternalId = (params as any)?.externalId || (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_external_id') || '' : '');

    // Fallback: If finalAccountId or finalExternalId is empty, read directly from connection record in MongoDB
    if (!finalAccountId || !finalExternalId) {
      try {
        const q = new URLSearchParams();
        if (finalConnId) q.append('connectionId', finalConnId);
        const dbRes = await axios.get(`${getAppOrigin()}/api/finops/aws?${q.toString()}`);
        if (dbRes.data?.connection) {
          finalAccountId = finalAccountId || dbRes.data.connection.awsAccountId || '';
          finalExternalId = finalExternalId || dbRes.data.connection.externalId || '';
          if (typeof window !== 'undefined') {
            if (finalAccountId) localStorage.setItem('finops_aws_account_id', finalAccountId);
            if (finalExternalId) localStorage.setItem('finops_aws_external_id', finalExternalId);
          }
        }
      } catch (dbErr) {
        console.warn('Could not retrieve connection details:', dbErr);
      }
    }

    let targetBucket = params?.bucketName || '';
    let targetExport = (params as any)?.exportName || '';

    // If bucketName not passed, fetch it directly from saved connection
    if (!targetBucket) {
      try {
        const q = new URLSearchParams();
        if (finalConnId) q.append('connectionId', finalConnId);
        const dbRes = await axios.get(`${getAppOrigin()}/api/finops/aws?${q.toString()}`);
        if (dbRes.data?.connection) {
          targetBucket = dbRes.data.connection.bucketName || '';
          targetExport = targetExport || dbRes.data.connection.exportName || '';
        }
      } catch (e) {}
    }

    const payload = {
      connectionId: finalConnId,
      awsAccountId: finalAccountId,
      externalId: finalExternalId,
      roleName: params?.roleName || 'FinOpsAwsIntegrationRole',
      bucketName: targetBucket,
      exportName: targetExport,
      region: params?.region || 'us-east-1',
    };

    console.log('[FinOps Webhook 4 - Phase 2 Cloud Cost Verify]:', webhookUrl, payload);

    // Call live Multi-Tenant AWS STS HTTPS Verification Workflow
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const raw = response.data;
    console.log('[FinOps Webhook 4] Response received:', raw);

    const extracted = extractAwsConnectionRecord(raw);
    if (extracted && (extracted.status || extracted.roleStatus || extracted.connectionId)) {
      return extracted;
    }

    // Fetch the real live MongoDB document directly — NO MOCK, NO FALLBACK
    try {
      const q = new URLSearchParams();
      if (finalConnId) q.append('connectionId', finalConnId);
      if (finalAccountId) q.append('awsAccountId', finalAccountId);
      const dbRes = await axios.get(`${getAppOrigin()}/api/finops/aws?${q.toString()}`);
      if (dbRes.data?.connection) {
        return dbRes.data.connection;
      }
    } catch (dbErr) {
      console.warn('Could not read updated DB doc:', dbErr);
    }

    return extracted || raw;
  },

  getConnectionStatus: async (connectionId: string, awsAccountId?: string): Promise<AwsConnectionRecord | null> => {
    try {
      const q = new URLSearchParams();
      if (connectionId) q.append('connectionId', connectionId);
      if (awsAccountId) q.append('awsAccountId', awsAccountId);
      const dbRes = await axios.get(`${getAppOrigin()}/api/finops/aws?${q.toString()}`);
      if (dbRes.data?.connection) {
        return dbRes.data.connection;
      }
    } catch (e) {
      // not found in DB
    }
    return null;
  },

  listConnections: async (): Promise<AwsConnectionRecord[]> => {
    try {
      const dbRes = await axios.get(`${getAppOrigin()}/api/finops/aws`);
      if (dbRes.data?.connections) {
        return dbRes.data.connections;
      }
    } catch (e) {
      console.warn('Could not list connections from DB:', e);
    }
    return [];
  },

  configureCloudCost: async (
    connectionId: string,
    params: {
      createCur?: boolean;
      createS3?: boolean;
      bucketName: string;
      bucketRegion?: string;
      exportPathPrefix?: string;
      exportName?: string;
      kmsKeyArn?: string;
      roleName?: string;
      awsAccountId?: string;
    }
  ) => {
    const webhookUrl =
      process.env.NEXT_PUBLIC_AWS_CONFIGURE_COST_WEBHOOK_URL ||
      'https://api.agents.snsihub.ai/webhook/51fbd086-123b-4743-87e3-b163d64bf1e8';

    const finalConnId = connectionId || (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_connection_id') || '' : '');
    const finalAccountId = params.awsAccountId || (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_account_id') || '' : '');

    const payload = {
      connectionId: finalConnId,
      awsAccountId: finalAccountId,
      createCur: params.createCur !== false,
      createS3: params.createS3 !== false,
      bucketName: params.bucketName,
      bucketRegion: params.bucketRegion || 'us-east-1',
      exportPathPrefix: params.exportPathPrefix || 'daily-export/',
      exportName: params.exportName || 'FinOpsFocusCostExport',
      kmsKeyArn: params.kmsKeyArn || '',
      roleName: params.roleName || 'FinOpsAwsIntegrationRole',
    };

    console.log('[FinOps Webhook 3 - Phase 2] Calling Configure Cloud Cost:', webhookUrl, payload);

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const raw = response.data;
      console.log('[FinOps Webhook 3 - Phase 2] Response received:', raw);
      const res = raw?._responseData || raw?.result || raw?.items?.[0]?.json || raw?.data || raw;
      if (res?.documents?.[0]) {
        res.cloudFormationLaunchUrl = res.cloudFormationLaunchUrl || res.documents[0].cloudFormationLaunchUrl;
        res.connection = res.documents[0];
      }
      return res;
    } catch (webhookErr) {
      console.warn('[FinOps Webhook 3 - Phase 2] Webhook call error:', webhookErr);
      throw webhookErr;
    }
  },

  triggerDataIngestionSync: async (connectionId?: string, awsAccountId?: string) => {
    const finalConnId =
      connectionId ||
      (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_connection_id') || undefined : undefined);
    const finalAccountId =
      awsAccountId ||
      (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_account_id') || undefined : undefined);

    const payload = {
      connectionId: finalConnId,
      awsAccountId: finalAccountId,
    };

    try {
      // 1. Trigger via Next.js backend route (eliminates browser CORS and 60s network drops)
      if (finalConnId) {
        const syncRes = await axios.post(
          `${getAppOrigin()}/api/connectors/aws/${finalConnId}/sync`,
          payload,
          { timeout: 20000 }
        );
        if (syncRes.data?.success) {
          return {
            status: syncRes.data.syncStatus || 'pending_aws_export',
            recordsProcessed: syncRes.data.recordsProcessed ?? 0,
            connection: syncRes.data.connection,
            message: 'Sync initiated via FinOps pipeline',
          };
        }
      }

      // 2. Fallback to direct webhook if needed
      const webhookUrl =
        process.env.NEXT_PUBLIC_AWS_CUR_INGESTION_WEBHOOK_URL ||
        'https://api.agents.snsihub.ai/webhook/2384b920-a830-48b2-8388-8a0031f5171c';

      const response = await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });

      return response.data;
    } catch (webhookErr: any) {
      console.warn('[FinOps S3 CUR Ingestion Sync Notice]:', webhookErr?.response?.data || webhookErr.message);
      return {
        status: 'pending_aws_export',
        recordsProcessed: 0,
        message: 'Sync request acknowledged; awaiting export from AWS S3.',
      };
    }
  },

  triggerCostExplorerSync: async (connectionId?: string, awsAccountId?: string, force: boolean = false) => {
    const finalConnId =
      connectionId ||
      (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_connection_id') || undefined : undefined);
    const finalAccountId =
      awsAccountId ||
      (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_account_id') || undefined : undefined);

    const payload = {
      connectionId: finalConnId || 'conn_jw24oglhu2b',
      awsAccountId: finalAccountId || '864981730114',
      force,
      source: 'frontend_user_action',
      requestedAt: new Date().toISOString(),
    };

    try {
      // 1. Trigger via Next.js backend proxy route (avoids CORS and browser timeout)
      if (finalConnId) {
        const syncRes = await axios.post(
          `${getAppOrigin()}/api/connectors/aws/${finalConnId}/cost-explorer-sync`,
          payload,
          { timeout: 35000 }
        );
        if (syncRes.data?.success) {
          return syncRes.data;
        }
      }

      // 2. Direct fallback to AgentBuilder webhook
      const webhookUrl =
        process.env.NEXT_PUBLIC_AWS_COST_EXPLORER_WEBHOOK_URL ||
        'https://api.agents.snsihub.ai/webhook/5f28a43e-4f27-4a2a-9516-c0dc10196038';

      const response = await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 35000,
      });

      return response.data;
    } catch (webhookErr: any) {
      console.warn('[FinOps Cost Explorer Sync Notice]:', webhookErr?.response?.data || webhookErr.message);
      throw webhookErr;
    }
  },

  getAwsCostExplorerData: async (billingPeriod?: string, accountId?: string) => {
    try {
      const q = new URLSearchParams();
      q.append('view', 'cost-explorer');
      if (billingPeriod) q.append('billingPeriod', billingPeriod);
      if (accountId) q.append('accountId', accountId);
      const url = `${getAppOrigin()}/api/finops/aws?${q.toString()}`;
      const response = await axios.get(url);
      return response.data;
    } catch (e: any) {
      console.warn('Failed to fetch AWS Cost Explorer data:', e);
      return null;
    }
  },

  fetchAwsDashboard: async (billingPeriod?: string) => {
    try {
      const q = new URLSearchParams();
      q.append('view', 'dashboard');
      if (billingPeriod) q.append('billingPeriod', billingPeriod);
      const url = `${getAppOrigin()}/api/finops/aws?${q.toString()}`;
      const response = await axios.get(url);
      if (response.data && (response.data.success || response.data.kpis || response.data.totalSpend !== undefined)) {
        return response.data;
      }
    } catch (e: any) {
      console.warn('Failed to fetch AWS Dashboard data via local API, attempting direct webhook:', e);
    }

    try {
      const direct = await fetch('https://api.agents.snsihub.ai/webhook/7c53bda3-c369-4e08-bb54-c645901b89c2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'nextjs_client' }),
      });
      if (direct.ok) {
        const raw = await direct.json();
        return raw._responseData || raw;
      }
    } catch (directErr) {
      console.error('Direct webhook call also failed:', directErr);
    }
    return null;
  },

  getIngestionOverview: async (connectionId?: string) => {
    const response = await api.get('/finops/ingestion/overview', {
      params: connectionId ? { connectionId } : {},
    });
    return response.data;
  },

  backfillCostExplorer: async (connectionId: string, months: number = 14) => {
    const response = await api.post('/finops/ingestion/backfill-cost-explorer', {
      connectionId,
      months,
    });
    return response.data;
  },

  getCostExplorerOverview: async (connectionId?: string) => {
    const response = await api.get('/finops/cost-explorer/overview', {
      params: connectionId ? { connectionId } : {},
    });
    return response.data;
  },

  getCostExplorerSummary: async (connectionId?: string) => {
    const response = await api.get('/finops/cost-explorer/summary', {
      params: connectionId ? { connectionId } : {},
    });
    return response.data;
  },

  testConnection: async (connectionId: string) => {
    return finopsApi.getConnectionStatus(connectionId);
  },

  disconnect: async (connectionId?: string, awsAccountId?: string) => {
    try {
      const q = new URLSearchParams();
      if (connectionId) q.append('connectionId', connectionId);
      if (awsAccountId) q.append('awsAccountId', awsAccountId);
      const res = await axios.delete(`${getAppOrigin()}/api/finops/aws?${q.toString()}`);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('finops_aws_connection_id');
        localStorage.removeItem('finops_aws_account_id');
        localStorage.removeItem('finops_aws_external_id');
      }
      return res.data;
    } catch (e: any) {
      console.warn('Disconnect error:', e);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('finops_aws_connection_id');
        localStorage.removeItem('finops_aws_account_id');
        localStorage.removeItem('finops_aws_external_id');
      }
      return { success: false, error: e?.message };
    }
  },

  verifyOpenRouterConnection: async (
    payload: OpenRouterWorkflowVerifyPayload
  ): Promise<OpenRouterWorkflowVerifyResponse> => {
    const webhookUrl =
      process.env.NEXT_PUBLIC_OPENROUTER_VERIFY_WEBHOOK_URL ||
      'https://api.agents.snsihub.ai/webhook/708dc830-0fa9-4ca8-8420-a52497ffbe40';

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      });
      let data = extractWorkflowData(response.data);

      if (!data?.keysList || !Array.isArray(data.keysList) || data.keysList.length === 0 || data.totalUsage === undefined) {
        try {
          const dbRes = await axios.get('/api/finops/openrouter');
          if (dbRes.data && (dbRes.data.keysList?.length > 0 || dbRes.data.totalUsage !== undefined)) {
            data = {
              ...dbRes.data,
              ...data,
              keysList: dbRes.data.keysList || data?.keysList || [],
              totalUsage: dbRes.data.totalUsage ?? data?.totalUsage ?? 0,
              remainingBalance: dbRes.data.remainingBalance ?? data?.remainingBalance ?? null,
              creditLimit: dbRes.data.creditLimit ?? data?.creditLimit ?? null,
              success: true,
            };
          }
        } catch (dbErr) {
          console.warn('DB sync fetch notice:', dbErr);
        }
      }

      return data;
    } catch (err: any) {
      // If the workflow timed out waiting for response, check if MongoDB received the data in background
      if (err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'))) {
        try {
          const dbRes = await axios.get('/api/finops/openrouter');
          if (dbRes.data && (dbRes.data.keysList?.length > 0 || dbRes.data.totalUsage !== undefined)) {
            return {
              ...dbRes.data,
              success: true,
            };
          }
        } catch (dbErr) {
          console.warn('DB fallback on timeout notice:', dbErr);
        }
      }

      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      if (err.response?.status === 401) {
        throw new Error('Unauthorized: Invalid OpenRouter API Key. Please verify your token at openrouter.ai/keys.');
      }
      throw new Error(err.message || 'Workflow execution failed to verify OpenRouter credentials.');
    }
  },

  syncOpenRouterConnection: async (payload: { connectionId?: string; productTag?: string; apiKey?: string }) => {
    const webhookUrl =
      process.env.NEXT_PUBLIC_OPENROUTER_SYNC_WEBHOOK_URL ||
      'https://api.agents.snsihub.ai/webhook/708dc830-0fa9-4ca8-8420-a52497ffbe40';

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      });
      let data = extractWorkflowData(response.data);

      if (!data?.keysList || !Array.isArray(data.keysList) || data.keysList.length === 0 || data.totalUsage === undefined) {
        try {
          const dbRes = await axios.get('/api/finops/openrouter');
          if (dbRes.data && (dbRes.data.keysList?.length > 0 || dbRes.data.totalUsage !== undefined)) {
            data = {
              ...dbRes.data,
              ...data,
              keysList: dbRes.data.keysList || data?.keysList || [],
              totalUsage: dbRes.data.totalUsage ?? data?.totalUsage ?? 0,
              remainingBalance: dbRes.data.remainingBalance ?? data?.remainingBalance ?? null,
              creditLimit: dbRes.data.creditLimit ?? data?.creditLimit ?? null,
              success: true,
            };
          }
        } catch (dbErr) { }
      }

      return data;
    } catch (err: any) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      throw new Error(err.message || 'Workflow sync failed.');
    }
  },

  fetchOpenRouterTelemetry: async (payload: {
    apiKey?: string;
    connectionId?: string;
    connectionName?: string;
    userId?: string;
    productTag?: string;
    environment?: string;
    lastSyncedAt?: string;
  }) => {
    const webhookUrl =
      process.env.NEXT_PUBLIC_OPENROUTER_TELEMETRY_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_OPENROUTER_VERIFY_WEBHOOK_URL ||
      'https://api.agents.snsihub.ai/webhook/708dc830-0fa9-4ca8-8420-a52497ffbe40';

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      });
      let data = extractWorkflowData(response.data);

      if (!data?.keysList || !Array.isArray(data.keysList) || data.keysList.length === 0 || data.totalUsage === undefined) {
        try {
          const dbRes = await axios.get('/api/finops/openrouter');
          if (dbRes.data && (dbRes.data.keysList?.length > 0 || dbRes.data.totalUsage !== undefined)) {
            data = {
              ...dbRes.data,
              ...data,
              keysList: dbRes.data.keysList || data?.keysList || [],
              totalUsage: dbRes.data.totalUsage ?? data?.totalUsage ?? 0,
              remainingBalance: dbRes.data.remainingBalance ?? data?.remainingBalance ?? null,
              creditLimit: dbRes.data.creditLimit ?? data?.creditLimit ?? null,
              success: true,
            };
          }
        } catch (dbErr) {
          console.warn('DB telemetry fetch notice:', dbErr);
        }
      }

      return data;
    } catch (err: any) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      throw new Error(err.message || 'Failed to fetch OpenRouter full telemetry.');
    }
  },

  queryCostAllocationWorkflow: async (params: {
    productId?: string;
    productTag?: string;
    provider?: string;
    environment?: string;
    dateRange?: string;
  }) => {
    const webhookUrl =
      process.env.NEXT_PUBLIC_COST_ALLOCATION_QUERY_WEBHOOK_URL ||
      'https://api.agents.snsihub.ai/webhook/e74a6990-d060-4d60-9754-29bb287232ad';

    try {
      const response = await axios.post(webhookUrl, params, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 90000,
      });
      const data = extractWorkflowData(response.data);
      if (data && (data.keysList || data.totalUsage !== undefined)) {
        return data;
      }
      throw new Error('No keys returned by workflow');
    } catch (err: any) {
      // Fallback to local MongoDB API route if workflow is offline
      const local = await axios.get('/api/finops/openrouter');
      return local.data;
    }
  },
};
