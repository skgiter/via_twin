/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { AccountMode, TabItem } from '../types/browser';

interface Props {
  activeTab: TabItem;
  mode: AccountMode;
  desktopMode: boolean;
  blockImages: boolean;
  onNavigate: (url: string) => void;
  onViewSource: (url: string) => void;
  onScrollDirectionChange?: (isScrollingDown: boolean) => void;
}

export const WebRenderer: React.FC<Props> = ({
  activeTab,
  mode,
  desktopMode,
  blockImages,
  onViewSource,
  onScrollDirectionChange,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const lastScrollY = useRef(0);
  const touchStartY = useRef<number | null>(null);

  // Vault Notes State (Isolated mode exclusive feature)
  const [vaultNotes, setVaultNotes] = useState<Array<{ id: string; title: string; content: string; tag: string }>>(() => {
    try {
      const saved = localStorage.getItem('via_isolated_secret_notes');
      return saved ? JSON.parse(saved) : [
        { id: '1', title: '主私钥与种子助记词', content: 'alpha bravo charlie delta echo foxtrot golf hotel india juliet', tag: '密钥' },
        { id: '2', title: '绝密服务器 SSH 证书', content: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleRootKey isolated-node-01', tag: '基础设施' },
        { id: '3', title: '加密通讯安全备忘', content: '所有的平行模式书签、历史均保存在本地隔离分区，息屏或切后台即刻无缝退回主账户。', tag: '安全' },
      ];
    } catch {
      return [];
    }
  });

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const saveVaultNotes = (updated: typeof vaultNotes) => {
    setVaultNotes(updated);
    try {
      localStorage.setItem('via_isolated_secret_notes', JSON.stringify(updated));
    } catch {
      // storage error
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    const updated = [
      { id: Date.now().toString(), title: newNoteTitle.trim(), content: newNoteContent.trim(), tag: '私人' },
      ...vaultNotes,
    ];
    saveVaultNotes(updated);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleDeleteNote = (id: string) => {
    const updated = vaultNotes.filter((n) => n.id !== id);
    saveVaultNotes(updated);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Scroll detection for auto-hiding top & bottom navigation bars
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 6) return;
    if (e.deltaY > 0) {
      onScrollDirectionChange?.(true); // Scrolling down -> hide bars
    } else {
      onScrollDirectionChange?.(false); // Scrolling up -> show bars
    }
  }, [onScrollDirectionChange]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartY.current - currentY;
    if (Math.abs(diff) > 15) {
      if (diff > 0) {
        onScrollDirectionChange?.(true); // Touch drag up (content moving down) -> hide bars
      } else {
        onScrollDirectionChange?.(false); // Touch drag down -> show bars
      }
      touchStartY.current = currentY;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  const url = activeTab.url;

  // Check if it's the isolated vault notes page
  if (url.startsWith('via://vault-notes')) {
    return (
      <div
        className="flex-1 w-full bg-neutral-950 text-neutral-100 overflow-y-auto p-4 select-text"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center">
                <Key className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">加密平行金库 (Vault)</h2>
                <p className="text-[10px] text-neutral-400">仅在隔离空间可见 · 本地AES保护</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              隔离受保护
            </span>
          </div>

          {/* Add Secret Note Form */}
          <form onSubmit={handleAddNote} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="text-xs font-medium text-neutral-300">添加保密记录 / 密钥条目</div>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="记录标题 (如: 独立网银凭证)..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            />
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="敏感内容或私钥助记词..."
              rows={2}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-medium text-xs rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>保存条目</span>
              </button>
            </div>
          </form>

          {/* Vault Notes List */}
          <div className="space-y-2.5">
            {vaultNotes.map((note) => (
              <div
                key={note.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-neutral-200">{note.title}</span>
                    <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.2 rounded">
                      {note.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(note.content, note.id)}
                      className="p-1 text-neutral-400 hover:text-neutral-200"
                      title="复制内容"
                    >
                      {copiedKey === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-neutral-400 hover:text-red-400"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="bg-neutral-950/80 rounded p-2 text-xs font-mono text-neutral-300 break-all select-all border border-neutral-850">
                  {note.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Pure True Web Browsing Viewport (Direct original mobile web page)
  return (
    <div
      className="flex-1 w-full bg-neutral-950 flex flex-col relative overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 w-full h-full relative overflow-hidden bg-white">
        <iframe
          key={iframeKey}
          src={url}
          title={activeTab.title || url}
          className={`w-full h-full border-none transition-opacity duration-200 ${
            blockImages ? 'grayscale' : ''
          }`}
          style={
            desktopMode
              ? {
                  width: '1280px',
                  height: '100%',
                  transform: 'scale(0.32)',
                  transformOrigin: 'top left',
                }
              : {
                  width: '100%',
                  height: '100%',
                }
          }
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation allow-downloads"
        />
      </div>
    </div>
  );
};
