import React from "react";
import { Cloud, Building2, Bell, ChevronDown, Menu } from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps = {}) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-dark-border bg-dark-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Menu toggle button + Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg border border-dark-border bg-dark-card text-slate-400 hover:text-white hover:border-dark-borderHover transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>
          )}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/15 text-blue-500 border border-blue-500/20">
            <Cloud className="h-5 w-5 fill-blue-500/20" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">
            FinOps Analytics
          </span>
        </div>

        {/* Center: System Status */}
        <div className="hidden md:flex items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>All systems operational</span>
          </div>
        </div>

        {/* Right: Organization & User */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Org Selector */}
          <button className="flex items-center gap-2 rounded-lg border border-dark-border bg-dark-card/60 px-3 py-1.5 text-xs font-medium text-dark-text hover:border-dark-borderHover hover:text-white transition-colors">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Acme Organization</span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </button>

          {/* Notifications */}
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-dark-border bg-dark-card/60 text-dark-text hover:text-white transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-dark-bg" />
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2.5 rounded-lg border border-dark-border bg-dark-card/60 pl-1 pr-2.5 py-1 text-xs font-medium text-white hover:border-dark-borderHover transition-colors">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white uppercase">
              SK
            </div>
            <span className="hidden sm:inline">Suresh K</span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </button>
        </div>

      </div>
    </header>
  );
}
