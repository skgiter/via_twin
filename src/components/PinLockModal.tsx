/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Delete, X, Lock } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  verifyPin: (pin: string) => boolean;
}

export const PinLockModal: React.FC<Props> = ({
  onSuccess,
  onCancel,
  verifyPin,
}) => {
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleKeyPress = (num: string) => {
    if (pin.length >= 6) return;
    const nextPin = pin + num;
    setPin(nextPin);
    setErrorMessage('');

    // If 4 digits entered, automatically verify
    if (nextPin.length === 4) {
      if (verifyPin(nextPin)) {
        if (navigator.vibrate) {
          try {
            navigator.vibrate([30, 50, 30]);
          } catch {}
        }
        onSuccess();
      } else {
        triggerError();
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const triggerError = () => {
    setErrorShake(true);
    setErrorMessage('PIN 码错误，请重试');
    if (navigator.vibrate) {
      try {
        navigator.vibrate(100);
      } catch {}
    }
    setTimeout(() => {
      setPin('');
      setErrorShake(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex flex-col justify-between items-center p-6 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="w-full flex justify-end">
        <button
          onClick={onCancel}
          className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center PIN Display */}
      <div className={`flex flex-col items-center gap-4 max-w-xs ${errorShake ? 'animate-shake' : ''}`}>
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <Lock className="w-7 h-7 text-amber-400" />
        </div>

        <div className="text-center">
          <h2 className="text-base font-semibold text-neutral-100">
            平行隔离空间鉴权
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            请输入安全 PIN 码以加载独立书签与缓存
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex items-center gap-4 my-3">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-amber-400 scale-110 shadow-sm shadow-amber-400/50'
                    : 'border-2 border-neutral-700 bg-neutral-900'
                }`}
              />
            );
          })}
        </div>

        {errorMessage ? (
          <div className="text-xs text-red-400 font-medium">{errorMessage}</div>
        ) : (
          <div className="text-[11px] text-neutral-500 font-mono">
            默认初始 PIN: 1234
          </div>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 mb-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleKeyPress(digit)}
            className="h-14 rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:bg-neutral-800 active:scale-95 text-lg font-semibold text-neutral-100 flex items-center justify-center transition-all shadow-sm"
          >
            {digit}
          </button>
        ))}

        {/* Empty placeholder for alignment */}
        <button
          onClick={onCancel}
          className="h-14 rounded-2xl text-xs font-medium text-neutral-400 hover:text-neutral-200 flex items-center justify-center"
        >
          取消
        </button>

        {/* '0' */}
        <button
          onClick={() => handleKeyPress('0')}
          className="h-14 rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:bg-neutral-800 active:scale-95 text-lg font-semibold text-neutral-100 flex items-center justify-center transition-all shadow-sm"
        >
          0
        </button>

        {/* Backspace */}
        <button
          onClick={handleDelete}
          className="h-14 rounded-2xl hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 flex items-center justify-center active:scale-95 transition-all"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
