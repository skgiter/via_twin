/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Wifi, BatteryMedium, ShieldAlert } from 'lucide-react';
import { AccountMode } from '../types/browser';

interface Props {
  mode: AccountMode;
  showSecretIndicator: boolean;
  onSimulatePowerLock?: () => void;
}

export const AndroidStatusBar: React.FC<Props> = ({
  mode,
  showSecretIndicator,
  onSimulatePowerLock,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const isIsolated = mode === 'isolated';

  return (
    <div className="h-7 w-full flex items-center justify-between px-3 text-[11px] font-medium tracking-tight select-none z-30 transition-colors bg-neutral-900/90 text-neutral-300">
      {/* Left zone: Clock & subtle stealth indicator */}
      <div className="flex items-center gap-1.5">
        <span className="font-semibold tabular-nums text-neutral-200">{timeStr}</span>
        {isIsolated && showSecretIndicator && (
          <div
            title="平行隔离空间运行中"
            className="flex items-center gap-1 text-[10px] text-amber-400 font-mono"
          >
            <ShieldAlert className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="text-[9px] uppercase tracking-wider">ISO</span>
          </div>
        )}
      </div>

      {/* Right zone: Signal, WiFi, Battery, Power simulation trigger */}
      <div className="flex items-center gap-2">
        {onSimulatePowerLock && (
          <button
            onClick={onSimulatePowerLock}
            className="text-[9px] px-1.5 py-0.5 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            title="模拟息屏/锁定手机以测试无缝防窥切回普通模式"
          >
            模拟锁屏
          </button>
        )}
        <span className="text-[10px] text-neutral-400 font-semibold">5G</span>
        <Wifi className="w-3.5 h-3.5 text-neutral-300" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] tabular-nums text-neutral-400">92%</span>
          <BatteryMedium className="w-3.5 h-3.5 text-neutral-300" />
        </div>
      </div>
    </div>
  );
};
