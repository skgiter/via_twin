/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lock, Smartphone, ArrowUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onWakeUp: () => void;
}

export const ScreenLockOverlay: React.FC<Props> = ({ isOpen, onWakeUp }) => {
  const [currentTime, setCurrentTime] = useState('09:41');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);

      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      setCurrentDate(`${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`);
    };
    update();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onWakeUp}
      className="absolute inset-0 bg-black z-60 flex flex-col items-center justify-between p-8 text-neutral-150 select-none animate-in fade-in duration-300 cursor-pointer"
    >
      {/* Top Lock Icon */}
      <div className="flex flex-col items-center gap-1 pt-6">
        <Lock className="w-5 h-5 text-neutral-400" />
        <span className="text-[10px] text-neutral-500">已锁屏 / 息屏中</span>
      </div>

      {/* Clock Display */}
      <div className="flex flex-col items-center -mt-16">
        <div className="text-6xl font-light tracking-tight text-white font-sans">
          {currentTime}
        </div>
        <div className="text-sm text-neutral-400 mt-2">
          {currentDate}
        </div>
      </div>

      {/* Slide / Click to Unlock prompt */}
      <div className="flex flex-col items-center gap-2 pb-6 animate-bounce">
        <ArrowUp className="w-4 h-4 text-neutral-400" />
        <span className="text-xs text-neutral-300 font-medium">
          点击屏幕任意位置解锁手机
        </span>
        <span className="text-[10px] text-neutral-500">
          (已自动触发防窥机制：无缝切回普通主账户)
        </span>
      </div>
    </div>
  );
};
