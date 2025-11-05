// app/settings/integrations/page.tsx
"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { useIntegrations } from '@/hooks/useIntegrations';
import { toast } from '@/lib/toast';
import Sidebar from '@/components/SidebarClient';
import { IntegrationStatusCard } from '@/components/integrations/IntegrationStatusCard';
import { SyncDashboard } from '@/components/integrations/SyncDashboard';
import { SyncHistory } from '@/components/integrations/SyncHistory';
import { ExportButtons } from '@/components/integrations/ExportButtons';
import { FortnoxConnectButton } from '@/components/integrations/FortnoxConnectButton';
import { VismaConnectButton } from '@/components/integrations/VismaConnectButton';
import { Loader2, Lock, Plug2, CheckCircle2, XCircle, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

/**
 * En intern komponent för att hantera sökparametrar från OAuth callback.
 */
function OAuthCallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected === 'fortnox') {
      toast.success('Fortnox har anslutits!');
    } else if (connected === 'visma') {
      toast.success('Visma har anslutits!');
    } else if (error) {
      toast.error(`Anslutning misslyckades: ${decodeURIComponent(error)}`);
    }
  }, [searchParams]);

  return null;
}

export default function IntegrationsPage() {
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const { data: integrations, isLoading: isLoadingIntegrations, isError, error } = useIntegrations();
  
  // Hitta alla integrationer (Fortnox, Visma eAccounting, Visma Payroll)
  const fortnoxIntegration = integrations?.find(int => int.provider === 'fortnox');
  const vismaEAccountingIntegration = integrations?.find(int => int.provider === 'visma_eaccounting');
  const vismaPayrollIntegration = integrations?.find(int => int.provider === 'visma_payroll');

  const connectedCount = [fortnoxIntegration, vismaEAccountingIntegration, vismaPayrollIntegration]
    .filter(int => int?.status === 'connected').length;

  if (isAdminLoading || isLoadingIntegrations) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 w-full lg:ml-0 overflow-x-hidden">
          <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Laddar integrationer...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 w-full lg:ml-0 overflow-x-hidden">
          <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-full p-4 mb-4">
              <Lock className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Åtkomst nekad</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Denna sida är endast tillgänglig för administratörer.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    console.error('Error loading integrations:', error);
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 w-full lg:ml-0 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-900 dark:text-red-200">
                    Kunde inte ladda integrationer
                  </h2>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error instanceof Error ? error.message : 'Ett oväntat fel uppstod'}
                  </p>
                </div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-red-100 dark:border-red-900/30">
                <p className="font-semibold text-red-800 dark:text-red-200 mb-1.5 text-xs">Troubleshooting:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-red-700 dark:text-red-300">
                  <li>Kontrollera att du är inloggad</li>
                  <li>Kontrollera att integrations-tabellen finns i Supabase (kör CREATE_INTEGRATIONS_TABLES.sql)</li>
                  <li>Kontrollera server console för mer detaljerad information</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 w-full lg:ml-0 overflow-x-hidden">
        <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
          <OAuthCallbackHandler />
          <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {/* Premium Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-xl blur-lg opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-xl p-3 shadow-lg">
                    <Plug2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                    Integrationer
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Anslut till externa tjänster för automatisk synkronisering
                  </p>
                </div>
              </div>
              {connectedCount > 0 && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    {connectedCount} {connectedCount === 1 ? 'integration ansluten' : 'integrationer anslutna'}
                  </span>
                </div>
              )}
            </div>

            {/* Premium Integration Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
              {/* Fortnox Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-md opacity-50"></div>
                      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 shadow-md">
                        <span className="text-xl font-black text-white">F</span>
                      </div>
                    </div>
                    {fortnoxIntegration && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        fortnoxIntegration.status === 'connected' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : fortnoxIntegration.status === 'error'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {fortnoxIntegration.status === 'connected' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : fortnoxIntegration.status === 'error' ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span className="capitalize">{fortnoxIntegration.status === 'connected' ? 'Ansluten' : fortnoxIntegration.status === 'error' ? 'Fel' : 'Frånkopplad'}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Fortnox</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                    Fakturering, kunder och projekt
                  </p>
                  <div className="mt-auto">
                    {fortnoxIntegration ? (
                      <IntegrationStatusCard integration={fortnoxIntegration} />
                    ) : (
                      <FortnoxConnectButton />
                    )}
                  </div>
                </div>
              </div>

              {/* Visma eAccounting Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl blur-md opacity-50"></div>
                      <div className="relative bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-3 shadow-md">
                        <span className="text-xl font-black text-white">VE</span>
                      </div>
                    </div>
                    {vismaEAccountingIntegration && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        vismaEAccountingIntegration.status === 'connected' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : vismaEAccountingIntegration.status === 'error'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {vismaEAccountingIntegration.status === 'connected' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : vismaEAccountingIntegration.status === 'error' ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span className="capitalize">{vismaEAccountingIntegration.status === 'connected' ? 'Ansluten' : vismaEAccountingIntegration.status === 'error' ? 'Fel' : 'Frånkopplad'}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Visma eAccounting</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                    Fakturering och bokföring
                  </p>
                  <div className="mt-auto">
                    {vismaEAccountingIntegration ? (
                      <IntegrationStatusCard integration={vismaEAccountingIntegration} />
                    ) : (
                      <VismaConnectButton provider="visma_eaccounting" />
                    )}
                  </div>
                </div>
              </div>

              {/* Visma Payroll Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl blur-md opacity-50"></div>
                      <div className="relative bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-3 shadow-md">
                        <span className="text-xl font-black text-white">VP</span>
                      </div>
                    </div>
                    {vismaPayrollIntegration && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        vismaPayrollIntegration.status === 'connected' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : vismaPayrollIntegration.status === 'error'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {vismaPayrollIntegration.status === 'connected' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : vismaPayrollIntegration.status === 'error' ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span className="capitalize">{vismaPayrollIntegration.status === 'connected' ? 'Ansluten' : vismaPayrollIntegration.status === 'error' ? 'Fel' : 'Frånkopplad'}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Visma Payroll</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                    Lönespec och tidsrapportering
                  </p>
                  <div className="mt-auto">
                    {vismaPayrollIntegration ? (
                      <IntegrationStatusCard integration={vismaPayrollIntegration} />
                    ) : (
                      <VismaConnectButton provider="visma_payroll" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Integrations Details - Premium Cards */}
            {fortnoxIntegration?.status === 'connected' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manuell Export</h2>
                  </div>
                  <ExportButtons integrationId={fortnoxIntegration.id} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Synkroniseringskö</h2>
                  </div>
                  <SyncDashboard integrationId={fortnoxIntegration.id} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
                      <Plug2 className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Synkroniseringshistorik</h2>
                  </div>
                  <SyncHistory integrationId={fortnoxIntegration.id} />
                </div>
              </div>
            )}
          </div>
        </Suspense>
      </main>
    </div>
  );
}
