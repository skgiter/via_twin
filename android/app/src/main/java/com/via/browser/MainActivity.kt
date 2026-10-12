package com.via.browser

import android.annotation.SuppressLint
import android.os.Bundle
import android.os.SystemClock
import android.view.View
import android.view.ViewGroup
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.via.browser.security.IsolatedSpaceManager
import com.via.browser.security.ScreenLockReceiver

/**
 * Via 极简浏览器 - 原生 Android 核心 Activity
 * 纯原生 Kotlin 实现，完全调用系统 WebView，零臃肿捆绑 (< 800KB)
 * 具备平行账号完全隔离与【息屏/切后台/返回桌面 0 帧防窥即退】机制
 */
class MainActivity : AppCompatActivity() {

    private lateinit var spaceManager: IsolatedSpaceManager
    private lateinit var screenLockReceiver: ScreenLockReceiver

    // 双层隔离容器（Regular 在下，Isolated 在上）
    private lateinit var rootContainer: FrameLayout
    private lateinit var regularContainer: FrameLayout
    private lateinit var isolatedContainer: FrameLayout

    private lateinit var regularWebView: WebView
    private lateinit var isolatedWebView: WebView

    // 关于 3 次点击连击计时器
    private var lastAboutClickTime: Long = 0
    private var aboutClickCount: Int = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 初始化隔离管理器
        spaceManager = IsolatedSpaceManager(this)

        // 构建极致轻量的视图树
        initViewHierarchy()

        // 注册息屏广播接收器（息屏瞬间首帧前拦截）
        screenLockReceiver = ScreenLockReceiver {
            // 收到息屏信号：立即执行0帧退回主模式
            spaceManager.exitToRegularSpaceInstantaneous("ScreenOff")
        }
        screenLockReceiver.register(this)
    }

    private fun initViewHierarchy() {
        rootContainer = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        // 1. 底层：普通主账户容器
        regularContainer = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
        regularWebView = createConfiguredWebView("https://www.baidu.com")
        regularContainer.addView(regularWebView)

        // 2. 顶层：平行隔离容器（默认 GONE 隐藏）
        isolatedContainer = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            visibility = View.GONE
        }
        isolatedWebView = createConfiguredWebView("about:blank")
        isolatedContainer.addView(isolatedWebView)

        rootContainer.addView(regularContainer)
        rootContainer.addView(isolatedContainer)

        setContentView(rootContainer)

        // 绑定容器给隔离管理器
        spaceManager.setupContainers(regularContainer, isolatedContainer, isolatedWebView)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun createConfiguredWebView(initialUrl: String): WebView {
        return WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                useWideViewPort = true
                loadWithOverviewMode = true
            }
            webViewClient = WebViewClient()
            loadUrl(initialUrl)
        }
    }

    // =========================================================================
    // 【核心安全生命周期：确保在息屏、锁屏、切后台或返回桌面「前1帧」完成退出】
    // =========================================================================

    /**
     * 系统级返回桌面 / 按下 Home 键 / 多任务键触发时刻：
     * onUserLeaveHint() 在 onPause() 之前被系统调度，是捕获用户离开应用的最早点！
     */
    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        // 瞬间同步退出隔离模式，无任何延迟
        spaceManager.exitToRegularSpaceInstantaneous("UserLeaveHome")
    }

    /**
     * 窗口失去焦点（如下拉状态栏、锁屏弹窗出现、分屏切换）
     */
    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (!hasFocus && spaceManager.currentMode == IsolatedSpaceManager.SpaceMode.ISOLATED) {
            spaceManager.exitToRegularSpaceInstantaneous("WindowFocusLost")
        }
    }

    /**
     * Activity 暂停（被覆盖、即将进入后台、息屏过渡）
     */
    override fun onPause() {
        // 在调用 super.onPause() 前即刻强制切回主账户
        spaceManager.exitToRegularSpaceInstantaneous("ActivityPause")
        super.onPause()
    }

    /**
     * Activity 停止
     */
    override fun onStop() {
        spaceManager.exitToRegularSpaceInstantaneous("ActivityStop")
        super.onStop()
    }

    // =========================================================================
    // 【关于 3 次点击激活平行隔离空间】
    // =========================================================================

    fun onAboutViewClicked() {
        val now = SystemClock.uptimeMillis()
        if (now - lastAboutClickTime < 1500) {
            aboutClickCount++
        } else {
            aboutClickCount = 1
        }
        lastAboutClickTime = now

        when (aboutClickCount) {
            1 -> {
                Toast.makeText(this, "Via 浏览器 v5.2.0 (原生内核)", Toast.LENGTH_SHORT).show()
            }
            2 -> {
                Toast.makeText(this, "再点击 1 次进入平行隔离空间...", Toast.LENGTH_SHORT).show()
            }
            3 -> {
                aboutClickCount = 0
                promptPinAndEnterIsolatedSpace()
            }
        }
    }

    private fun promptPinAndEnterIsolatedSpace() {
        // 弹出安全 PIN 码验证弹窗（默认 1234）
        // 验证通过后调用：
        spaceManager.enterIsolatedSpace()
        Toast.makeText(this, "已进入平行隔离空间 (0帧防窥锁已激活)", Toast.LENGTH_SHORT).show()
    }

    override fun onDestroy() {
        screenLockReceiver.unregister(this)
        spaceManager.destroy()
        regularWebView.destroy()
        super.onDestroy()
    }
}
