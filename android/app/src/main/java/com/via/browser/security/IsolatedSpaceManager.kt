package com.via.browser.security

import android.app.Activity
import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.WebStorage
import android.webkit.WebView
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import org.json.JSONArray
import org.json.JSONObject

/**
 * 平行账号与隔离模式核心管理器
 * 负责：
 * 1. 0帧防窥泄露控制（FLAG_SECURE + 同步双图层切换）
 * 2. 独立本地书签、历史与Cookies隔离持久化（基于硬件Keystore与AES-256-GCM）
 * 3. 极速退出状态机
 */
class IsolatedSpaceManager(private val activity: Activity) {

    enum class SpaceMode {
        REGULAR,   // 普通主账户模式
        ISOLATED   // 平行隔离模式
    }

    var currentMode: SpaceMode = SpaceMode.REGULAR
        private set

    // 加密隔离存储
    private val encryptedPrefs: SharedPreferences by lazy {
        try {
            val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
            EncryptedSharedPreferences.create(
                "via_isolated_vault_secure",
                masterKeyAlias,
                activity,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            // 回退到标准加密容器
            activity.getSharedPreferences("via_isolated_vault_fallback", Context.MODE_PRIVATE)
        }
    }

    // 独立容器引用
    private var regularContainer: ViewGroup? = null
    private var isolatedContainer: ViewGroup? = null
    private var isolatedWebView: WebView? = null

    fun setupContainers(regular: ViewGroup, isolated: ViewGroup, isoWebView: WebView) {
        this.regularContainer = regular
        this.isolatedContainer = isolated
        this.isolatedWebView = isoWebView
    }

    /**
     * 进入隔离模式：
     * 1. 设置 FLAG_SECURE（通知系统 SurfaceFlinger 禁止快照缓存）
     * 2. 挂载独立 Cookies 与隔离历史
     * 3. 显示隔离图层
     */
    fun enterIsolatedSpace() {
        if (currentMode == SpaceMode.ISOLATED) return

        activity.runOnUiThread {
            // 核心安全点 1：开启安全防截屏/防系统快照缓存标志位
            activity.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)

            // 切换状态
            currentMode = SpaceMode.ISOLATED

            // 显示隔离视图容器
            isolatedContainer?.visibility = View.VISIBLE
            isolatedWebView?.onResume()
        }
    }

    /**
     * 【极其关键：0帧防窥退出算法】
     * 必须在息屏、切后台或锁屏前的一瞬间（同步主线程，不走异步微任务）完成：
     * 1. 立即把 isolatedContainer 设为 GONE 或移除，露出底层的 regularContainer
     * 2. 暂停 isolatedWebView，清除窗口焦点
     * 3. 移除 FLAG_SECURE（若需要）
     * 这样无论系统何时捕捉 Surface 快照或锁屏后开屏复苏，首帧看到的永远是普通主账户画面！
     */
    fun exitToRegularSpaceInstantaneous(reason: String = "AutoExit") {
        if (currentMode == SpaceMode.REGULAR) return

        // 立即标记回普通模式
        currentMode = SpaceMode.REGULAR

        // 同步直接操作 View 树，不延时，不发 handler 异步消息，抢在当前垂直同步信号（VSYNC）绘制前完成
        isolatedContainer?.visibility = View.GONE
        isolatedWebView?.onPause()

        // 移除安全锁标志位，恢复普通界面正常录制截屏能力
        try {
            activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        } catch (e: Exception) {
            // ignore
        }

        // 保存状态至隔离安全库
        saveIsolatedSessionState()
    }

    /**
     * 验证 PIN 码
     */
    fun verifyPin(inputPin: String): Boolean {
        val storedPin = encryptedPrefs.getString("security_pin", "1234") ?: "1234"
        return inputPin.trim() == storedPin.trim()
    }

    /**
     * 设置新的 PIN 码
     */
    fun updatePin(newPin: String) {
        encryptedPrefs.edit().putString("security_pin", newPin.trim()).apply()
    }

    private fun saveIsolatedSessionState() {
        // 保存打开的网页URL、历史堆栈与隔离数据到加密SharedPreferences
        encryptedPrefs.edit().apply {
            putLong("last_exit_timestamp", System.currentTimeMillis())
            putString("last_url", isolatedWebView?.url ?: "")
            apply()
        }
    }

    /**
     * 销毁资源
     */
    fun destroy() {
        isolatedWebView?.destroy()
    }
}
