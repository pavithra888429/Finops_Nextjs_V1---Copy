"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DetailHeader } from "@/components/cost-allocation/detail/DetailHeader";
import { DetailFilters } from "@/components/cost-allocation/detail/DetailFilters";
import { DetailKpis } from "@/components/cost-allocation/detail/DetailKpis";
import { DetailCostTrendChart } from "@/components/cost-allocation/detail/DetailCostTrendChart";
import { CostByServiceCard } from "@/components/cost-allocation/detail/CostByServiceCard";
import { CostByRegionCard } from "@/components/cost-allocation/detail/CostByRegionCard";
import { CostByAccountEnvCard } from "@/components/cost-allocation/detail/CostByAccountEnvCard";
import { UsagePurchaseBreakdownCard } from "@/components/cost-allocation/detail/UsagePurchaseBreakdownCard";
import { CostAttributionCard } from "@/components/cost-allocation/detail/CostAttributionCard";
import { TopCostDriversTable } from "@/components/cost-allocation/detail/TopCostDriversTable";
import { DetailedUsageTable } from "@/components/cost-allocation/detail/DetailedUsageTable";
import { DetailStatusBar } from "@/components/cost-allocation/detail/DetailStatusBar";
import { OpenRouterDetailView } from "@/components/cost-allocation/detail/OpenRouterDetailView";
import { Footer } from "@/components/layout/Footer";

function ProductProviderDetailContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product") || "workbench";
  const providerId = searchParams.get("provider") || "aws";

  const getProductName = (id: string) => {
    if (id === "dragon") return "Dragon Suite";
    if (id === "okrian") return "Okrian";
    if (id === "unallocated") return "Unallocated";
    return "Workbench";
  };

  const getProviderName = (id: string) => {
    if (id === "gemini") return "Gemini";
    if (id === "openrouter") return "OpenRouter";
    return "AWS";
  };

  const productName = getProductName(productId);
  const providerName = getProviderName(providerId);
  const router = useRouter();

  if (providerId === "openrouter") {
    return (
      <div className="w-full flex-1 flex flex-col justify-between font-sans selection:bg-purple-600 selection:text-white">
        <main className="w-full max-w-[1600px] mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-5 space-y-4">
          <OpenRouterDetailView
            productId={productId}
            productName={productName}
            providerId={providerId}
            providerName={providerName}
            onBack={() => router.push('/cost-allocation')}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Filter states
  const [dateRange, setDateRange] = useState("last30");
  const [comparePeriod, setComparePeriod] = useState("prev30");
  const [environment, setEnvironment] = useState("production");
  const [account, setAccount] = useState("all");
  const [region, setRegion] = useState("all");
  const [service, setService] = useState("all");
  const [groupBy, setGroupBy] = useState("service");

  const handleResetFilters = () => {
    setDateRange("last30");
    setComparePeriod("prev30");
    setEnvironment("production");
    setAccount("all");
    setRegion("all");
    setService("all");
    setGroupBy("service");
  };

  // Metrics tuned to selected product
  const getProductMetrics = () => {
    if (productId === "okrian") {
      return {
        totalCost: 9500.00,
        periodChange: 9.8,
        dailyAvg: 316.67,
        topService: "Amazon EC2",
        topServiceCost: 4820.00,
        topServiceShare: 50.7,
        topRegion: "us-east-1",
        topRegionCost: 5900.00,
        topRegionShare: 62.1,
        topAccount: "Okrian Production",
        topAccountCost: 7100.00,
        topAccountShare: 74.7,
        resourceCoverage: 89.2,
      };
    }
    if (productId === "dragon") {
      return {
        totalCost: 11000.20,
        periodChange: 14.2,
        dailyAvg: 366.67,
        topService: "Amazon EKS",
        topServiceCost: 5200.00,
        topServiceShare: 47.3,
        topRegion: "us-east-1",
        topRegionCost: 6800.00,
        topRegionShare: 61.8,
        topAccount: "Dragon Suite Production",
        topAccountCost: 8400.00,
        topAccountShare: 76.4,
        resourceCoverage: 91.5,
      };
    }
    // Default: Workbench from the reference image
    return {
      totalCost: 8049.40,
      periodChange: 13.5,
      dailyAvg: 268.31,
      topService: "Amazon EKS",
      topServiceCost: 3420.80,
      topServiceShare: 42.5,
      topRegion: "us-east-1",
      topRegionCost: 4820.20,
      topRegionShare: 59.9,
      topAccount: "Workbench Production",
      topAccountCost: 5860.40,
      topAccountShare: 72.8,
      resourceCoverage: 86.4,
    };
  };

  const metrics = getProductMetrics();

  return (
    <div className="w-full flex-1 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Main Content Area */}
      <main className="w-full max-w-[1600px] mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        
        {/* 1. Header (Back button, Breadcrumb, Title, Product/Provider Badges) */}
        <DetailHeader
          productId={productId}
          productName={productName}
          providerId={providerId}
          providerName={providerName}
          onBack={() => router.push('/cost-allocation')}
        />

        {/* 2. Filter Toolbar (2 rows of dropdowns & chips) */}
        <DetailFilters
          productName={productName}
          providerName={providerName}
          dateRange={dateRange}
          setDateRange={setDateRange}
          comparePeriod={comparePeriod}
          setComparePeriod={setComparePeriod}
          environment={environment}
          setEnvironment={setEnvironment}
          account={account}
          setAccount={setAccount}
          region={region}
          setRegion={setRegion}
          service={service}
          setService={setService}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          onResetFilters={handleResetFilters}
          onRemoveProduct={() => router.push('/cost-allocation')}
          onRemoveProvider={() => router.push('/cost-allocation')}
        />

        {/* 3. 6 KPI Cards (AWS Cost, Daily Avg, Top Service, Top Region, Top Account, Resource Coverage Ring) */}
        <DetailKpis {...metrics} />

        {/* 4. Middle Section 1: Cost Trend (5 cols) + Cost by Service (4 cols) + Cost by Region (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-5">
            <DetailCostTrendChart productName={productName} providerName={providerName} />
          </div>
          <div className="lg:col-span-4">
            <CostByServiceCard />
          </div>
          <div className="lg:col-span-3">
            <CostByRegionCard />
          </div>
        </div>

        {/* 5. Middle Section 2: Account & Environment (4 cols) + Usage Breakdown (5 cols) + Cost Attribution (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-4">
            <CostByAccountEnvCard productName={productName} />
          </div>
          <div className="lg:col-span-5">
            <UsagePurchaseBreakdownCard />
          </div>
          <div className="lg:col-span-3">
            <CostAttributionCard productName={productName} />
          </div>
        </div>

        {/* 6. Bottom Section: Top Cost Drivers (5 cols) + Detailed AWS Usage (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-5">
            <TopCostDriversTable productName={productName} />
          </div>
          <div className="lg:col-span-7">
            <DetailedUsageTable productName={productName} />
          </div>
        </div>

        {/* 7. Bottom Status Bar */}
        <DetailStatusBar />

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function ProductProviderDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading detailed analytics...</div>}>
      <ProductProviderDetailContent />
    </Suspense>
  );
}
