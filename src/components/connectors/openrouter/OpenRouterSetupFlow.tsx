'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { StepIndicator } from './StepIndicator';
import { OpenRouterConfiguration, OpenRouterFormData } from './OpenRouterConfiguration';
import { OpenRouterDataVerification, OpenRouterIngestionResult } from './OpenRouterDataVerification';
import { OpenRouterConnectedState, OpenRouterSavedConnection } from './OpenRouterConnectedState';
import { Footer } from '@/components/layout/Footer';

export function OpenRouterSetupFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode');

  const isExplicitNew = mode === 'new';
  const isExplicitDetails = mode === 'details';

  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<OpenRouterFormData>({
    connectionName: 'Production OpenRouter',
    apiKey: '',
    productTag: 'dragon',
    lowBalanceThreshold: 15.0,
  });

  const [activeConnection, setActiveConnection] = useState<OpenRouterSavedConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved connection from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('finops_openrouter_connection');
      if (saved) {
        const parsed: OpenRouterSavedConnection = JSON.parse(saved);
        const safeConnection: OpenRouterSavedConnection = {
          ...parsed,
          connectionName: parsed.connectionName || 'Production OpenRouter',
          productTag: parsed.productTag || 'dragon',
          lowBalanceThreshold: typeof parsed.lowBalanceThreshold === 'number' && !isNaN(parsed.lowBalanceThreshold)
            ? parsed.lowBalanceThreshold
            : 15.0,
          totalUsage: Number(parsed.totalUsage) || 0,
        };
        setActiveConnection(safeConnection);
        setFormData({
          connectionName: safeConnection.connectionName,
          apiKey: parsed.apiKey || '',
          productTag: safeConnection.productTag,
          lowBalanceThreshold: safeConnection.lowBalanceThreshold ?? 15.0,
        });

        // If user navigated to details mode or default without new flag, stay in details
        if (!isExplicitNew) {
          // In details mode
        }
      } else if (isExplicitDetails) {
        // If details requested but no connection saved, go to new setup
        router.replace('/connectors/openrouter?mode=new');
      }
    } catch (e) {
      console.warn('Failed to load saved OpenRouter connection', e);
    } finally {
      setIsLoading(false);
    }
  }, [isExplicitNew, isExplicitDetails, router]);

  // Step 1 Complete -> Move to Step 2 Verification
  const handleStep1Complete = (data: OpenRouterFormData) => {
    setFormData(data);
    setActiveStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Complete -> Persist & Navigate to Details
  const handleStep2Complete = (result: OpenRouterIngestionResult) => {
    const record: OpenRouterSavedConnection = {
      connectionId: result.connectionId,
      workspaceId: result.workspaceId,
      connectionName: formData.connectionName,
      apiKey: formData.apiKey,
      productTag: formData.productTag || 'SHARED_GATEWAY',
      lowBalanceThreshold: formData.lowBalanceThreshold,
      totalUsage: result.totalUsage,
      creditLimit: result.creditLimit,
      remainingBalance: result.remainingBalance,
      keyLabel: result.keyLabel,
      verifiedAt: result.lastSyncedAt,
      recordsIngested: result.recordsIngested,
      keysList: result.keysList,
    };

    try {
      localStorage.setItem('finops_openrouter_connection', JSON.stringify(record));
      window.dispatchEvent(new Event('finops_store_update'));
    } catch (e) {
      console.warn('Failed to save OpenRouter connection', e);
    }

    setActiveConnection(record);
    router.push('/connectors/openrouter?mode=details');
  };

  const isDetailsView = activeConnection && !isExplicitNew;

  return (
    <div className="w-full min-h-screen flex-1 flex flex-col justify-between font-sans bg-dark-bg selection:bg-blue-600 selection:text-white">
      <div className="w-full flex-1 flex justify-center px-4 sm:px-6 lg:px-8 py-6">
        <main className="w-full max-w-4xl space-y-6">
          
          {/* Header Banner matching AWS */}
          <div className="mb-8 border-b border-dark-border/80 pb-4">
            <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>FINOPS</span>
              <span className="text-slate-600">/</span>
              <span>CONNECTORS</span>
              <span className="text-slate-600">/</span>
              <span className="text-blue-400">
                {isDetailsView ? 'OPENROUTER DETAILS' : 'OPENROUTER SETUP'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {isDetailsView ? 'OpenRouter Connection Details' : 'Connect OpenRouter AI Gateway'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
              {isDetailsView
                ? 'Manage your OpenRouter connection, token synchronization, and allocation.'
                : 'Follow the steps below to connect your OpenRouter account and ingest token telemetry.'}
            </p>
          </div>

          {/* Details Mode vs Setup Mode */}
          {isLoading ? (
            <div className="py-20 text-center text-xs text-slate-500 font-mono">
              Loading OpenRouter connection state...
            </div>
          ) : isDetailsView ? (
            <OpenRouterConnectedState
              connection={activeConnection}
              onDisconnect={() => {
                setActiveConnection(null);
                router.push('/connectors');
              }}
              onUpdate={(updated) => {
                setActiveConnection(updated);
                try {
                  localStorage.setItem('finops_openrouter_connection', JSON.stringify(updated));
                } catch (e) {}
              }}
            />
          ) : (
            <>
              {/* Step Progress Indicator matching AWS */}
              <StepIndicator currentStep={activeStep} />

              {/* Step Container Card */}
              <div className="mt-6 rounded-2xl border border-dark-border bg-dark-card/90 p-6 sm:p-8 shadow-xl shadow-black/20">
                {activeStep === 1 && (
                  <OpenRouterConfiguration
                    initialData={formData}
                    onContinue={handleStep1Complete}
                  />
                )}

                {activeStep === 2 && (
                  <OpenRouterDataVerification
                    formData={formData}
                    onSuccess={handleStep2Complete}
                    onBack={() => setActiveStep(1)}
                  />
                )}
              </div>
            </>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
}
