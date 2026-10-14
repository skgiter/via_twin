/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Plus,
  Bookmark,
  RotateCw,
  Monitor,
  Code,
  Database,
  Search,
  Moon,
  Settings,
  Lock,
  ShieldAlert,
  X,
  Share2,
} from 'lucide-react';
import { AccountMode } from '../types/browser';

interface Props {
  mode: AccountMode;
  desktopMode: boolean;
  onNewTab: () => void;
  onOpenBookmarks: () => void;
  onRefresh: () => void;
  onToggleDesktop: () => void;
  onOpenSource: () => void;
  onOpenCookies: () => void;
  onOpenFindInPage: () => void;
  onOpenSettings: () => void;
  onPanicLock: () => void;
  onClose: () => void;
}

export const MenuSheet: React.FC<Props> = ({
  mode,
  desktopMode,
  onNewTab,
  onOpenBookmarks,
  onRefresh,
  onToggleDesktop,
  onOpenSource,
  onOpenCookies,
  onOpenFindInPage,
  onOpenSettings,
  onPanicLock,
  onClose,
}) => {
  const isIsolated = mode === 'isolated';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex flex-col justify-end select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg mx-auto bg-neutral-900 border-t border-neutral-800 rounded-t-3xl p-4 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-200"
      >
        {/* Drag Handle & Header */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-1 bg-neutral-700 rounded-full mb-2"></div>
          <div className="w-full flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-neutral-300">
              Via 工具箱
            </span>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Emergency Panic Lock Button in Isolated Mode */}
        {isIsolated && (
          <button
            onClick={() => {
              onPanicLock();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>立即锁定并退回主账户 (防窥速退)</span>
          </button>
        )}

        {/* 3x3 Grid of Menu Items */}
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
          {/* New Tab */}
          <button
            onClick={() => {
              onNewTab();
              onClose();
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-200">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-neutral-300">新建标签</span>
          </button>

          {/* Bookmarks & History */}
          <button
            onClick={() => {
              onOpenBookmarks();
              onClose();
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-200">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-neutral-300">书签/历史</span>
          </button>

          {/* Refresh */}
          <button
            onClick={() => {
              onRefresh();
              onClose();
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-200">
              <RotateCw className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-neutral-300">刷新页面</span>
          </button>

          {/* Desktop Mode Toggle */}
          <button
            onClick={() => {
              onToggleDesktop();
              onClose();
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                desktopMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-200'
              }`}
            >
              <Monitor className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-neutral-300">
              {desktopMode ? '电脑版开启' : '电脑模式'}
            </span>
          </button>

          {/* View Source Code */}
          <button
            onClick={() => {
              onOpenSource();
              onClose();
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-200">
              <Code className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-neutral-300">查看源码</span>
          </button>

          {/* Cookie & Storage Isolation Inspector */}
          <button
            onClick={() => {
              onOpenCookies();
              onClose();
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-200">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-neutral-300">Cookie管理</span>
          </button>

          {/* Find In Page */}
          <button
            onClick={() => {
              onOpenFindInPage();
              onClose();
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-200">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-neutral-300">页内查找</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-200">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-neutral-300">设置</span>
          </button>
        </div>
      </div>
    </div>
  );
};
