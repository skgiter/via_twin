/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Camera,
  Phone,
  MessageSquare,
  Settings,
  Image as GalleryIcon,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { AndroidStatusBar } from './AndroidStatusBar';

interface Props {
  isOpen: boolean;
  onOpenViaBrowser: () => void;
  onSimulatePowerLock: () => void;
}

export const AndroidDesktopOverlay: React.FC<Props> = ({
  isOpen,
  onOpenViaBrowser,
  onSimulatePowerLock,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);

      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      setDateStr(`${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`);
    };
    update();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-neutral-900 to-stone-950 text-white select-none overflow-hidden animate-in fade-in duration-200">
      {/* Top System Status Bar */}
      <AndroidStatusBar
        mode="regular"
        showSecretIndicator={false}
        onSimulatePowerLock={onSimulatePowerLock}
      />

      {/* Android Desktop Widget Area */}
      <div className="flex-1 px-6 pt-10 flex flex-col items-center">
        {/* Clock & Date Widget */}
        <div className="text-center mb-8">
          <div className="text-5xl font-light tracking-tight text-white/95">
            {timeStr}
          </div>
          <div className="text-xs text-neutral-400 mt-1.5 font-medium tracking-wide">
            {dateStr}
          </div>
        </div>

        {/* System Search Pill Widget */}
        <div className="w-full max-w-xs bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2.5 flex items-center justify-between text-xs text-neutral-300 shadow-lg mb-8">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-400">Google 快捷搜索...</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>

        {/* System Notice Toast */}
        <div className="bg-neutral-800/90 border border-neutral-700/80 rounded-2xl px-3.5 py-2 flex items-center gap-2 text-[11px] text-neutral-300 shadow-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>已返回手机桌面：Via 隔离模式已自动挂起并安全归位主账户</span>
        </div>
      </div>

      {/* Desktop App Icons Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-4 gap-y-6 gap-x-3 mb-6">
          {/* 1. Via Browser App (Main focus) */}
          <div
            onClick={onOpenViaBrowser}
            className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-600 flex items-center justify-center shadow-lg group-hover:border-neutral-400">
              <span className="text-2xl font-black text-white">V</span>
              {/* Badge indicating return to regular mode */}
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-neutral-900" />
            </div>
            <span className="text-[11px] text-neutral-200 font-medium">Via 浏览器</span>
          </div>

          {/* 2. Gallery */}
          <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-default">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow">
              <GalleryIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-neutral-400">相册</span>
          </div>

          {/* 3. Camera */}
          <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-default">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-neutral-400">相机</span>
          </div>

          {/* 4. Settings */}
          <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-default">
            <div className="w-14 h-14 rounded-2xl bg-neutral-700/60 border border-neutral-600 flex items-center justify-center text-neutral-300 shadow">
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-neutral-400">系统设置</span>
          </div>
        </div>

        {/* Dock Bar */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-3 flex items-center justify-around">
          <div className="w-11 h-11 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400">
            <Phone className="w-5 h-5" />
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div
            onClick={onOpenViaBrowser}
            className="w-11 h-11 rounded-2xl bg-neutral-800 border border-neutral-600 flex items-center justify-center text-white cursor-pointer hover:border-neutral-400 active:scale-95 transition-all"
            title="打开 Via 浏览器"
          >
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
