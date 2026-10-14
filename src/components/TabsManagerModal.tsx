/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, X, Globe, Shield, Trash2 } from 'lucide-react';
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
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex flex-col select-none">
      {/* Top Header */}
      <div className="h-14 px-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-100">
            标签页管理 ({tabs.length})
          </span>
          {isIsolated && (
            <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              隔离空间标签
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCloseAll}
            className="text-xs text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1"
            title="全部关闭"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>关闭全部</span>
          </button>
          <button
            onClick={onCloseModal}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Cards Grid */}
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
                  ? 'bg-neutral-800 border-neutral-400 shadow-lg shadow-black/40 scale-[1.01]'
                  : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
              }`}
            >
              {/* Tab Header inside card */}
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-4 h-4 rounded bg-neutral-700 flex items-center justify-center shrink-0">
                    <Globe className="w-2.5 h-2.5 text-neutral-300" />
                  </div>
                  <span className="text-xs font-medium text-neutral-200 truncate">
                    {tab.title || (isHome ? 'Via 主页' : tab.url)}
                  </span>
                </div>

                {/* Close single tab button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="w-5 h-5 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 flex items-center justify-center shrink-0 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Tab Preview Box */}
              <div className="flex-1 my-2 rounded-xl bg-neutral-950/60 border border-neutral-800/80 p-2 flex flex-col justify-center items-center text-center">
                {isHome ? (
                  <div className="text-neutral-500 font-extrabold text-2xl tracking-tighter">V</div>
                ) : (
                  <div className="text-[11px] text-neutral-400 font-mono line-clamp-3">
                    {tab.url}
                  </div>
                )}
              </div>

              {/* Bottom status of card */}
              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <span>{isHome ? '主页' : '网页'}</span>
                {isActive && (
                  <span className="text-emerald-400 font-medium">当前活跃</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Action: New Tab */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 flex justify-center">
        <button
          onClick={onNewTab}
          className="px-6 py-2.5 rounded-full bg-neutral-200 hover:bg-white text-neutral-900 text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-black/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>新建标签页</span>
        </button>
      </div>
    </div>
  );
};
