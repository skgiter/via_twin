/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Bookmark,
  History,
  X,
  Plus,
  Trash2,
  Search,
  Shield,
  Download,
  Upload,
  Edit2,
  Check,
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
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleStartEdit = (b: BookmarkItem) => {
    setEditingBookmarkId(b.id);
    setEditTitle(b.title);
    setEditUrl(b.url);
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim() || !editUrl.trim()) return;
    onRemoveBookmark(id);
    onAddBookmark({
      id: `bm-${Date.now()}`,
      title: editTitle.trim(),
      url: editUrl.trim(),
      createdAt: Date.now(),
    });
    setEditingBookmarkId(null);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    onAddBookmark({
      id: `bm-${Date.now()}`,
      title: newTitle.trim(),
      url: newUrl.startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`,
      createdAt: Date.now(),
    });
    setNewTitle('');
    setNewUrl('');
    setIsAddingNew(false);
  };

  // Real Export bookmarks to JSON
  const handleExportBookmarks = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `via_bookmarks_${mode}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Real Import bookmarks from JSON
  const handleImportBookmarks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (item.title && item.url) {
              onAddBookmark({
                id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                title: String(item.title),
                url: String(item.url),
                createdAt: Date.now(),
              });
            }
          });
        }
      } catch {
        alert('书签文件格式不正确');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex flex-col select-none animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="h-14 px-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
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
            <span>历史 ({history.length})</span>
          </button>
        </div>

        {/* Right close button */}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-3 border-b border-neutral-800/80 bg-neutral-900 flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'bookmarks' ? '搜索已存书签...' : '搜索浏览历史...'}
            className="w-full bg-neutral-800 text-neutral-100 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-600"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2" />
        </div>

        {activeTab === 'bookmarks' ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1 transition-colors"
              title="添加书签"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>新建</span>
            </button>
            <button
              onClick={handleExportBookmarks}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              title="导出书签 JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <label
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              title="导入书签 JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBookmarks}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-red-950/60 text-neutral-300 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空</span>
            </button>
          )
        )}
      </div>

      {/* Manual Add Bookmark Form */}
      {activeTab === 'bookmarks' && isAddingNew && (
        <form onSubmit={handleManualAdd} className="p-3 bg-neutral-850 border-b border-neutral-800 space-y-2">
          <div className="text-xs font-semibold text-neutral-200">新建自定义书签</div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="网站标题 (如: 百度)..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none"
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="网址 URL (如: https://www.baidu.com)..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-md"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md"
            >
              保存
            </button>
          </div>
        </form>
      )}

      {/* Quick Bookmark Current Page Banner */}
      {activeTab === 'bookmarks' && activeUrl && activeUrl !== 'via://home' && (
        <div className="px-3 py-2 bg-neutral-850 border-b border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-400 truncate max-w-[240px]">
            当前网页：{activeTitle || activeUrl}
          </span>
          <button
            onClick={handleBookmarkCurrent}
            className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-[11px] font-medium shrink-0 flex items-center gap-1"
          >
            <Bookmark className="w-3 h-3 text-blue-400" />
            <span>收藏当前</span>
          </button>
        </div>
      )}

      {/* Content List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60 p-2">
        {activeTab === 'bookmarks' ? (
          filteredBookmarks.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">暂无书签记录</div>
          ) : (
            filteredBookmarks.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-2.5 hover:bg-neutral-900 rounded-xl transition-colors group"
              >
                {editingBookmarkId === b.id ? (
                  <div className="flex-1 flex items-center gap-2 mr-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 bg-neutral-800 text-xs text-white px-2 py-1 rounded"
                    />
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="flex-1 bg-neutral-800 text-xs text-white px-2 py-1 rounded"
                    />
                    <button
                      onClick={() => handleSaveEdit(b.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      onNavigate(b.url);
                      onClose();
                    }}
                    className="flex-1 min-w-0 cursor-pointer mr-2"
                  >
                    <div className="text-xs font-medium text-neutral-200 truncate">{b.title}</div>
                    <div className="text-[10px] text-neutral-500 truncate font-mono mt-0.5">{b.url}</div>
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleStartEdit(b)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(b.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-xs">暂无浏览历史</div>
        ) : (
          filteredHistory.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between p-2.5 hover:bg-neutral-900 rounded-xl transition-colors"
            >
              <div
                onClick={() => {
                  onNavigate(h.url);
                  onClose();
                }}
                className="flex-1 min-w-0 cursor-pointer mr-2"
              >
                <div className="text-xs font-medium text-neutral-200 truncate">{h.title}</div>
                <div className="text-[10px] text-neutral-500 truncate font-mono mt-0.5">{h.url}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-neutral-500 font-mono">
                  {formatTime(h.visitedAt)}
                </span>
                <button
                  onClick={() => onRemoveHistoryItem(h.id)}
                  className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                  title="删除记录"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
