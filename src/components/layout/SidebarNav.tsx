'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  LogOut,
  Layers,
  Cloud,
  Network,
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
    onClick,
  }: {
    icon: any;
    label: string;
    path: string;
    active?: boolean;
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
        className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-all duration-150 font-medium relative rounded-lg ${
          active
            ? 'bg-slate-100 text-slate-900 font-semibold shadow-none'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        } ${collapsed ? 'justify-center px-2' : ''}`}
        title={collapsed ? label : undefined}
      >
        <Icon
          size={16}
          className={`shrink-0 ${
            active ? 'text-slate-900' : 'text-slate-500'
          }`}
        />
        {!collapsed && <span className="truncate text-left">{label}</span>}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ${
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={onToggle}
      />

      <aside
        className={`h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 font-sans z-40 relative select-none ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-60'
        }`}
      >
        {/* Desktop Edge Toggle Chevron */}
        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 bg-white border border-slate-200 hover:border-slate-300 rounded-full items-center justify-center shadow-sm text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Top Header & Brand */}
        <div className="p-4 border-b border-slate-100">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <Link href="/cost-allocation" className="flex items-center gap-2.5 group">
                <div className="h-7 w-7 rounded-lg bg-slate-950 text-white flex items-center justify-center shadow-sm">
                  <div className="h-3.5 w-3.5 border-2 border-white rotate-45 transform" />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    FINOPS ANALYTICS
                  </h2>
                </div>
              </Link>

              <button
                onClick={onToggle}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <Link
                href="/cost-allocation"
                className="h-8 w-8 rounded-lg bg-slate-950 text-white flex items-center justify-center shadow-sm"
                title="FinOps Analytics"
              >
                <div className="h-4 w-4 border-2 border-white rotate-45 transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Items Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {!collapsed && (
            <div className="px-1 mb-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                ANALYTICS
              </span>
            </div>
          )}
          <NavItem
            icon={BarChart3}
            label="Cost Allocation"
            path="/cost-allocation"
            active={isActive('/cost-allocation')}
            onClick={() => {
              if (typeof window !== 'undefined' && window.location.search) {
                window.location.href = '/cost-allocation';
              } else {
                router.push('/cost-allocation');
              }
            }}
          />
          <NavItem
            icon={Network}
            label="Connectors"
            path="/connectors"
            active={isActive('/connectors')}
          />
        </div>

        {/* Bottom Section: User Profile matching Reference Screenshot */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 text-left transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 uppercase shrink-0">
                FA
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">Finance & Audit</p>
                  <p className="text-[10px] text-slate-400 truncate">Sample workspace</p>
                </div>
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
                  className={`absolute bottom-full mb-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-40 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
                    collapsed ? 'left-full ml-2' : 'left-0'
                  }`}
                >
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push('/connectors');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Settings size={14} className="text-slate-400" />
                    <span>Settings</span>
                  </button>

                  <div className="h-px bg-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push('/connectors');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
