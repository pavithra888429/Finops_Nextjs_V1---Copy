import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').trim().replace(/\/+$/, '');
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
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
  verifiedAt?: string;
  bucketName?: string;
  exportName?: string;
  exportPathPrefix?: string;
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
      provider: params.provider || 'aws',
      connectionName: params.connectionName,
      region: params.region,
      awsAccountId: params.awsAccountId,
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
        process.env.NEXT_PUBLIC_FINOPS_PLATFORM_ACCOUNT_ID,
      templateUrl:
        process.env.NEXT_PUBLIC_FINOPS_CFN_TEMPLATE_URL ||
        'https://square-pulse-public.s3.ap-south-1.amazonaws.com/templates/finops-aws-cloud-cost-role.yaml',
    };
    const webhookUrl =
      process.env.NEXT_PUBLIC_AWS_START_WEBHOOK_URL ||
      'https://pavikali.app.n8n.cloud/webhook/finops-aws-start';
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const raw = response.data;
    return raw?._responseData || raw?.items?.[0]?.json || raw?.data || raw;
  },

  confirmCloudFormation: async (connectionId: string, userConfirmed: boolean, externalId?: string) => {
    try {
      const response = await api.post(`/connectors/aws/${connectionId}/cloudformation/confirm`, {
        userConfirmed,
        externalId,
      });
      return response.data;
    } catch (e) {
      // Backend may not be running if operating in pure serverless webhook mode
      return { success: true, skippedBackend: true };
    }
  },

  verifyConnection: async (
    connectionId: string,
    externalId?: string,
    roleName?: string,
    awsAccountId?: string
  ): Promise<AwsConnectionRecord> => {
    const webhookUrl =
      process.env.NEXT_PUBLIC_AWS_VERIFY_WEBHOOK_URL ||
      'https://testapi.agents.snsihub.ai/webhook/ce70f5bf-900e-46ab-bf1b-aa475f91b11d';
    const response = await axios.post(
      webhookUrl,
      {
        connectionId,
        externalId,
        roleName: roleName || 'FinOpsAwsIntegrationRole',
        awsAccountId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const raw = response.data;
    return raw?._responseData || raw?.items?.[0]?.json || raw?.data || raw;
  },

  getConnectionStatus: async (connectionId: string): Promise<AwsConnectionRecord | null> => {
    const response = await api.get(`/connectors/aws/${connectionId}`);
    return response.data;
  },

  listConnections: async (): Promise<AwsConnectionRecord[]> => {
    const response = await api.get('/connectors');
    return response.data?.connections || [];
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
    }
  ) => {
    const response = await api.post(`/connectors/aws/${connectionId}/configure-cloud-cost`, params);
    return response.data;
  },

  triggerDataIngestionSync: async (connectionId?: string) => {
    const response = await api.post('/finops/ingestion/sync', { connectionId });
    return response.data;
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
    const response = await api.post(`/connectors/aws/${connectionId}/test`, {});
    return response.data;
  },

  disconnect: async (connectionId: string) => {
    const response = await api.delete(`/connectors/aws/${connectionId}`);
    return response.data;
  },

  verifyOpenRouterConnection: async (
    payload: OpenRouterWorkflowVerifyPayload
  ): Promise<OpenRouterWorkflowVerifyResponse> => {
    const webhookUrl =
      process.env.NEXT_PUBLIC_OPENROUTER_VERIFY_WEBHOOK_URL ||
      'https://api.agents.snsihub.ai/webhook/e9f53cdf-69b1-4668-8375-d5a8f133c6db';

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      });
      const raw = response.data;
      const unwrap = raw?._responseData || raw?.items?.[0]?.json || raw?.data || raw;
      return unwrap;
    } catch (err: any) {
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

  syncOpenRouterConnection: async (payload: { connectionId?: string; productTag?: string }) => {
    const webhookUrl =
      process.env.NEXT_PUBLIC_OPENROUTER_SYNC_WEBHOOK_URL ||
      'https://api.agents.snsihub.ai/webhook/e9f53cdf-69b1-4668-8375-d5a8f133c6db';

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      });
      const raw = response.data;
      const unwrap = raw?._responseData || raw?.items?.[0]?.json || raw?.data || raw;
      return unwrap;
    } catch (err: any) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      throw new Error(err.message || 'Workflow sync failed.');
    }
  },

  fetchOpenRouterTelemetry: async (payload: { apiKey?: string; connectionId?: string }) => {
    const webhookUrl =
      process.env.NEXT_PUBLIC_OPENROUTER_TELEMETRY_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_OPENROUTER_VERIFY_WEBHOOK_URL ||
      'https://api.agents.snsihub.ai/webhook/e9f53cdf-69b1-4668-8375-d5a8f133c6db';

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      const raw = response.data;
      const unwrap = raw?._responseData || raw?.items?.[0]?.json || raw?.data || raw;
      return unwrap;
    } catch (err: any) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      throw new Error(err.message || 'Failed to fetch OpenRouter full telemetry.');
    }
  },
};
