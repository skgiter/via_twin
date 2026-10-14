/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Smartphone, Code, Shield, Check, Copy, X, Cpu } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const NativeAndroidViewerModal: React.FC<Props> = ({ onClose }) => {
  const [activeFile, setActiveFile] = useState<'activity' | 'manager' | 'receiver'>('manager');
  const [copied, setCopied] = useState(false);

  const fileContents: Record<string, { name: string; desc: string; code: string }> = {
    manager: {
      name: 'IsolatedSpaceManager.kt',
      desc: '核心 0 帧防窥退出算法与底层双层 Surface 渲染控制',
      code: `package com.via.browser.security

import android.app.Activity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.WebView
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys

class IsolatedSpaceManager(private val activity: Activity) {
    enum class SpaceMode { REGULAR, ISOLATED }
    var currentMode: SpaceMode = SpaceMode.REGULAR
        private set

    private var regularContainer: ViewGroup? = null
    private var isolatedContainer: ViewGroup? = null
    private var isolatedWebView: WebView? = null

    fun enterIsolatedSpace() {
        if (currentMode == SpaceMode.ISOLATED) return
        activity.runOnUiThread {
            // 核心 1：设置 FLAG_SECURE，通知 SurfaceFlinger 彻底禁止系统快照与缓存
            activity.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
            currentMode = SpaceMode.ISOLATED
            isolatedContainer?.visibility = View.VISIBLE
            isolatedWebView?.onResume()
        }
    }

    /**
     * 【极其关键：0帧防窥退出算法】
     * 息屏、切后台或返回桌面瞬间（同步执行，不延时、不发异步消息）：
     * 直接把 isolatedContainer 置为 GONE，使底层 regularContainer 暴露在前
     * 这样无论系统何时捕捉快照或唤醒屏幕，第一帧显示的绝对是普通模式！
     */
    fun exitToRegularSpaceInstantaneous(reason: String) {
        if (currentMode == SpaceMode.REGULAR) return
        currentMode = SpaceMode.REGULAR

        // 同步直接操作 View 树，抢在垂直同步信号 (VSYNC) 之前生效
        isolatedContainer?.visibility = View.GONE
        isolatedWebView?.onPause()

        try {
            activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        } catch (e: Exception) {}
    }
}`,
    },
    activity: {
      name: 'MainActivity.kt',
      desc: '系统级早期事件捕获：onUserLeaveHint() 与生命周期拦截',
      code: `package com.via.browser

import android.os.Bundle
import android.view.View
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.via.browser.security.IsolatedSpaceManager
import com.via.browser.security.ScreenLockReceiver

class MainActivity : AppCompatActivity() {
    private lateinit var spaceManager: IsolatedSpaceManager
    private lateinit var screenLockReceiver: ScreenLockReceiver

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        spaceManager = IsolatedSpaceManager(this)

        // 注册息屏广播接收器（息屏瞬间首帧前拦截）
        screenLockReceiver = ScreenLockReceiver {
            spaceManager.exitToRegularSpaceInstantaneous("ScreenOff")
        }
        screenLockReceiver.register(this)
    }

    // 系统级返回桌面 / 按下 Home 键 / 多任务键：
    // onUserLeaveHint() 早于 onPause() 触发，属于离开应用的最早点
    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        spaceManager.exitToRegularSpaceInstantaneous("UserLeaveHome")
    }

    override fun onPause() {
        spaceManager.exitToRegularSpaceInstantaneous("ActivityPause")
        super.onPause()
    }
}`,
    },
    receiver: {
      name: 'ScreenLockReceiver.kt',
      desc: '高优先级 Intent.ACTION_SCREEN_OFF 息屏广播前置拦截',
      code: `package com.via.browser.security

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter

class ScreenLockReceiver(private val onScreenOffCallback: () -> Unit) : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == Intent.ACTION_SCREEN_OFF) {
            // PowerManagerService 发出息屏通知第一瞬间，抢在屏幕变暗前调用
            onScreenOffCallback.invoke()
        }
    }

    fun register(context: Context) {
        val filter = IntentFilter(Intent.ACTION_SCREEN_OFF).apply {
            priority = IntentFilter.SYSTEM_HIGH_PRIORITY
        }
        context.registerReceiver(this, filter)
    }
}`,
    },
  };

  const currentFileObj = fileContents[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFileObj.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-60 flex flex-col select-none overflow-hidden animate-in fade-in duration-150">
      {/* Header */}
      <div className="h-14 px-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <span>纯原生 Android 核心架构</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                0帧防窥泄露机制
              </span>
            </h2>
            <p className="text-[10px] text-neutral-400">基于 Kotlin + System WebView 极致轻量实现</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 bg-neutral-850 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {(['manager', 'activity', 'receiver'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveFile(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFile === key
                  ? 'bg-neutral-700 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {fileContents[key].name}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1 transition-colors border border-neutral-700"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? '已复制' : '复制代码'}</span>
        </button>
      </div>

      {/* File Description */}
      <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800/80 text-xs text-neutral-400 flex items-center justify-between">
        <span>{currentFileObj.desc}</span>
        <span className="text-[10px] font-mono text-neutral-500">Android SDK 34 / Java 17</span>
      </div>

      {/* Code Editor Preview */}
      <div className="flex-1 overflow-auto p-4 bg-neutral-950 font-mono text-xs text-neutral-300 leading-relaxed select-text">
        <pre className="whitespace-pre">{currentFileObj.code}</pre>
      </div>
    </div>
  );
};
