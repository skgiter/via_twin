/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Shield,
  RotateCw,
  X,
  Search,
  Globe,
  ArrowRight,
  Clipboard,
  Layers,
} from 'lucide-react';
import { AccountMode, TabItem } from '../types/browser';

interface Props {
  activeTab: TabItem;
  mode: AccountMode;
  searchEngine: 'google' | 'baidu' | 'bing' | 'duckduckgo';
  onNavigate: (url: string) => void;
  onRefresh: () => void;
  onSearchEngineChange: (engine: 'google' | 'baidu' | 'bing' | 'duckduckgo') => void;
}

export const TopBar: React.FC<Props> = ({
  activeTab,
  mode,
  searchEngine,
  onNavigate,
  onRefresh,
  onSearchEngineChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHome = activeTab.url === 'via://home';
  const isIsolated = mode === 'isolated';

  useEffect(() => {
    if (!isEditing) {
      setInputValue(activeTab.url === 'via://home' ? '' : activeTab.url);
    }
  }, [activeTab.url, isEditing]);

  const handleOpenEdit = () => {
    setIsEditing(true);
    setInputValue(activeTab.url === 'via://home' ? '' : activeTab.url);
    setTimeout(() => {
      inputRef.current?.select();
    }, 50);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    setIsEditing(false);
    onNavigate(inputValue.trim());
  };

  const handlePasteAndGo = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputValue(text);
        setIsEditing(false);
        onNavigate(text.trim());
      }
    } catch {
      // Fallback
    }
  };

  const engineNames: Record<string, string> = {
    baidu: '百度',
    google: 'Google',
    bing: 'Bing',
    duckduckgo: 'DuckDuckGo',
  };

  if (isHome && !isEditing) {
    // When on home, top bar is ultra clean
    return (
      <div className="h-10 px-3 flex items-center justify-between text-xs border-b border-neutral-800/60 bg-neutral-900/60 text-neutral-400 select-none">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-medium text-neutral-300">
            {isIsolated ? 'Via 隔离空间' : 'Via 极简主页'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isIsolated ? (
            <span className="text-[10px] text-amber-400/90 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
              数据完全物理隔离
            </span>
          ) : (
            <span className="text-[10px] text-neutral-400">
              常规主账户
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-12 w-full px-2.5 flex items-center gap-2 border-b border-neutral-800 bg-neutral-900 z-30 select-none">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-1.5">
          {/* Engine Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEngineDropdown(!showEngineDropdown)}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded flex items-center gap-1 transition-colors"
            >
              <Search className="w-3 h-3 text-neutral-400" />
              <span>{engineNames[searchEngine] || '搜索'}</span>
            </button>

            {showEngineDropdown && (
              <div className="absolute top-8 left-0 w-32 bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl py-1 z-50">
                {(['baidu', 'google', 'bing', 'duckduckgo'] as const).map((eng) => (
                  <button
                    key={eng}
                    type="button"
                    onClick={() => {
                      onSearchEngineChange(eng);
                      setShowEngineDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-700 transition-colors ${
                      searchEngine === eng ? 'text-white font-medium bg-neutral-700/50' : 'text-neutral-300'
                    }`}
                  >
                    {engineNames[eng]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* URL / Search Input */}
          <div className="flex-1 relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="搜索或输入网址..."
              className="w-full bg-neutral-800 text-neutral-100 text-xs rounded-full pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              autoFocus
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-2 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Go Button */}
          <button
            type="submit"
            className="w-8 h-8 rounded-full bg-neutral-700 hover:bg-neutral-600 text-white flex items-center justify-center transition-colors shrink-0"
            title="访问"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs text-neutral-400 hover:text-neutral-200 px-1"
          >
            取消
          </button>
        </form>
      ) : (
        /* Display Mode */
        <div className="flex-1 flex items-center justify-between">
          <div
            onClick={handleOpenEdit}
            className="flex-1 flex items-center gap-2 bg-neutral-800/80 hover:bg-neutral-800 rounded-full px-3 py-1.5 cursor-pointer transition-colors max-w-[calc(100%-36px)]"
          >
            {isIsolated ? (
              <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs text-neutral-200 truncate font-normal">
              {activeTab.title || activeTab.url}
            </span>
          </div>

          <button
            onClick={onRefresh}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors ml-1 shrink-0 rounded-full hover:bg-neutral-800"
            title="刷新页面"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Paste & Go Bar when editing */}
      {isEditing && (
        <div className="absolute top-12 left-0 right-0 bg-neutral-900 border-b border-neutral-800 px-3 py-2 flex items-center justify-between text-xs text-neutral-400 shadow-xl">
          <button
            type="button"
            onClick={handlePasteAndGo}
            className="flex items-center gap-1 hover:text-neutral-200 transition-colors"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>粘贴并访问剪贴板</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setInputValue('via://home');
              setIsEditing(false);
              onNavigate('via://home');
            }}
            className="flex items-center gap-1 hover:text-neutral-200 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>返回主页</span>
          </button>
        </div>
      )}
    </div>
  );
};
