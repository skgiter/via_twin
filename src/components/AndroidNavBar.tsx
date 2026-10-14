/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronLeft, Circle, Square } from 'lucide-react';

interface Props {
  onGoToDesktop: () => void;
  onSystemBack?: () => void;
}

export const AndroidNavBar: React.FC<Props> = ({
  onGoToDesktop,
  onSystemBack,
}) => {
  const [use3Buttons, setUse3Buttons] = useState(false);

  return (
    <div className="h-7 w-full flex items-center justify-between px-8 bg-neutral-900 border-t border-neutral-850 select-none">
      {use3Buttons ? (
        <>
          {/* Back button */}
          <button
            onClick={onSystemBack}
            className="w-10 h-6 flex items-center justify-center text-neutral-400 hover:text-neutral-200 active:scale-95 transition-transform"
            title="返回"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Home button (返回桌面) */}
          <button
            onClick={onGoToDesktop}
            className="w-10 h-6 flex items-center justify-center text-neutral-400 hover:text-neutral-200 active:scale-95 transition-transform"
            title="返回系统桌面 (将触发隔离模式自动退出)"
          >
            <Circle className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Recents button */}
          <button
            onClick={onGoToDesktop}
            className="w-10 h-6 flex items-center justify-center text-neutral-400 hover:text-neutral-200 active:scale-95 transition-transform"
            title="最近任务/多任务 (切换应用)"
          >
            <Square className="w-3 h-3 stroke-[2.5]" />
          </button>
        </>
      ) : (
        /* Gesture Pill */
        <div className="w-full flex items-center justify-center relative">
          <button
            onClick={onGoToDesktop}
            className="group flex flex-col items-center py-1 px-4 cursor-pointer"
            title="向上轻扫或点击返回手机桌面 (自动退回普通模式)"
          >
            <div className="w-28 h-1 bg-neutral-600 rounded-full group-hover:bg-neutral-400 transition-colors" />
            <span className="text-[8px] text-neutral-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              点击返回桌面
            </span>
          </button>

          <button
            onClick={() => setUse3Buttons(true)}
            className="absolute right-0 text-[9px] text-neutral-500 hover:text-neutral-300"
            title="切换至三键导航"
          >
            三键
          </button>
        </div>
      )}
    </div>
  );
};
