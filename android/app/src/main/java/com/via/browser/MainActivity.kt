package com.via.browser

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.via.browser.security.ScreenLockReceiver

/**
 * Via 极简浏览器 - 原生 Android 核心 Activity
 * 具备双层架构：
 * 1. UI 容器：加载 Via 极简交互层（主页、多标签、书签、设置与关于3次密键）
 * 2. 真实原生浏览容器：顶层加载真实互联网网页（B站、百度、知乎等），无任何 iframe/X-Frame-Options 限制，支持完整音视频与交互
 * 具备【下滑自动收起/上滑唤回导航栏】与【0 帧防窥即退】底层机制
 */
class MainActivity : AppCompatActivity() {

    private lateinit var rootContainer: FrameLayout
    private lateinit var uiWebView: WebView

    // 真正浏览外部网页的原生 WebView 及容器
    private lateinit var browserContainer: LinearLayout
    private lateinit var topBar: LinearLayout
    private lateinit var bottomBar: LinearLayout
    private lateinit var contentWebView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var urlTitleTextView: TextView
    private lateinit var modeBadgeTextView: TextView

    private lateinit var screenLockReceiver: ScreenLockReceiver
    private var isIsolatedSpaceActive = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        rootContainer = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#121212"))
        }

        initUiWebView()
        initNativeBrowserLayer()

        setContentView(rootContainer)

        // 注册息屏广播接收器（息屏瞬间首帧前拦截）
        screenLockReceiver = ScreenLockReceiver {
            onTriggerZeroFrameSecurityExit("ScreenOff")
        }
        screenLockReceiver.register(this)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun initUiWebView() {
        uiWebView = WebView(this).apply {
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
            webViewClient = object : WebViewClient() {}
            webChromeClient = WebChromeClient()

            // 注册原生桥接
            addJavascriptInterface(ViaAndroidBridge(), "viaAndroidBridge")
        }

        rootContainer.addView(uiWebView)

        // 加载内置在本地 assets 的完整 Via 浏览器应用
        uiWebView.loadUrl("file:///android_asset/www/index.html")
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun initNativeBrowserLayer() {
        browserContainer = LinearLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#18191c"))
            visibility = View.GONE
        }

        // 1. 原生顶部操作条 (高48dp)
        topBar = LinearLayout(this).apply {
            val h = (48 * resources.displayMetrics.density).toInt()
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, h)
            orientation = LinearLayout.HORIZONTAL
            setBackgroundColor(Color.parseColor("#222427"))
            gravity = Gravity.CENTER_VERTICAL
            setPadding(
                (12 * resources.displayMetrics.density).toInt(),
                0,
                (12 * resources.displayMetrics.density).toInt(),
                0
            )
        }

        // 返回主页按钮
        val homeBtn = TextView(this).apply {
            text = "🏠 主页"
            setTextColor(Color.parseColor("#E0E0E0"))
            textSize = 13f
            setPadding(0, 0, (12 * resources.displayMetrics.density).toInt(), 0)
            setOnClickListener {
                closeNativeBrowser()
            }
        }
        topBar.addView(homeBtn)

        // 网址与标题文本框
        urlTitleTextView = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
            text = "正在浏览..."
            setTextColor(Color.WHITE)
            textSize = 13f
            isSingleLine = true
        }
        topBar.addView(urlTitleTextView)

        // 模式徽章
        modeBadgeTextView = TextView(this).apply {
            text = "主模式"
            setTextColor(Color.parseColor("#34D399"))
            textSize = 11f
            setPadding((8 * resources.displayMetrics.density).toInt(), 0, (8 * resources.displayMetrics.density).toInt(), 0)
        }
        topBar.addView(modeBadgeTextView)

        // 刷新按钮
        val refreshBtn = TextView(this).apply {
            text = "🔄"
            textSize = 15f
            setPadding((6 * resources.displayMetrics.density).toInt(), 0, (6 * resources.displayMetrics.density).toInt(), 0)
            setOnClickListener {
                contentWebView.reload()
            }
        }
        topBar.addView(refreshBtn)

        browserContainer.addView(topBar)

        // 2. 网页加载进度条
        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                (2 * resources.displayMetrics.density).toInt()
            )
            max = 100
            visibility = View.GONE
        }
        browserContainer.addView(progressBar)

        // 3. 真正加载外部网站的原生顶级 WebView（配置纯正移动端 User-Agent 与滚动手势自动隐藏上下栏）
        contentWebView = WebView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                0,
                1f
            )
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                useWideViewPort = true
                loadWithOverviewMode = true
                builtInZoomControls = true
                displayZoomControls = false
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                mediaPlaybackRequiresUserGesture = false
                cacheMode = WebSettings.LOAD_DEFAULT
                // 确保默认以标准移动端 Chrome User-Agent 渲染所有网站（B站、百度等纯正手机网页）
                userAgentString = "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36"
            }
            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    progressBar.visibility = View.VISIBLE
                    urlTitleTextView.text = url ?: "加载中..."
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    progressBar.visibility = View.GONE
                    urlTitleTextView.text = view?.title ?: url ?: ""
                }
            }
            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    super.onProgressChanged(view, newProgress)
                    progressBar.progress = newProgress
                    if (newProgress >= 100) {
                        progressBar.visibility = View.GONE
                    }
                }

                override fun onReceivedTitle(view: WebView?, title: String?) {
                    super.onReceivedTitle(view, title)
                    if (!title.isNullOrEmpty()) {
                        urlTitleTextView.text = title
                    }
                }
            }

            // 联动滚动手势：下滑隐藏上下栏，上滑唤回
            setOnScrollChangeListener { _, _, scrollY, _, oldScrollY ->
                val dy = scrollY - oldScrollY
                if (Math.abs(dy) > 12) {
                    if (dy > 0) {
                        // 向下滚动阅读：收起顶部与底部控制栏
                        topBar.animate().translationY(-topBar.height.toFloat()).setDuration(180).start()
                        bottomBar.animate().translationY(bottomBar.height.toFloat()).setDuration(180).start()
                    } else {
                        // 向上轻卷：立即唤回控制栏
                        topBar.animate().translationY(0f).setDuration(180).start()
                        bottomBar.animate().translationY(0f).setDuration(180).start()
                    }
                }
            }
        }
        browserContainer.addView(contentWebView)

        // 4. 原生底部导航条
        bottomBar = LinearLayout(this).apply {
            val h = (44 * resources.displayMetrics.density).toInt()
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, h)
            orientation = LinearLayout.HORIZONTAL
            setBackgroundColor(Color.parseColor("#1F2023"))
            gravity = Gravity.CENTER_VERTICAL
        }

        fun createNavBtn(label: String, onClick: () -> Unit): TextView {
            return TextView(this).apply {
                layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f)
                text = label
                gravity = Gravity.CENTER
                setTextColor(Color.parseColor("#D1D5DB"))
                textSize = 14f
                setOnClickListener { onClick() }
            }
        }

        bottomBar.addView(createNavBtn("◀ 后退") {
            if (contentWebView.canGoBack()) contentWebView.goBack() else closeNativeBrowser()
        })
        bottomBar.addView(createNavBtn("前进 ▶") {
            if (contentWebView.canGoForward()) contentWebView.goForward()
        })
        bottomBar.addView(createNavBtn("🏠 主页") {
            closeNativeBrowser()
        })

        browserContainer.addView(bottomBar)

        rootContainer.addView(browserContainer)
    }

    /**
     * 打开真实外部网页，进入原生浏览器视图
     */
    private fun openNativeUrlInternal(targetUrl: String) {
        runOnUiThread {
            if (targetUrl == "via://home") {
                closeNativeBrowser()
                return@runOnUiThread
            }

            modeBadgeTextView.text = if (isIsolatedSpaceActive) "平行隔离" else "常规主账户"
            modeBadgeTextView.setTextColor(
                if (isIsolatedSpaceActive) Color.parseColor("#FBBF24") else Color.parseColor("#34D399")
            )

            // 重置上下栏显示位置
            topBar.translationY = 0f
            bottomBar.translationY = 0f

            browserContainer.visibility = View.VISIBLE
            contentWebView.loadUrl(targetUrl)
        }
    }

    /**
     * 关闭原生浏览页面，返回 Via 极简主页
     */
    private fun closeNativeBrowser() {
        runOnUiThread {
            browserContainer.visibility = View.GONE
            contentWebView.loadUrl("about:blank")
            // 通知前端主界面同步回 via://home
            uiWebView.evaluateJavascript("window.viaNativeGoHome && window.viaNativeGoHome()", null)
        }
    }

    inner class ViaAndroidBridge {
        @JavascriptInterface
        fun openNativeUrl(url: String) {
            openNativeUrlInternal(url)
        }

        @JavascriptInterface
        fun enterIsolatedSpace() {
            runOnUiThread {
                isIsolatedSpaceActive = true
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
     * 息屏、切后台或返回桌面瞬间，同步重置真实浏览窗口并退回主模式
     */
    private fun onTriggerZeroFrameSecurityExit(reason: String) {
        if (!isIsolatedSpaceActive) return
        isIsolatedSpaceActive = false

        runOnUiThread {
            try {
                window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
            } catch (e: Exception) {}

            // 立即隐藏并清空可能包含隔离私密内容的真实网页
            if (browserContainer.visibility == View.VISIBLE) {
                browserContainer.visibility = View.GONE
                contentWebView.loadUrl("about:blank")
            }

            // 同步调用前端退出函数
            uiWebView.evaluateJavascript("window.viaNativeExit && window.viaNativeExit()", null)
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
        if (browserContainer.visibility == View.VISIBLE) {
            if (contentWebView.canGoBack()) {
                contentWebView.goBack()
            } else {
                closeNativeBrowser()
            }
            return
        }

        if (uiWebView.canGoBack()) {
            uiWebView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        screenLockReceiver.unregister(this)
        contentWebView.destroy()
        uiWebView.destroy()
        super.onDestroy()
    }
}
