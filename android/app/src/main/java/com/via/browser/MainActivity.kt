package com.via.browser

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.via.browser.security.ScreenLockReceiver

/**
 * Via 极简浏览器 - 原生 Android 核心 Activity
 * 纯原生 Android 驱动，本地离线加载完整 Via 交互界面（主页、多标签、底栏、书签历史与设置）
 * 具备【0 帧防窥即退】底层机制：FLAG_SECURE + onUserLeaveHint + ACTION_SCREEN_OFF
 */
class MainActivity : AppCompatActivity() {

    private lateinit var rootContainer: FrameLayout
    private lateinit var webView: WebView
    private lateinit var screenLockReceiver: ScreenLockReceiver

    private var isIsolatedSpaceActive = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        rootContainer = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        initWebView()
        setContentView(rootContainer)

        // 注册息屏广播接收器（息屏瞬间首帧前拦截）
        screenLockReceiver = ScreenLockReceiver {
            onTriggerZeroFrameSecurityExit("ScreenOff")
        }
        screenLockReceiver.register(this)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun initWebView() {
        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                allowFileAccessFromFileURLs = true
                allowUniversalAccessFromFileURLs = true
                cacheMode = WebSettings.LOAD_DEFAULT
                useWideViewPort = true
                loadWithOverviewMode = true
            }
            webViewClient = object : WebViewClient() {
                // Keep file and internal navigation inside WebView
            }
            webChromeClient = WebChromeClient()

            // 注册原生桥接
            addJavascriptInterface(ViaAndroidBridge(), "viaAndroidBridge")
        }

        rootContainer.addView(webView)

        // 加载内置在本地 assets 的完整 Via 浏览器应用
        webView.loadUrl("file:///android_asset/www/index.html")
    }

    inner class ViaAndroidBridge {
        @JavascriptInterface
        fun enterIsolatedSpace() {
            runOnUiThread {
                isIsolatedSpaceActive = true
                // 开启硬件级安全防截屏/防系统快照缓存标志位
                window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
            }
        }

        @JavascriptInterface
        fun exitIsolatedSpace() {
            runOnUiThread {
                isIsolatedSpaceActive = false
                try {
                    window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
                } catch (e: Exception) {}
            }
        }
    }

    /**
     * 【0帧防窥锁退】
     * 息屏、切后台或返回桌面瞬间，同步通知前端退回主模式
     */
    private fun onTriggerZeroFrameSecurityExit(reason: String) {
        if (!isIsolatedSpaceActive) return
        isIsolatedSpaceActive = false

        runOnUiThread {
            try {
                window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
            } catch (e: Exception) {}

            // 立即同步调用前端退出函数
            webView.evaluateJavascript("window.viaNativeExit && window.viaNativeExit()", null)
        }
    }

    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        onTriggerZeroFrameSecurityExit("UserLeaveHome")
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (!hasFocus && isIsolatedSpaceActive) {
            onTriggerZeroFrameSecurityExit("WindowFocusLost")
        }
    }

    override fun onPause() {
        onTriggerZeroFrameSecurityExit("ActivityPause")
        super.onPause()
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        screenLockReceiver.unregister(this)
        webView.destroy()
        super.onDestroy()
    }
}
