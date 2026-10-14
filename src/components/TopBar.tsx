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
  Clock,
  TrendingUp,
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

  const handleSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const target = customQuery !== undefined ? customQuery : inputValue;
    if (!target.trim()) return;
    setIsEditing(false);
    onNavigate(target.trim());
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
      // Clipboard fallback
    }
  };

  const engineNames: Record<string, string> = {
    baidu: '百度',
    google: 'Google',
    bing: 'Bing',
    duckduckgo: 'DuckDuckGo',
  };

  const looksLikeUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(
    inputValue.trim()
  );

  // Suggested keywords when user types
  const getSuggestions = () => {
    const q = inputValue.trim();
    if (!q) return [];
    return [
      `${q}`,
      `${q} 最新动态`,
      `${q} 官网入口`,
      `${q} 教程与指南`,
    ];
  };

  const suggestions = getSuggestions();

  if (isHome && !isEditing) {
    return (
      <div className="h-10 px-3 flex items-center justify-between text-xs border-b border-neutral-800/60 bg-neutral-900/90 backdrop-blur-md text-neutral-400 select-none">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-medium text-neutral-300">
            {isIsolated ? 'Via 隔离空间' : 'Via 极简主页'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isIsolated && (
            <span className="text-[10px] text-amber-400/90 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded font-mono">
              隔离空间
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-12 px-2 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between relative z-40 select-none">
      {isEditing ? (
        /* Omnibox Edit Mode */
        <div className="flex-1 flex flex-col">
          <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-1.5 w-full">
            {/* Search Engine Selector */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowEngineDropdown(!showEngineDropdown)}
                className="h-8 px-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <span>{engineNames[searchEngine]}</span>
              </button>

              {showEngineDropdown && (
                <div className="absolute left-0 top-10 w-28 bg-neutral-850 border border-neutral-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {(['baidu', 'bing', 'google', 'duckduckgo'] as const).map((eng) => (
                    <button
                      key={eng}
                      type="button"
                      onClick={() => {
                        onSearchEngineChange(eng);
                        setShowEngineDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-700 flex items-center justify-between ${
                        searchEngine === eng ? 'text-blue-400 font-semibold' : 'text-neutral-300'
                      }`}
                    >
                      <span>{engineNames[eng]}</span>
                      {searchEngine === eng && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Omnibox Input */}
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
              title="前往"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-neutral-400 hover:text-neutral-200 px-1 shrink-0"
            >
              取消
            </button>
          </form>

          {/* Real-time Omnibox Suggestions Dropdown */}
          <div className="absolute top-12 left-0 right-0 bg-neutral-900 border-b border-neutral-800 shadow-2xl py-2 px-3 space-y-1 z-50">
            {/* Quick action bar */}
            <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800/80 mb-1">
              <button
                type="button"
                onClick={handlePasteAndGo}
                className="flex items-center gap-1 hover:text-neutral-200 transition-colors"
              >
                <Clipboard className="w-3.5 h-3.5 text-neutral-400" />
                <span>粘贴并前往</span>
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
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                <span>返回主页</span>
              </button>
            </div>

            {/* Suggestion Rows */}
            {inputValue.trim() && (
              <div className="space-y-1">
                {looksLikeUrl && (
                  <div
                    onClick={() => handleSubmit(undefined, inputValue.trim())}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-800 cursor-pointer text-xs text-blue-400 font-medium"
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                    <span className="truncate">直接访问网址：{inputValue.trim()}</span>
                  </div>
                )}
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSubmit(undefined, sug)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800 cursor-pointer text-xs text-neutral-200"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Search className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
                      <span className="truncate">{sug}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 shrink-0">
                      {engineNames[searchEngine]}搜索
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Normal Display Mode */
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
    </div>
  );
};
