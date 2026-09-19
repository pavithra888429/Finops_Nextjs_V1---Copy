'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Cloud,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  LogOut,
  PieChart,
} from 'lucide-react';

interface SidebarNavProps {
  collapsed: boolean;
  onToggle: () => void;
  showMobileFloatingToggle?: boolean;
}

export function SidebarNav({
  collapsed,
  onToggle,
  showMobileFloatingToggle = true,
}: SidebarNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (path: string) => {
    if (path === '/connectors') {
      return pathname === '/connectors' || pathname?.startsWith('/connectors');
    }
    return pathname === path;
  };

  const NavItem = ({
    icon: Icon,
    label,
    path,
    active,
    badge,
    onClick,
  }: {
    icon: any;
    label: string;
    path: string;
    active?: boolean;
    badge?: string;
    onClick?: () => void;
  }) => {
    return (
      <button
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            router.push(path);
          }
        }}
        className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs transition-all duration-200 group font-medium relative mb-0.5 rounded-lg ${
          active
            ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-sm'
            : 'text-slate-400 hover:bg-[#0f1627] hover:text-slate-100 hover:border hover:border-dark-border/60'
        } ${collapsed ? 'justify-center px-2' : ''}`}
        title={collapsed ? label : undefined}
      >
        {active && !collapsed && (
          <div className="absolute right-0 top-1 bottom-1 w-1 bg-blue-500 rounded-l-full shadow-sm shadow-blue-500/50" />
        )}
        <Icon
          size={16}
          className={`shrink-0 transition-transform duration-200 ${
            active
              ? 'text-blue-400'
              : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
          }`}
        />
        {!collapsed && <span className="truncate text-left">{label}</span>}
        {!collapsed && badge && (
          <span className="ml-auto text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {badge}
          </span>
        )}
      </button>
    );
  };

  const SectionHeader = ({ label }: { label: string }) => {
    if (collapsed) return <div className="h-3 my-1 border-t border-dark-border/40" />;
    return (
      <div className="px-3.5 mt-5 mb-1.5 flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em] whitespace-nowrap">
          {label}
        </span>
        <span className="flex-1 h-px bg-dark-border/60" />
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ${
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={onToggle}
      />

      <aside
        className={`h-full bg-[#070a11] border-r border-dark-border/80 flex flex-col transition-all duration-300 font-sans z-40 relative select-none ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'
        }`}
      >
        {/* Desktop Edge Toggle Chevron */}
        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 bg-[#0d1322] border border-dark-border hover:border-blue-500/50 rounded-full items-center justify-center shadow-lg text-slate-400 hover:text-white transition-all duration-200"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Top Header & Brand */}
        <div className="p-3.5 border-b border-dark-border/60">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Link href="/connectors" className="flex items-center gap-2.5 group">
                  <div className="relative h-8 w-8 rounded-lg bg-blue-600/15 border border-blue-500/25 flex items-center justify-center shadow-inner group-hover:border-blue-500/50 transition-colors">
                    <Cloud className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                      Finance & Audit
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium">FinOps Analytics</p>
                  </div>
                </Link>

                <button
                  onClick={onToggle}
                  className="lg:hidden p-1 text-slate-400 hover:text-white"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <Link
                href="/connectors"
                className="h-8 w-8 rounded-lg bg-blue-600/15 border border-blue-500/25 flex items-center justify-center hover:border-blue-500/50 transition-colors"
                title="FinOps Analytics"
              >
                <Cloud className="h-4 w-4 text-blue-400" />
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Items Scroll Area */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Section: FinOps */}
          <SectionHeader label="FinOps" />
          <NavItem
            icon={Cloud}
            label="Connectors"
            path="/connectors"
            active={isActive('/connectors')}
          />
          <NavItem
            icon={PieChart}
            label="Cost Allocation"
            path="/cost-allocation"
            active={isActive('/cost-allocation')}
          />
        </div>

        {/* Bottom Section: User Profile */}
        <div className="p-3 border-t border-dark-border/80 bg-[#05080e]">
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#0e1424] text-left transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0 ring-1 ring-white/10">
                SK
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">Suresh K</p>
                    <p className="text-[10px] text-slate-400 truncate">suresh@acme.corp</p>
                  </div>
                  <ChevronDown size={13} className="text-slate-500 shrink-0" />
                </>
              )}
            </button>

            {/* Profile Menu Popover */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div
                  className={`absolute bottom-full mb-2 w-52 bg-[#0d1322] border border-dark-border rounded-xl shadow-2xl z-40 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
                    collapsed ? 'left-full ml-2' : 'left-0'
                  }`}
                >
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push('/connectors');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#151c2e] rounded-lg transition-colors"
                  >
                    <Settings size={14} className="text-slate-400" />
                    <span>Settings</span>
                  </button>

                  <div className="h-px bg-dark-border/80 my-1" />

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push('/connectors');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>

      </aside>
    </>
  );
}
