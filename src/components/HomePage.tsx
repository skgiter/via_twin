/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  X,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { AccountMode, QuickDial } from '../types/browser';

interface Props {
  mode: AccountMode;
  quickDials: QuickDial[];
  searchEngine: 'google' | 'baidu' | 'bing' | 'duckduckgo';
  onNavigate: (url: string) => void;
  onAddQuickDial: (item: QuickDial) => void;
  onRemoveQuickDial: (id: string) => void;
  onSearchEngineChange: (engine: 'google' | 'baidu' | 'bing' | 'duckduckgo') => void;
  onOpenSettings: () => void;
}

export const HomePage: React.FC<Props> = ({
  mode,
  quickDials,
  searchEngine,
  onNavigate,
  onAddQuickDial,
  onRemoveQuickDial,
  onSearchEngineChange,
  onOpenSettings,
}) => {
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isEditingDials, setIsEditingDials] = useState(false);
  const [showEngineMenu, setShowEngineMenu] = useState(false);

  const isIsolated = mode === 'isolated';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onNavigate(query.trim());
  };

  const handleCreateDial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    const formattedUrl = newUrl.startsWith('http') || newUrl.startsWith('via://')
      ? newUrl
      : `https://${newUrl}`;
    const initial = newTitle.slice(0, 2);
    onAddQuickDial({
      id: `qd-${Date.now()}`,
      title: newTitle.trim(),
      url: formattedUrl,
      iconBg: isIsolated ? '#059669' : '#3B82F6',
      iconText: initial,
    });
    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  const engineLabels: Record<string, string> = {
    baidu: '度',
    google: 'G',
    bing: 'B',
    duckduckgo: 'D',
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-between px-4 py-8 overflow-y-auto select-none bg-neutral-900 text-neutral-100">
      <div className="w-full max-w-sm flex flex-col items-center flex-1 justify-center gap-8 -mt-6">
        {/* Via Minimalist Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex items-center justify-center">
            {isIsolated ? (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-950/40">
                <Shield className="w-8 h-8 text-neutral-950 stroke-[2.2]" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700/80 flex items-center justify-center shadow-lg shadow-black/40">
                <span className="text-3xl font-extrabold tracking-tighter text-white">V</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-light tracking-wide text-neutral-100">Via</h1>
            {isIsolated && (
              <span className="text-[11px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded">
                隔离空间
              </span>
            )}
          </div>
        </div>

        {/* Central Search Bar */}
        <div className="w-full relative">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full flex items-center gap-2 bg-neutral-800/90 border border-neutral-700/80 rounded-full px-3.5 py-2.5 shadow-md shadow-black/20 focus-within:border-neutral-500 focus-within:bg-neutral-800 transition-all"
          >
            {/* Search Engine Switcher Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEngineMenu(!showEngineMenu)}
                className="w-6 h-6 rounded-full bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-xs font-bold flex items-center justify-center transition-colors shrink-0"
                title="切换搜索引擎"
              >
                {engineLabels[searchEngine]}
              </button>

              {showEngineMenu && (
                <div className="absolute top-8 left-0 w-36 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl py-1 z-50">
                  <div className="px-3 py-1 text-[10px] text-neutral-400 border-b border-neutral-700/60">
                    默认搜索引擎
                  </div>
                  {(['baidu', 'google', 'bing', 'duckduckgo'] as const).map((eng) => (
                    <button
                      key={eng}
                      type="button"
                      onClick={() => {
                        onSearchEngineChange(eng);
                        setShowEngineMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-700 ${
                        searchEngine === eng ? 'text-emerald-400 font-medium' : 'text-neutral-300'
                      }`}
                    >
                      <span>
                        {eng === 'baidu'
                          ? '百度 (Baidu)'
                          : eng === 'google'
                          ? 'Google'
                          : eng === 'bing'
                          ? '必应 (Bing)'
                          : 'DuckDuckGo'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索或输入网址..."
              className="flex-1 bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
            />

            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" className="text-neutral-400 hover:text-neutral-200">
                <Search className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Quick Dial Grid (8 tiles max or expandable) */}
        <div className="w-full">
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-[11px] font-medium text-neutral-500">
              {isIsolated ? '私密快捷导航' : '常用捷径'}
            </span>
            <button
              onClick={() => setIsEditingDials(!isEditingDials)}
              className="text-[11px] text-neutral-400 hover:text-neutral-200"
            >
              {isEditingDials ? '完成' : '编辑'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            {quickDials.map((dial) => (
              <div key={dial.id} className="relative flex flex-col items-center group">
                {isEditingDials && (
                  <button
                    onClick={() => onRemoveQuickDial(dial.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full text-white flex items-center justify-center text-xs z-10 shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => onNavigate(dial.url)}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xs font-semibold shadow-md active:scale-95 transition-transform"
                  style={{ backgroundColor: dial.iconBg || '#333333' }}
                >
                  {dial.iconText || dial.title.slice(0, 2)}
                </button>
                <span className="text-[11px] text-neutral-300 mt-1.5 truncate max-w-[64px] text-center">
                  {dial.title}
                </span>
              </div>
            ))}

            {/* Add shortcut tile */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-12 h-12 rounded-2xl border border-dashed border-neutral-700 hover:border-neutral-500 flex items-center justify-center text-neutral-400 hover:text-neutral-200 active:scale-95 transition-all"
                title="添加快捷方式"
              >
                <Plus className="w-5 h-5" />
              </button>
              <span className="text-[11px] text-neutral-500 mt-1.5">添加</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer info: Via signature zero bloat */}
      <div className="w-full text-center text-[11px] text-neutral-600 pt-4 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span>极简</span>
          <span>·</span>
          <span>极速</span>
          <span>·</span>
          <span>平行隔离</span>
        </div>
        {isIsolated ? (
          <div className="text-[10px] text-amber-500/80 flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" />
            <span>息屏或切后台时将无缝退出至主账户</span>
          </div>
        ) : (
          <button
            onClick={onOpenSettings}
            className="text-[10px] text-neutral-500 hover:text-neutral-400 transition-colors"
          >
            在设置中查看平行账号状态
          </button>
        )}
      </div>

      {/* Add Shortcut Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xs bg-neutral-800 border border-neutral-700 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-neutral-100 mb-3">
              添加快捷捷径
            </h3>
            <form onSubmit={handleCreateDial} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">标题</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：技术雷达"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-500"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">网址</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="例如：https://example.com"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-neutral-200 text-neutral-900 font-medium rounded-lg hover:bg-white transition-colors"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
