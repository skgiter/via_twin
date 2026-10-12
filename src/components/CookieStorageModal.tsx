/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Plus, Trash2, X, Shield, Lock } from 'lucide-react';
import { AccountMode, SiteCookie } from '../types/browser';

interface Props {
  mode: AccountMode;
  cookies: SiteCookie[];
  onAddCookie: (cookie: SiteCookie) => void;
  onRemoveCookie: (id: string) => void;
  onClearCookies: () => void;
  onClose: () => void;
}

export const CookieStorageModal: React.FC<Props> = ({
  mode,
  cookies,
  onAddCookie,
  onRemoveCookie,
  onClearCookies,
  onClose,
}) => {
  const isIsolated = mode === 'isolated';

  const [domainInput, setDomainInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim() || !nameInput.trim()) return;
    onAddCookie({
      id: `ck-${Date.now()}`,
      domain: domainInput.trim().toLowerCase(),
      name: nameInput.trim(),
      value: valueInput.trim(),
      updatedAt: Date.now(),
    });
    setDomainInput('');
    setNameInput('');
    setValueInput('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm z-50 flex flex-col select-none">
      {/* Header */}
      <div className="h-14 px-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-neutral-300" />
          <h2 className="text-sm font-semibold text-neutral-100">
            Cookie与缓存数据管理
          </h2>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Account Mode Indicator */}
      <div className="px-4 py-2.5 bg-neutral-850 border-b border-neutral-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isIsolated ? (
            <span className="text-amber-300 font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              当前：隔离账户 Cookie 分区 (零泄漏)
            </span>
          ) : (
            <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              当前：常规主账户 Cookie 分区
            </span>
          )}
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">
          已隔离条目: {cookies.length}
        </span>
      </div>

      {/* Action Bar */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-700"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>写入自定义 Cookie</span>
        </button>

        {cookies.length > 0 && (
          <button
            onClick={onClearCookies}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空当前模式 Cookies</span>
          </button>
        )}
      </div>

      {/* Add Cookie Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="p-4 bg-neutral-900 border-b border-neutral-800 space-y-2.5">
          <div className="text-xs font-semibold text-neutral-200">添加会话 Cookie 凭证</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="域名 (例如: github.com)"
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-500"
              required
            />
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="键名 (例如: session_id)"
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-500"
              required
            />
          </div>
          <input
            type="text"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            placeholder="键值 (例如: auth_token_secret_xyz)"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-500"
            required
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs text-neutral-400 hover:text-neutral-200"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-neutral-200 hover:bg-white text-neutral-900 text-xs font-medium rounded-lg transition-colors"
            >
              保存至当前空间
            </button>
          </div>
        </form>
      )}

      {/* Cookies List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-w-lg mx-auto w-full">
        {cookies.length === 0 ? (
          <div className="text-center py-16 text-xs text-neutral-500">
            当前账户空间下暂无 Cookie 数据
          </div>
        ) : (
          cookies.map((ck) => (
            <div
              key={ck.id}
              className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-neutral-200 font-mono">
                    {ck.name}
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.2 rounded font-mono">
                    {ck.domain}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono break-all mt-1 bg-neutral-950/60 p-1.5 rounded border border-neutral-850">
                  {ck.value}
                </div>
              </div>

              <button
                onClick={() => onRemoveCookie(ck.id)}
                className="p-1 text-neutral-500 hover:text-red-400 rounded transition-colors"
                title="删除 Cookie"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
