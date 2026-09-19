'use client';

export interface AwsAccount {
  id: string;
  name: string;
  accountId: string;
  region: string;
  connectedAt: string;
  lastSync: string;
  recordsProcessed: number;
  syncStatus: 'not_synced' | 'syncing' | 'synced' | 'failed';
}

const STORAGE_KEY = 'finops_store_state';

interface FinOpsState {
  isConnected: boolean;
  syncStatus: 'not_synced' | 'syncing' | 'synced' | 'failed';
  lastSync: string;
  recordsProcessed: number;
  accounts: AwsAccount[];
}

const DEFAULT_STATE: FinOpsState = {
  isConnected: false,
  syncStatus: 'synced',
  lastSync: 'August 22, 2026',
  recordsProcessed: 9495,
  accounts: [],
};

function getStoredState(): FinOpsState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not parse finops store state:', e);
  }
  return DEFAULT_STATE;
}

function saveState(state: FinOpsState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('finops_store_update'));
  } catch (e) {
    console.warn('Could not save finops store state:', e);
  }
}

export const finopsStore = {
  getState: (): FinOpsState => getStoredState(),
  
  connectAws: (accountDetails?: Partial<AwsAccount>) => {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const accountId = accountDetails?.accountId || '864981730114';
    const newAccount: AwsAccount = {
      id: accountDetails?.id || `aws-${accountId}`,
      name: accountDetails?.name || 'Production AWS Account',
      accountId: accountId,
      region: accountDetails?.region || 'us-east-1',
      connectedAt: formattedDate,
      lastSync: formattedDate,
      recordsProcessed: accountDetails?.recordsProcessed || 9495,
      syncStatus: 'synced',
    };

    saveState({
      isConnected: true,
      syncStatus: 'synced',
      lastSync: formattedDate,
      recordsProcessed: newAccount.recordsProcessed,
      accounts: [newAccount],
    });
  },

  disconnectAws: () => {
    saveState({
      isConnected: false,
      syncStatus: 'not_synced',
      lastSync: '',
      recordsProcessed: 0,
      accounts: [],
    });
  },
};
