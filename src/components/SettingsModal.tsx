/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  Search,
  Shield,
  ShieldAlert,
  Lock,
  Smartphone,
  Eye,
  Info,
  Check,
  AlertTriangle,
  KeyRound,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AccountMode, BrowserSettings } from '../types/browser';

interface Props {
  mode: AccountMode;
  settings: BrowserSettings;
  onUpdateSettings: (newSettings: Partial<BrowserSettings>) => void;
  onTriggerIsolatedMode: () => void;
  onExitToRegular: () => void;
  onResetIsolatedData: () => void;
  onChangePin: (pin: string) => void;
  onViewNativeAndroidCode: () => void;
  onOpenGitHubModal: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  mode,
  settings,
  onUpdateSettings,
  onTriggerIsolatedMode,
  onExitToRegular,
  onResetIsolatedData,
  onChangePin,
  onViewNativeAndroidCode,
  onOpenGitHubModal,
  onClose,
}) => {
  const isIsolated = mode === 'isolated';

  // 3-Click secret tracker
  const [clickCount, setClickCount] = useState(0);
  const [clickMessage, setClickMessage] = useState<string | null>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Change PIN modal state
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const handleAboutClick = () => {
    // Vibrate if available
    if (navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch {}
    }

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (isIsolated) {
      setClickMessage('当前已处于平行隔离模式');
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
        setClickMessage(null);
      }, 2000);
      return;
    }

    if (nextCount === 1) {
      setClickMessage('Via 浏览器 v5.2.0');
    } else if (nextCount === 2) {
      setClickMessage('再点击 1 次以进入隔离账号模式...');
    } else if (nextCount >= 3) {
      setClickCount(0);
      setClickMessage('🚀 验证进入平行隔离空间...');
      setTimeout(() => {
        setClickMessage(null);
        onTriggerIsolatedMode();
      }, 350);
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
      setClickMessage(null);
    }, 2000);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length < 4) {
      setPinError('PIN 码至少需要 4 位数字');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinError('两次输入的 PIN 码不一致');
      return;
    }
    onChangePin(newPinInput);
    setShowPinDialog(false);
    setNewPinInput('');
    setConfirmPinInput('');
    setPinError('');
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col select-none overflow-hidden animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="h-14 px-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-800 text-neutral-300 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold text-neutral-100">设置</h1>
        </div>

        <div className="flex items-center gap-1.5">
          {isIsolated ? (
            <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded font-medium flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              隔离模式
            </span>
          ) : (
            <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
              普通模式
            </span>
          )}
        </div>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-lg mx-auto w-full">
        {/* Section 1: Parallel Space Status & Controls */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-neutral-400 px-1 tracking-wider uppercase">
            平行账号与隔离空间
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800/70">
            {/* Status row */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
                  <span>当前账户空间</span>
                  {isIsolated ? (
                    <span className="text-[10px] text-amber-400 bg-amber-950 px-1.5 py-0.2 rounded border border-amber-800/50">
                      独立隔离模式
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800/50">
                      普通主账户 (默认)
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {isIsolated
                    ? '书签、历史与Cookies已完全物理隔离，息屏或切后台时秒级退出'
                    : '标准主模式，可连按“关于”3次进入加密隔离空间'}
                </div>
              </div>
            </div>

            {/* Quick action to exit if in isolated */}
            {isIsolated && (
              <div className="p-3.5 flex items-center justify-between bg-amber-950/20">
                <div>
                  <div className="text-xs font-medium text-amber-300">
                    立即切回普通主模式
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    数据已安全加密保留，绝不丢失
                  </div>
                </div>
                <button
                  onClick={onExitToRegular}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold rounded-lg transition-colors"
                >
                  安全退出
                </button>
              </div>
            )}

            {/* Auto exit on blur toggle */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-200">
                  切出应用立即退出隔离
                </div>
                <div className="text-[10px] text-neutral-400">
                  当用户切换至其他APP时，无缝切回普通模式
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoExitOnBlur}
                onChange={(e) =>
                  onUpdateSettings({ autoExitOnBlur: e.target.checked })
                }
                className="w-4 h-4 rounded text-neutral-100 bg-neutral-800 border-neutral-700"
              />
            </div>

            {/* Auto exit on return desktop */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-200">
                  返回桌面自动退出隔离
                </div>
                <div className="text-[10px] text-neutral-400">
                  用户轻扫返回手机桌面或按系统Home键，即刻恢复普通模式
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoExitOnReturnDesktop}
                onChange={(e) =>
                  onUpdateSettings({ autoExitOnReturnDesktop: e.target.checked })
                }
                className="w-4 h-4 rounded text-neutral-100 bg-neutral-800 border-neutral-700"
              />
            </div>

            {/* Auto exit on visibility / screen off */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-200">
                  关屏或息屏自动退出
                </div>
                <div className="text-[10px] text-neutral-400">
                  手机自动休眠或按下电源键锁屏后，自动恢复至普通账户
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoExitOnVisibilityChange}
                onChange={(e) =>
                  onUpdateSettings({ autoExitOnVisibilityChange: e.target.checked })
                }
                className="w-4 h-4 rounded text-neutral-100 bg-neutral-800 border-neutral-700"
              />
            </div>

            {/* Idle Lock Timeout */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-200">
                  无操作自动锁定时间
                </div>
                <div className="text-[10px] text-neutral-400">
                  防窥保护：无任何触摸点击时自动回落普通模式
                </div>
              </div>
              <select
                value={settings.autoExitTimeoutSeconds}
                onChange={(e) =>
                  onUpdateSettings({ autoExitTimeoutSeconds: Number(e.target.value) })
                }
                className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value={0}>不启用空闲计时</option>
                <option value={15}>15 秒</option>
                <option value={30}>30 秒 (推荐)</option>
                <option value={60}>1 分钟</option>
                <option value={180}>3 分钟</option>
              </select>
            </div>

            {/* Security PIN Lock Setting */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                  <span>隔离空间加密密码锁</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  默认 PIN 码为 1234，可随时自定义
                </div>
              </div>
              <button
                onClick={() => setShowPinDialog(true)}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition-colors border border-neutral-700"
              >
                修改密码
              </button>
            </div>

            {/* View Pure Native Android Kotlin Source */}
            <div className="p-3.5 flex items-center justify-between bg-emerald-950/20">
              <div>
                <div className="text-xs font-medium text-emerald-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>纯原生 Android 0帧防窥架构</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  FLAG_SECURE + onUserLeaveHint + ACTION_SCREEN_OFF 核心源码
                </div>
              </div>
              <button
                onClick={onViewNativeAndroidCode}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs rounded-lg transition-colors"
              >
                查看 Kotlin 源码
              </button>
            </div>

            {/* GitHub Actions CI/CD Build Row */}
            <div className="p-3.5 flex items-center justify-between bg-neutral-850">
              <div>
                <div className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                  <span>GitHub 云端自动打包 APK</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  一键推送到 GitHub 仓库并自动编译下载安装包
                </div>
              </div>
              <button
                onClick={onOpenGitHubModal}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition-colors border border-neutral-700"
              >
                打包指南
              </button>
            </div>

            {/* Reset isolated data if in isolated */}
            {isIsolated && (
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-red-400">
                    清空隔离空间数据
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    重置隔离分区的书签、历史、Cookies和保密笔记
                  </div>
                </div>
                <button
                  onClick={onResetIsolatedData}
                  className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/50 text-xs rounded-lg transition-colors"
                >
                  重置隔离数据
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: General & Browsing Settings */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-neutral-400 px-1 tracking-wider uppercase">
            通用与浏览体验
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800/70">
            {/* Search Engine */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-200">默认搜索引擎</div>
                <div className="text-[10px] text-neutral-400">地址栏检索与主页搜索</div>
              </div>
              <select
                value={settings.searchEngine}
                onChange={(e) =>
                  onUpdateSettings({
                    searchEngine: e.target.value as BrowserSettings['searchEngine'],
                  })
                }
                className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value="baidu">百度 (Baidu)</option>
                <option value="google">Google</option>
                <option value="bing">必应 (Bing)</option>
                <option value="duckduckgo">DuckDuckGo</option>
              </select>
            </div>

            {/* AdBlock */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-200">强力广告过滤</div>
                <div className="text-[10px] text-neutral-400">阻止常见侵入式弹窗与广告</div>
              </div>
              <input
                type="checkbox"
                checked={settings.adBlockEnabled}
                onChange={(e) =>
                  onUpdateSettings({ adBlockEnabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-neutral-100 bg-neutral-800 border-neutral-700"
              />
            </div>

            {/* Block Images */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-200">无图极速省流</div>
                <div className="text-[10px] text-neutral-400">节省流量并提升加载速度</div>
              </div>
              <input
                type="checkbox"
                checked={settings.blockImages}
                onChange={(e) =>
                  onUpdateSettings({ blockImages: e.target.checked })
                }
                className="w-4 h-4 rounded text-neutral-100 bg-neutral-800 border-neutral-700"
              />
            </div>
          </div>
        </div>

        {/* Section 3: THE SECRET "关于" (ABOUT) TRIGGER */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-neutral-400 px-1 tracking-wider uppercase">
            关于应用
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            {/* The Click Target Row */}
            <div
              onClick={handleAboutClick}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-850 active:bg-neutral-800 transition-colors relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-base text-neutral-100 shrink-0">
                  V
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-100 flex items-center gap-2">
                    <span>关于 Via 浏览器</span>
                    <span className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.2 rounded">
                      v5.2.0
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    轻量极简 · 安卓原生WebView内核 · 安装包仅 680KB
                  </div>
                </div>
              </div>

              {/* Discreet click status hint */}
              <div className="text-right shrink-0">
                {clickCount > 0 && (
                  <div className="text-[10px] font-mono text-amber-400 animate-pulse font-semibold">
                    {clickCount}/3
                  </div>
                )}
              </div>
            </div>

            {/* Feedback message banner if user is clicking */}
            {clickMessage && (
              <div className="px-4 py-2 bg-neutral-800/80 border-t border-neutral-800 text-[11px] text-amber-300 flex items-center justify-between">
                <span>{clickMessage}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              </div>
            )}
          </div>

          <div className="px-2 text-[10px] text-neutral-500 leading-relaxed">
            提示：Via 的设计理念是极客小巧与纯粹。连续点击“关于”3 次可触发平行空间鉴权入口。
          </div>
        </div>
      </div>

      {/* Change PIN Dialog */}
      {showPinDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xs bg-neutral-900 border border-neutral-700 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-neutral-100 mb-1 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              修改隔离空间 PIN 码
            </h3>
            <p className="text-[11px] text-neutral-400 mb-3">
              用于进入平行账号空间时的身份加密验证
            </p>

            <form onSubmit={handleSavePin} className="space-y-3">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">
                  新 PIN 码 (4 位数字)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="例如：1234"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100 tracking-widest font-mono text-center focus:outline-none focus:border-amber-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">
                  确认新 PIN 码
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="再次输入以确认"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100 tracking-widest font-mono text-center focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {pinError && (
                <div className="text-[10px] text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinDialog(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-amber-500 text-neutral-950 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
                >
                  保存设置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
