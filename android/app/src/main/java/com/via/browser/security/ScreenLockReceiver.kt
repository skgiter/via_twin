package com.via.browser.security

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log

/**
 * 屏幕关闭与锁屏广播监听器
 * 核心设计目标：在系统硬件息屏前第一瞬间捕获 ACTION_SCREEN_OFF 事件，
 * 在 Display 供电关闭前 1 帧完成隔离空间退回与 UI 同步掩盖，彻底杜绝开屏复苏时的首帧残影泄露。
 */
class ScreenLockReceiver(private val onScreenOffCallback: () -> Unit) : BroadcastReceiver() {

    private var isRegistered = false

    override fun onReceive(context: Context?, intent: Intent?) {
        when (intent?.action) {
            Intent.ACTION_SCREEN_OFF -> {
                Log.d("ZeroFrameSecurity", "捕获到 ACTION_SCREEN_OFF 息屏信号：立即执行0帧锁退")
                onScreenOffCallback.invoke()
            }
            Intent.ACTION_USER_PRESENT -> {
                // 屏幕解锁信号
            }
        }
    }

    fun register(context: Context) {
        if (!isRegistered) {
            val filter = IntentFilter().apply {
                addAction(Intent.ACTION_SCREEN_OFF)
                addAction(Intent.ACTION_USER_PRESENT)
                // 提高广播处理优先级
                priority = IntentFilter.SYSTEM_HIGH_PRIORITY
            }
            context.registerReceiver(this, filter)
            isRegistered = true
        }
    }

    fun unregister(context: Context) {
        if (isRegistered) {
            try {
                context.unregisterReceiver(this)
            } catch (e: Exception) {
                // ignore
            }
            isRegistered = false
        }
    }
}
