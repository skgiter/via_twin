/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bookmark,
  History,
  X,
  Plus,
  Trash2,
  Search,
  ExternalLink,
  Shield,
  Download,
  Upload,
} from 'lucide-react';
import { AccountMode, BookmarkItem, HistoryItem } from '../types/browser';

interface Props {
  mode: AccountMode;
  bookmarks: BookmarkItem[];
  history: HistoryItem[];
  activeUrl: string;
  activeTitle: string;
  onNavigate: (url: string) => void;
  onAddBookmark: (item: BookmarkItem) => void;
  onRemoveBookmark: (id: string) => void;
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: string) => void;
  onClose: () => void;
}

export const BookmarksHistoryModal: React.FC<Props> = ({
  mode,
  bookmarks,
  history,
  activeUrl,
  activeTitle,
  onNavigate,
  onAddBookmark,
  onRemoveBookmark,
  onClearHistory,
  onRemoveHistoryItem,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');

  const isIsolated = mode === 'isolated';

  const handleBookmarkCurrent = () => {
    if (!activeUrl || activeUrl === 'via://home') return;
    onAddBookmark({
      id: `bm-${Date.now()}`,
      title: activeTitle || activeUrl,
      url: activeUrl,
      createdAt: Date.now(),
    });
  };

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter(
    (h) =>
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm z-50 flex flex-col select-none">
      {/* Top Header */}
      <div className="h-14 px-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-neutral-800 rounded-lg">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-neutral-700 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>书签 ({bookmarks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'history'
                ? 'bg-neutral-700 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>历史记录 ({history.length})</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Isolation Status Badge */}
      <div className="px-4 py-2 bg-neutral-850 border-b border-neutral-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {isIsolated ? (
            <>
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 font-medium">当前空间：独立平行加密分区</span>
            </>
          ) : (
            <span className="text-neutral-400">当前空间：常规主账户</span>
          )}
        </div>
        <span className="text-[10px] text-neutral-500">
          {isIsolated ? '数据与主账户互不渗透' : '公开浏览数据'}
        </span>
      </div>

      {/* Search Filter Bar */}
      <div className="p-3 border-b border-neutral-800/80 bg-neutral-900">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'bookmarks' ? '搜索书签...' : '搜索历史记录...'}
            className="w-full bg-neutral-800 border border-neutral-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-w-lg mx-auto w-full">
        {activeTab === 'bookmarks' ? (
          <>
            {/* Quick Bookmark Current Page */}
            {activeUrl && activeUrl !== 'via://home' && (
              <button
                onClick={handleBookmarkCurrent}
                className="w-full p-2.5 rounded-xl bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-700/60 flex items-center justify-between text-xs text-neutral-200 transition-colors mb-3"
              >
                <div className="flex items-center gap-2 truncate">
                  <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">将当前页添加至此空间书签</span>
                </div>
                <span className="text-[10px] text-neutral-400 shrink-0">点击添加</span>
              </button>
            )}

            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-500">
                暂无书签收藏
              </div>
            ) : (
              filteredBookmarks.map((bm) => (
                <div
                  key={bm.id}
                  onClick={() => {
                    onNavigate(bm.url);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-neutral-200 truncate group-hover:text-white">
                      {bm.title}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono truncate mt-0.5">
                      {bm.url}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(bm.id);
                    }}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors shrink-0"
                    title="删除书签"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </>
        ) : (
          /* History Tab */
          <>
            {filteredHistory.length > 0 && (
              <div className="flex justify-end pb-2">
                <button
                  onClick={onClearHistory}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清空当前模式历史</span>
                </button>
              </div>
            )}

            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-500">
                暂无浏览历史
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.url);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-neutral-200 truncate group-hover:text-white">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-neutral-500 font-mono truncate">
                        {item.url}
                      </span>
                      <span className="text-[9px] text-neutral-600 shrink-0">
                        {formatTime(item.visitedAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHistoryItem(item.id);
                    }}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors shrink-0"
                    title="删除此条历史"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
