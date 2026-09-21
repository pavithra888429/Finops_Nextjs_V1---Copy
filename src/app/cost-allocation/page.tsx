"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CostAllocationKpis } from "@/components/cost-allocation/CostAllocationKpis";
import { CostAllocationFilters } from "@/components/cost-allocation/CostAllocationFilters";
import { ProductProviderMatrix } from "@/components/cost-allocation/ProductProviderMatrix";
import { ProductCostTrendChart } from "@/components/cost-allocation/ProductCostTrendChart";
import { ProviderDistributionChart } from "@/components/cost-allocation/ProviderDistributionChart";
import { ProductCostDetailsTable } from "@/components/cost-allocation/ProductCostDetailsTable";
import { Footer } from "@/components/layout/Footer";
import { BASE_PRODUCTS, ProductAllocationRecord } from "@/components/cost-allocation/costAllocationData";

// Detailed analytics subcomponents
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

function CostAllocationMain() {
  const searchParams = useSearchParams();
  const urlProduct = searchParams.get("product");
  const urlProvider = searchParams.get("provider");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(urlProduct || "all");
  const [selectedProvider, setSelectedProvider] = useState(urlProvider || "all");
  const [selectedEnv, setSelectedEnv] = useState("production");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [compareRange, setCompareRange] = useState("prevMonth");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Detailed view specific filter state
  const [detailAccount, setDetailAccount] = useState("all");
  const [detailRegion, setDetailRegion] = useState("all");
  const [detailService, setDetailService] = useState("all");
  const [detailGroupBy, setDetailGroupBy] = useState("service");

  // Determine if non-default filters are active in overview
  const hasActiveFilters =
    selectedProduct !== "all" ||
    selectedProvider !== "all" ||
    selectedEnv !== "production" ||
    selectedDateRange !== "all" ||
    searchQuery.trim() !== "";

  // Reset all overview filters to default
  const handleResetOverviewFilters = () => {
    setSelectedProduct("all");
    setSelectedProvider("all");
    setSelectedEnv("production");
    setSelectedDateRange("all");
    setCompareRange("prevMonth");
    setSearchQuery("");
  };

  // Reset detailed filters
  const handleResetDetailFilters = () => {
    setSelectedDateRange("all");
    setCompareRange("prevMonth");
    setSelectedEnv("production");
    setDetailAccount("all");
    setDetailRegion("all");
    setDetailService("all");
    setDetailGroupBy("service");
  };

  // Switch to detailed view when one specific product AND one specific provider are selected
  // OR when OpenRouter provider is selected (supporting "All Products" gateway drill-down view)
  const isDetailView =
    (selectedProduct !== "all" && selectedProvider !== "all") ||
    selectedProvider === "openrouter";

  // Name resolution
  const getProductName = (id: string) => {
    if (id === "all") return "All Products (OpenRouter Gateway)";
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

  const productName = getProductName(selectedProduct);
  const providerName = getProviderName(selectedProvider);

  // Environment and Date Range scaling multiplier for overview
  const multiplier = useMemo(() => {
    let envFactor = 1.0;
    if (selectedEnv === "staging") envFactor = 0.25;
    if (selectedEnv === "development") envFactor = 0.15;

    let dateFactor = 1.0;
    if (selectedDateRange && selectedDateRange !== "all") {
      // Month-specific variance e.g. "2026-09"
      const monthNum = parseInt(selectedDateRange.split("-")[1] || "9", 10);
      dateFactor = 0.88 + (monthNum * 0.02);
    }

    return envFactor * dateFactor;
  }, [selectedEnv, selectedDateRange]);

  // Scaled products data for overview
  const scaledProducts: ProductAllocationRecord[] = useMemo(() => {
    return BASE_PRODUCTS.map((p) => ({
      ...p,
      gemini: Math.round(p.gemini * multiplier * 100) / 100,
      openrouter: Math.round(p.openrouter * multiplier * 100) / 100,
      aws: Math.round(p.aws * multiplier * 100) / 100,
      total: Math.round(p.total * multiplier * 100) / 100,
      dailyAvg: Math.round(p.dailyAvg * multiplier * 100) / 100,
    }));
  }, [multiplier]);

  // Metrics customized for detailed view
  const detailMetrics = useMemo(() => {
    if (selectedProduct === "okrian") {
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
    if (selectedProduct === "dragon") {
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
    // Default Workbench (matching exact reference screenshot)
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
  }, [selectedProduct]);

  return (
    <div className="w-full flex-1 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {isDetailView ? (
        /* ========================================================================= */
        /* DETAILED ONE-PRODUCT × ONE-PROVIDER ANALYTICS VIEW (MATCHING SCREENSHOT)   */
        /* ========================================================================= */
        selectedProvider === "openrouter" ? (
          <main className="w-full max-w-[1600px] mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-5 space-y-4">
            <OpenRouterDetailView
              productId={selectedProduct}
              productName={productName}
              providerId={selectedProvider}
              providerName={providerName}
              onBack={() => {
                setSelectedProduct("all");
                setSelectedProvider("all");
              }}
            />
          </main>
        ) : (
        <main className="w-full max-w-[1600px] mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-5 space-y-4">
          {/* 1. Header (Back button, Breadcrumb, Title, Product/Provider Badges) */}
          <DetailHeader
            productId={selectedProduct}
            productName={productName}
            providerId={selectedProvider}
            providerName={providerName}
            onBack={() => {
              setSelectedProduct("all");
              setSelectedProvider("all");
            }}
          />

          {/* 2. Filter Toolbar (2 rows of dropdowns & active filter chips) */}
          <DetailFilters
            productName={productName}
            providerName={providerName}
            dateRange={selectedDateRange}
            setDateRange={setSelectedDateRange}
            comparePeriod={compareRange}
            setComparePeriod={setCompareRange}
            environment={selectedEnv}
            setEnvironment={setSelectedEnv}
            account={detailAccount}
            setAccount={setDetailAccount}
            region={detailRegion}
            setRegion={setDetailRegion}
            service={detailService}
            setService={setDetailService}
            groupBy={detailGroupBy}
            setGroupBy={setDetailGroupBy}
            onResetFilters={handleResetDetailFilters}
            onRemoveProduct={() => setSelectedProduct("all")}
            onRemoveProvider={() => setSelectedProvider("all")}
          />

          {/* 3. 6 KPI Cards (AWS Cost, Daily Avg, Top Service, Top Region, Top Account, Resource Coverage Ring) */}
          <DetailKpis {...detailMetrics} />

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
        )
      ) : (
        /* ========================================================================= */
        /* PRODUCT COST ALLOCATION MATRIX OVERVIEW VIEW                              */
        /* ========================================================================= */
        <main className="w-full max-w-[1600px] mx-auto flex-1 px-6 lg:px-10 py-6 space-y-5">
          {/* Page Header */}
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Product Cost Allocation
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                Analyze product spending across Gemini, OpenRouter, and AWS
              </p>
            </div>

            {/* Active Filter Badge indicator */}
            {hasActiveFilters && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <span>
                  Filtered by:{" "}
                  <strong className="text-white">
                    {[
                      selectedProduct !== "all" ? `Product: ${selectedProduct}` : null,
                      selectedProvider !== "all" ? `Provider: ${selectedProvider.toUpperCase()}` : null,
                      selectedEnv !== "production" ? `Env: ${selectedEnv}` : null,
                      selectedDateRange !== "last30" ? selectedDateRange : null,
                      searchQuery ? `"${searchQuery}"` : null,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </strong>
                </span>
                <button
                  onClick={handleResetOverviewFilters}
                  className="ml-1 text-[11px] underline text-slate-400 hover:text-white cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* 5 KPI Metric Cards (Interactive) */}
          <CostAllocationKpis
            products={scaledProducts}
            selectedProduct={selectedProduct}
            onProductClick={(pId) => {
              if (selectedProduct === pId) {
                setSelectedProduct("all");
              } else {
                setSelectedProduct(pId);
              }
            }}
            selectedProvider={selectedProvider}
            currencySymbol={selectedCurrency === "EUR" ? "€" : selectedCurrency === "GBP" ? "£" : "$"}
          />

          {/* Filter Toolbar (Interactive dropdowns & search) */}
          <CostAllocationFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedProduct={selectedProduct}
            onProductChange={setSelectedProduct}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            selectedEnv={selectedEnv}
            onEnvChange={setSelectedEnv}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
            compareRange={compareRange}
            onCompareRangeChange={setCompareRange}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
            onReset={handleResetOverviewFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Product × Provider Cost Matrix Table */}
          <ProductProviderMatrix
            products={scaledProducts}
            selectedProduct={selectedProduct}
            selectedProvider={selectedProvider}
            searchQuery={searchQuery}
            onSelectProductProvider={(productId, providerId) => {
              setSelectedProduct(productId);
              setSelectedProvider(providerId);
            }}
          />

          {/* 2-Column Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* Left Chart: Product Cost Trend */}
            <div className="w-full">
              <ProductCostTrendChart
                selectedProduct={selectedProduct}
                selectedProvider={selectedProvider}
              />
            </div>

            {/* Right Chart: Provider Distribution by Product */}
            <div className="w-full">
              <ProviderDistributionChart
                selectedProduct={selectedProduct}
                selectedProvider={selectedProvider}
              />
            </div>
          </div>

          {/* Product Cost Details Breakdown Table */}
          <ProductCostDetailsTable
            products={scaledProducts}
            selectedProduct={selectedProduct}
            selectedProvider={selectedProvider}
            searchQuery={searchQuery}
            onSelectProductProvider={(productId, providerId) => {
              setSelectedProduct(productId);
              setSelectedProvider(providerId);
            }}
          />
        </main>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function CostAllocationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading cost allocation...</div>}>
      <CostAllocationMain />
    </Suspense>
  );
}
