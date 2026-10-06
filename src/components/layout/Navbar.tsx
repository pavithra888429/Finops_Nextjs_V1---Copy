import React from "react";
import { Cloud, Building2, Bell, ChevronDown, Menu } from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps = {}) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Menu toggle button + Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>
          )}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
            <Cloud className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-base font-semibold tracking-tight text-slate-900">
            FinOps Analytics
          </span>
        </div>

        {/* Center: System Status */}
        <div className="hidden md:flex items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>All systems operational</span>
          </div>
        </div>

        {/* Right: Organization & User */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Org Selector */}
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Acme Organization</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {/* Notifications */}
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-purple-600" />
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white pl-1 pr-2.5 py-1 text-xs font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white font-sans">
              SK
            </div>
            <span className="hidden sm:inline">Suresh K</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </div>

      </div>
    </header>
  );
}
