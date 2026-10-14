/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Code,
  BookOpen,
  Shield,
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Globe,
  Layers,
  FileText,
} from 'lucide-react';
import { AccountMode, TabItem } from '../types/browser';
import { BilibiliRenderer } from './BilibiliRenderer';

interface Props {
  activeTab: TabItem;
  mode: AccountMode;
  desktopMode: boolean;
  blockImages: boolean;
  onNavigate: (url: string) => void;
  onViewSource: (url: string) => void;
}

export const WebRenderer: React.FC<Props> = ({
  activeTab,
  mode,
  desktopMode,
  blockImages,
  onNavigate,
  onViewSource,
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const isIsolated = mode === 'isolated';
  const url = activeTab.url;

  // Check if it's the isolated vault notes page
  if (url.startsWith('via://vault-notes')) {
    return (
      <div className="flex-1 w-full bg-neutral-950 text-neutral-100 overflow-y-auto p-4 select-text">
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

          {/* List of notes */}
          <div className="space-y-2.5">
            {vaultNotes.map((note) => (
              <div
                key={note.id}
                className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-3 hover:border-neutral-700 transition-colors"
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

  // Check if it's threat intelligence portal
  if (url.startsWith('via://threat-intel') || url.startsWith('via://crypto-vault') || url.startsWith('via://zk-backup')) {
    return (
      <div className="flex-1 w-full bg-neutral-950 text-neutral-200 overflow-y-auto p-4 select-text">
        <div className="max-w-md mx-auto space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              零信任隐私沙箱状态
            </h2>
            <p className="text-[11px] text-neutral-400">隔离空间物理分区与内存隔离保障体系</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              <div className="text-[10px] text-neutral-500 mb-1">Cookies 隔离分区</div>
              <div className="text-sm font-mono text-emerald-400 font-semibold">独立物理分库</div>
              <div className="text-[10px] text-neutral-400 mt-1">与主账户零交叉通信</div>
            </div>
            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              <div className="text-[10px] text-neutral-500 mb-1">自动防窥退出</div>
              <div className="text-sm font-mono text-amber-400 font-semibold">息屏即刻锁定</div>
              <div className="text-[10px] text-neutral-400 mt-1">切换应用秒回主模式</div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs space-y-2">
            <div className="font-semibold text-neutral-200">当前隔离状态参数</div>
            <div className="flex justify-between text-neutral-400 text-[11px] border-b border-neutral-800/60 pb-1.5">
              <span>用户环境识别码</span>
              <span className="font-mono text-neutral-200">sandbox_iso_2026</span>
            </div>
            <div className="flex justify-between text-neutral-400 text-[11px] border-b border-neutral-800/60 pb-1.5">
              <span>加密算法</span>
              <span className="font-mono text-neutral-200">AES-GCM / PBKDF2</span>
            </div>
            <div className="flex justify-between text-neutral-400 text-[11px]">
              <span>数据留存机制</span>
              <span className="font-mono text-emerald-400">保留但加密锁护</span>
            </div>
          </div>
        </div>
      </div>
    );
  }



  // Check if it's Bilibili
  if (url.includes('bilibili.com')) {
    return (
      <BilibiliRenderer
        url={url}
        onNavigate={onNavigate}
        onViewSource={onViewSource}
      />
    );
  }

  // General External URL: render iframe with fallback & actions
  return (
    <div className="flex-1 w-full bg-neutral-900 flex flex-col relative overflow-hidden">
      {/* Top action helper for real websites */}
      <div className="h-8 px-3 bg-neutral-850 border-b border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 select-none">
        <span className="truncate max-w-[200px]">{url}</span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onViewSource(url)}
            className="hover:text-neutral-200 flex items-center gap-0.5"
            title="查看源码"
          >
            <Code className="w-3 h-3" />
            <span>源码</span>
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-200 flex items-center gap-0.5"
            title="在新窗口打开"
          >
            <ExternalLink className="w-3 h-3" />
            <span>新窗口</span>
          </a>
        </div>
      </div>

      {/* Main WebView Frame */}
      <div className="flex-1 w-full relative">
        <iframe
          src={url}
          title={activeTab.title}
          className={`w-full h-full border-none bg-white ${blockImages ? 'grayscale' : ''}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onError={() => setIframeError(true)}
        />

        {/* Fallback overlay banner if iframe cannot be displayed due to X-Frame-Options */}
        <div className="absolute bottom-3 left-3 right-3 bg-neutral-900/95 border border-neutral-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px]">
              若部分外部网站受安全策略(X-Frame-Options)限制，可点击右侧在新标签直达或查看源码。
            </div>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] font-medium shrink-0 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>新标签打开</span>
          </a>
        </div>
      </div>
    </div>
  );
};
