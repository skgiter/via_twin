/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { TabItem } from '../types/browser';

interface Props {
  activeTab: TabItem;
  tabCount: number;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoHome: () => void;
  onOpenTabs: () => void;
  onOpenMenu: () => void;
}

export const BottomBar: React.FC<Props> = ({
  activeTab,
  tabCount,
  onGoBack,
  onGoForward,
  onGoHome,
  onOpenTabs,
  onOpenMenu,
}) => {
  const canGoBack = activeTab.historyIndex > 0;
  const canGoForward = activeTab.historyIndex < activeTab.historyStack.length - 1;

  return (
    <div className="h-12 w-full border-t border-neutral-800 bg-neutral-900 flex items-center justify-around px-2 z-30 select-none">
      {/* Back button */}
      <button
        onClick={onGoBack}
        disabled={!canGoBack}
        aria-label="后退"
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
          canGoBack
            ? 'text-neutral-200 hover:bg-neutral-800 active:scale-95'
            : 'text-neutral-600 cursor-not-allowed'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Forward button */}
      <button
        onClick={onGoForward}
        disabled={!canGoForward}
        aria-label="前进"
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
          canGoForward
            ? 'text-neutral-200 hover:bg-neutral-800 active:scale-95'
            : 'text-neutral-600 cursor-not-allowed'
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Home button */}
      <button
        onClick={onGoHome}
        aria-label="主页"
        className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-200 hover:bg-neutral-800 active:scale-95 transition-colors"
      >
        <Home className="w-4.5 h-4.5" />
      </button>

      {/* Tab Manager button with counter */}
      <button
        onClick={onOpenTabs}
        aria-label="标签页管理"
        className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-200 hover:bg-neutral-800 active:scale-95 transition-colors"
      >
        <div className="w-5 h-5 rounded border border-neutral-300 flex items-center justify-center text-[10px] font-bold tabular-nums">
          {tabCount}
        </div>
      </button>

      {/* Menu (3 dots) */}
      <button
        onClick={onOpenMenu}
        aria-label="菜单"
        className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-200 hover:bg-neutral-800 active:scale-95 transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  );
};
