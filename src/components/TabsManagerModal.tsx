/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, X, Globe, Shield, Trash2, Home } from 'lucide-react';
import { AccountMode, TabItem } from '../types/browser';

interface Props {
  tabs: TabItem[];
  activeTabId: string;
  mode: AccountMode;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onCloseAll: () => void;
  onCloseModal: () => void;
}

export const TabsManagerModal: React.FC<Props> = ({
  tabs,
  activeTabId,
  mode,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onCloseAll,
  onCloseModal,
}) => {
  const isIsolated = mode === 'isolated';

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex flex-col select-none animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="h-14 px-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-100">
            标签页 ({tabs.length})
          </span>
          {isIsolated && (
            <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
              <Shield className="w-2.5 h-2.5" />
              隔离空间
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {tabs.length > 1 && (
            <button
              onClick={onCloseAll}
              className="text-xs text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-neutral-800"
              title="关闭所有非当前标签页"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清理其他</span>
            </button>
          )}
          <button
            onClick={onCloseModal}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Cards Deck Grid (2 Columns) */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 max-w-lg mx-auto w-full content-start">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isHome = tab.url === 'via://home';

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative h-44 rounded-2xl p-3 flex flex-col justify-between border cursor-pointer transition-all ${
                isActive
                  ? 'bg-neutral-850 border-blue-500 shadow-xl shadow-black/60 ring-2 ring-blue-500/30'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
              }`}
            >
              {/* Tab Header inside card */}
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-neutral-800 flex items-center justify-center shrink-0">
                    {isHome ? (
                      <Home className="w-3 h-3 text-neutral-300" />
                    ) : (
                      <Globe className="w-3 h-3 text-blue-400" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-neutral-200 truncate">
                    {tab.title || (isHome ? 'Via 极简主页' : tab.url)}
                  </span>
                </div>

                {/* Close single tab button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="w-6 h-6 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center shrink-0 transition-colors"
                  title="关闭标签"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tab Content Preview Simulation */}
              <div className="flex-1 my-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80 p-2 flex flex-col justify-center items-center text-center overflow-hidden">
                {isHome ? (
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-300 font-bold text-xs flex items-center justify-center mx-auto">
                      V
                    </div>
                    <span className="text-[10px] text-neutral-400 block font-medium">Via 主页</span>
                  </div>
                ) : (
                  <div className="space-y-1 w-full px-1">
                    <span className="text-[11px] text-neutral-300 font-medium line-clamp-2 leading-tight">
                      {tab.title}
                    </span>
                    <span className="text-[9px] text-neutral-500 truncate block font-mono">
                      {tab.url.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                )}
              </div>

              {/* Active Tab Badge Indicator */}
              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <span className="truncate">{tab.historyStack.length} 历史步数</span>
                {isActive && (
                  <span className="text-blue-400 font-medium">当前活动</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar: New Tab Button */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-center">
        <button
          onClick={onNewTab}
          className="w-full max-w-sm h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <Plus className="w-4 h-4 text-blue-400" />
          <span>新建标签页</span>
        </button>
      </div>
    </div>
  );
};
