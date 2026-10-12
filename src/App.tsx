/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AccountDataSnapshot,
  AccountMode,
  BookmarkItem,
  BrowserSettings,
  HistoryItem,
  QuickDial,
  SiteCookie,
  TabItem,
} from './types/browser';
import { StorageService } from './services/storage';
import { MockSitesService } from './services/mockSites';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidNavBar } from './components/AndroidNavBar';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { HomePage } from './components/HomePage';
import { WebRenderer } from './components/WebRenderer';
import { TabsManagerModal } from './components/TabsManagerModal';
import { BookmarksHistoryModal } from './components/BookmarksHistoryModal';
import { MenuSheet } from './components/MenuSheet';
import { SettingsModal } from './components/SettingsModal';
import { PinLockModal } from './components/PinLockModal';
import { CookieStorageModal } from './components/CookieStorageModal';
import { SourceViewerModal } from './components/SourceViewerModal';
import { ScreenLockOverlay } from './components/ScreenLockOverlay';
import { AndroidDesktopOverlay } from './components/AndroidDesktopOverlay';
import { NativeAndroidViewerModal } from './components/NativeAndroidViewerModal';
import { GitHubBuildModal } from './components/GitHubBuildModal';
import { Smartphone, Monitor, Shield, Lock, EyeOff, Home as HomeIcon, Cpu, Github } from 'lucide-react';

export default function App() {
  // Current active mode: 'regular' by default
  const [mode, setMode] = useState<AccountMode>('regular');

  // Active account data
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [quickDials, setQuickDials] = useState<QuickDial[]>([]);
  const [cookies, setCookies] = useState<SiteCookie[]>([]);
  const [settings, setSettings] = useState<BrowserSettings>({
    searchEngine: 'baidu',
    desktopMode: false,
    javascriptEnabled: true,
    blockImages: false,
    adBlockEnabled: true,
    pinLock: '1234',
    autoExitOnBlur: true,
    autoExitOnVisibilityChange: true,
    autoExitOnReturnDesktop: true,
    autoExitTimeoutSeconds: 30,
    showSecretIndicator: true,
    vibrateFeedback: true,
  });

  // Presentation shell: Android Phone Frame vs Fullscreen
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);

  // Modals state
  const [showTabsModal, setShowTabsModal] = useState(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPinLockModal, setShowPinLockModal] = useState(false);
  const [showCookiesModal, setShowCookiesModal] = useState(false);
  const [showNativeCodeModal, setShowNativeCodeModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [sourceViewerUrl, setSourceViewerUrl] = useState<string | null>(null);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inactivity tracking
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load account data into active state
  const loadModeData = useCallback((targetMode: AccountMode) => {
    const data = StorageService.loadAccountData(targetMode);
    setBookmarks(data.bookmarks);
    setHistory(data.history);
    setTabs(data.tabs);
    setActiveTabId(data.activeTabId);
    setQuickDials(data.quickDials);
    setCookies(data.cookies);
    setSettings(data.settings);
  }, []);

  // Flush current state to storage
  const flushCurrentState = useCallback(() => {
    const snapshot: AccountDataSnapshot = {
      bookmarks,
      history,
      tabs,
      activeTabId,
      quickDials,
      cookies,
      settings,
    };
    StorageService.saveAccountData(mode, snapshot);
  }, [bookmarks, history, tabs, activeTabId, quickDials, cookies, settings, mode]);

  // Initial load on startup
  useEffect(() => {
    loadModeData('regular');
  }, [loadModeData]);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Save changes whenever state modifies
  useEffect(() => {
    if (tabs.length > 0) {
      flushCurrentState();
    }
  }, [bookmarks, history, tabs, activeTabId, quickDials, cookies, settings, flushCurrentState]);

  // Switch to Regular Account (seamless auto exit or manual exit)
  const exitToRegularAccount = useCallback(
    (reason?: string) => {
      if (mode === 'regular') return;

      // 1. Flush and encrypt isolated state
      flushCurrentState();

      // 2. Clear sensitive modals
      setShowPinLockModal(false);
      setShowSettingsModal(false);
      setShowMenuSheet(false);
      setShowTabsModal(false);
      setShowCookiesModal(false);
      setSourceViewerUrl(null);

      // 3. Switch mode to regular
      setMode('regular');
      loadModeData('regular');

      if (reason) {
        showToast(reason);
      }
    },
    [mode, flushCurrentState, loadModeData, showToast]
  );

  // Switch to Isolated Mode (after PIN validation)
  const enterIsolatedMode = useCallback(() => {
    // 1. Flush current regular state
    flushCurrentState();

    // 2. Set mode to isolated
    setMode('isolated');
    loadModeData('isolated');

    setShowPinLockModal(false);
    showToast('已进入平行隔离空间 (数据完全独立)');
  }, [flushCurrentState, loadModeData, showToast]);

  // Secret trigger from Settings: User clicked "About" 3 times!
  const handleTriggerIsolatedFromSettings = () => {
    setShowSettingsModal(false);
    // Prompt PIN lock
    setShowPinLockModal(true);
  };

  // VisibilityChange listener (Screen lock, tab hide, app minimize)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && mode === 'isolated' && settings.autoExitOnVisibilityChange) {
        exitToRegularAccount('检测到后台切出/关屏：已无缝退回主账户');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [mode, settings.autoExitOnVisibilityChange, exitToRegularAccount]);

  // Window blur listener (App lose focus)
  useEffect(() => {
    const handleBlur = () => {
      if (mode === 'isolated' && settings.autoExitOnBlur) {
        exitToRegularAccount('检测到切换应用：已自动返回主账户');
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [mode, settings.autoExitOnBlur, exitToRegularAccount]);

  // Pagehide listener (Android / Mobile native return to home)
  useEffect(() => {
    const handlePageHide = () => {
      if (mode === 'isolated' && settings.autoExitOnReturnDesktop) {
        exitToRegularAccount('返回手机桌面：已自动退出至普通模式');
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [mode, settings.autoExitOnReturnDesktop, exitToRegularAccount]);

  // Return to Mobile Desktop / Launcher (System Home action)
  const handleGoToDesktop = useCallback(() => {
    if (mode === 'isolated' && settings.autoExitOnReturnDesktop) {
      exitToRegularAccount('返回手机桌面：已自动退出至普通模式');
    }
    setIsDesktopOpen(true);
  }, [mode, settings.autoExitOnReturnDesktop, exitToRegularAccount]);

  const handleOpenFromDesktop = useCallback(() => {
    setIsDesktopOpen(false);
  }, []);

  // Inactivity idle countdown timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (mode === 'isolated' && settings.autoExitTimeoutSeconds > 0) {
      idleTimerRef.current = setTimeout(() => {
        exitToRegularAccount(`空闲超过 ${settings.autoExitTimeoutSeconds} 秒：已自动锁定退出`);
      }, settings.autoExitTimeoutSeconds * 1000);
    }
  }, [mode, settings.autoExitTimeoutSeconds, exitToRegularAccount]);

  useEffect(() => {
    const handleActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    resetIdleTimer();

    return () => {
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // Simulate turning off phone screen / power lock
  const handleSimulatePowerLock = () => {
    setIsScreenLocked(true);
    if (mode === 'isolated') {
      exitToRegularAccount();
    }
  };

  const handleWakeUpScreen = () => {
    setIsScreenLocked(false);
    showToast('手机已唤醒解锁 (当前处于主账户安全环境)');
  };

  // Active tab helper
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || {
    id: 'tab-default',
    title: 'Via',
    url: 'via://home',
    displayUrl: '',
    historyStack: ['via://home'],
    historyIndex: 0,
  };

  // Browser Navigation Handlers
  const handleNavigate = (inputUrl: string) => {
    const resolved = MockSitesService.resolveUrl(inputUrl, settings.searchEngine);
    const domain = MockSitesService.getDomainFromUrl(resolved.url);

    // 1. Record History in CURRENT active partition
    const newHistoryItem: HistoryItem = {
      id: `h-${Date.now()}`,
      title: resolved.title,
      url: resolved.url,
      visitedAt: Date.now(),
    };
    setHistory((prev) => [newHistoryItem, ...prev.slice(0, 99)]);

    // 2. Set mock session cookie for domain in CURRENT partition
    const cookieId = `ck-${domain.replace(/[^a-z0-9]/gi, '_')}`;
    const newCookie: SiteCookie = {
      id: cookieId,
      domain,
      name: 'via_session_id',
      value: `sid_${mode}_${Math.random().toString(36).substring(2, 10)}`,
      updatedAt: Date.now(),
    };
    setCookies((prev) => {
      const filtered = prev.filter((c) => c.domain !== domain || c.name !== 'via_session_id');
      return [newCookie, ...filtered];
    });

    // 3. Update active tab
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTab.id) {
          const newStack = t.historyStack.slice(0, t.historyIndex + 1);
          newStack.push(resolved.url);
          return {
            ...t,
            title: resolved.title,
            url: resolved.url,
            displayUrl: resolved.url === 'via://home' ? '' : resolved.url,
            historyStack: newStack,
            historyIndex: newStack.length - 1,
          };
        }
        return t;
      })
    );
  };

  const handleGoBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const targetUrl = activeTab.historyStack[newIndex];
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab.id
            ? {
                ...t,
                url: targetUrl,
                title: targetUrl === 'via://home' ? 'Via' : targetUrl,
                historyIndex: newIndex,
              }
            : t
        )
      );
    }
  };

  const handleGoForward = () => {
    if (activeTab.historyIndex < activeTab.historyStack.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const targetUrl = activeTab.historyStack[newIndex];
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab.id
            ? {
                ...t,
                url: targetUrl,
                title: targetUrl === 'via://home' ? 'Via' : targetUrl,
                historyIndex: newIndex,
              }
            : t
        )
      );
    }
  };

  const handleGoHome = () => {
    if (activeTab.url === 'via://home') {
      // 在浏览器主页再次点击主页键，直接返回手机桌面并自动归位普通模式
      handleGoToDesktop();
    } else {
      handleNavigate('via://home');
    }
  };

  const handleRefresh = () => {
    showToast('页面已刷新');
  };

  // Tab Manager Handlers
  const handleNewTab = () => {
    const newTabItem: TabItem = {
      id: `tab-${Date.now()}`,
      title: 'Via',
      url: 'via://home',
      displayUrl: '',
      historyStack: ['via://home'],
      historyIndex: 0,
    };
    setTabs((prev) => [...prev, newTabItem]);
    setActiveTabId(newTabItem.id);
    setShowTabsModal(false);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) {
      // If closing last tab, reset to home
      setTabs([
        {
          id: `tab-${Date.now()}`,
          title: 'Via',
          url: 'via://home',
          displayUrl: '',
          historyStack: ['via://home'],
          historyIndex: 0,
        },
      ]);
      return;
    }

    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  const handleCloseAllTabs = () => {
    const freshTab: TabItem = {
      id: `tab-${Date.now()}`,
      title: 'Via',
      url: 'via://home',
      displayUrl: '',
      historyStack: ['via://home'],
      historyIndex: 0,
    };
    setTabs([freshTab]);
    setActiveTabId(freshTab.id);
    setShowTabsModal(false);
  };

  // Bookmarks & QuickDial Handlers
  const handleAddBookmark = (item: BookmarkItem) => {
    setBookmarks((prev) => [item, ...prev]);
    showToast('已添加至当前空间书签');
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddQuickDial = (dial: QuickDial) => {
    setQuickDials((prev) => [...prev, dial]);
  };

  const handleRemoveQuickDial = (id: string) => {
    setQuickDials((prev) => prev.filter((d) => d.id !== id));
  };

  // Settings Handlers
  const handleUpdateSettings = (newSettings: Partial<BrowserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleChangePin = (newPin: string) => {
    StorageService.setIsolatedPin(newPin);
    showToast('隔离空间安全 PIN 码已更新');
  };

  const handleResetIsolatedData = () => {
    if (window.confirm('确定要清空隔离模式下的所有书签、历史和笔记吗？')) {
      StorageService.clearIsolatedData();
      loadModeData('isolated');
      showToast('隔离模式数据已重置');
    }
  };

  const isIsolated = mode === 'isolated';

  return (
    <div className="w-screen h-screen bg-neutral-950 flex flex-col items-center justify-center overflow-hidden font-sans select-none text-neutral-100">
      {/* Top Desktop Helper Bar (Only visible on wide screens) */}
      <div className="w-full max-w-4xl px-4 py-2 hidden md:flex items-center justify-between text-xs text-neutral-400 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-200">Via 安卓浏览器</span>
          <span className="text-neutral-600">|</span>
          <span>
            当前状态：
            {isIsolated ? (
              <span className="text-amber-400 font-medium">平行隔离空间模式</span>
            ) : (
              <span className="text-emerald-400 font-medium">普通主账户模式</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1 hover:text-neutral-200 text-neutral-400 transition-colors"
          >
            {isPhoneFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{isPhoneFrame ? '全屏沉浸' : '手机视图'}</span>
          </button>

          {isIsolated && (
            <button
              onClick={() => exitToRegularAccount('已手动安全返回普通模式')}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>防窥锁退</span>
            </button>
          )}

          <button
            onClick={() => setShowNativeCodeModal(true)}
            className="flex items-center gap-1 hover:text-emerald-400 text-neutral-400 transition-colors"
            title="查看纯原生 Android 0帧防窥 Kotlin 架构源码"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>原生 Android 源码</span>
          </button>

          <button
            onClick={() => setShowGitHubModal(true)}
            className="flex items-center gap-1 hover:text-white text-neutral-300 font-medium transition-colors"
            title="查看 GitHub 自动打包 Android APK 流程"
          >
            <Github className="w-3.5 h-3.5 text-neutral-200" />
            <span>GitHub 打包 APK</span>
          </button>

          <button
            onClick={handleGoToDesktop}
            className="flex items-center gap-1 hover:text-neutral-200 text-neutral-400 transition-colors"
            title="模拟返回手机桌面 (将自动退出隔离模式)"
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span>返回手机桌面</span>
          </button>

          <button
            onClick={handleSimulatePowerLock}
            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="测试息屏无缝退出逻辑"
          >
            模拟关屏/锁屏
          </button>
        </div>
      </div>

      {/* Main Container: Mobile Shell or Fullscreen */}
      <main
        className={`relative flex flex-col bg-neutral-900 overflow-hidden shadow-2xl transition-all duration-300 ${
          isPhoneFrame
            ? 'w-full max-w-[412px] h-full max-h-[860px] md:rounded-[40px] md:border-4 md:border-neutral-800'
            : 'w-full h-full'
        }`}
      >
        {/* Android Physical Simulated Power Button for easy testing */}
        {isPhoneFrame && (
          <button
            onClick={handleSimulatePowerLock}
            className="hidden md:block absolute -right-3 top-24 w-1.5 h-12 bg-neutral-700 hover:bg-neutral-500 rounded-r-md cursor-pointer transition-colors z-40"
            title="手机物理电源键：点击模拟息屏关屏"
          />
        )}

        {/* Android Status Bar */}
        <AndroidStatusBar
          mode={mode}
          showSecretIndicator={settings.showSecretIndicator}
          onSimulatePowerLock={handleSimulatePowerLock}
        />

        {/* Top Browser Bar (URL & Omnibox) */}
        <TopBar
          activeTab={activeTab}
          mode={mode}
          searchEngine={settings.searchEngine}
          onNavigate={handleNavigate}
          onRefresh={handleRefresh}
          onSearchEngineChange={(eng) => handleUpdateSettings({ searchEngine: eng })}
        />

        {/* Central Viewport / Web Renderer */}
        <div className="flex-1 w-full overflow-hidden flex flex-col relative bg-neutral-900">
          {activeTab.url === 'via://home' ? (
            <HomePage
              mode={mode}
              quickDials={quickDials}
              searchEngine={settings.searchEngine}
              onNavigate={handleNavigate}
              onAddQuickDial={handleAddQuickDial}
              onRemoveQuickDial={handleRemoveQuickDial}
              onSearchEngineChange={(eng) => handleUpdateSettings({ searchEngine: eng })}
              onOpenSettings={() => setShowSettingsModal(true)}
            />
          ) : (
            <WebRenderer
              activeTab={activeTab}
              mode={mode}
              desktopMode={settings.desktopMode}
              blockImages={settings.blockImages}
              onNavigate={handleNavigate}
              onViewSource={(targetUrl) => setSourceViewerUrl(targetUrl)}
            />
          )}
        </div>

        {/* Bottom Browser Bar */}
        <BottomBar
          activeTab={activeTab}
          tabCount={tabs.length}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
          onGoHome={handleGoHome}
          onOpenTabs={() => setShowTabsModal(true)}
          onOpenMenu={() => setShowMenuSheet(true)}
        />

        {/* Android Gesture Pill & 3-Button Nav */}
        <AndroidNavBar
          onGoToDesktop={handleGoToDesktop}
          onSystemBack={handleGoBack}
        />

        {/* Simulated Android Desktop Launcher Overlay */}
        <AndroidDesktopOverlay
          isOpen={isDesktopOpen}
          onOpenViaBrowser={handleOpenFromDesktop}
          onSimulatePowerLock={handleSimulatePowerLock}
        />

        {/* Simulated Screen Lock / Phone Standby Overlay */}
        <ScreenLockOverlay
          isOpen={isScreenLocked}
          onWakeUp={handleWakeUpScreen}
        />

        {/* Toast Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-16 left-4 right-4 bg-neutral-800/95 border border-neutral-700 text-neutral-100 px-4 py-2.5 rounded-xl text-xs font-medium text-center shadow-xl backdrop-blur-sm z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {toastMessage}
          </div>
        )}
      </main>

      {/* MODALS */}
      {/* 1. Tabs Manager Modal */}
      {showTabsModal && (
        <TabsManagerModal
          tabs={tabs}
          activeTabId={activeTab.id}
          mode={mode}
          onSelectTab={(id) => {
            setActiveTabId(id);
            setShowTabsModal(false);
          }}
          onCloseTab={handleCloseTab}
          onNewTab={handleNewTab}
          onCloseAll={handleCloseAllTabs}
          onCloseModal={() => setShowTabsModal(false)}
        />
      )}

      {/* 2. Bookmarks & History Modal */}
      {showBookmarksModal && (
        <BookmarksHistoryModal
          mode={mode}
          bookmarks={bookmarks}
          history={history}
          activeUrl={activeTab.url}
          activeTitle={activeTab.title}
          onNavigate={(targetUrl) => {
            handleNavigate(targetUrl);
            setShowBookmarksModal(false);
          }}
          onAddBookmark={handleAddBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          onClearHistory={() => setHistory([])}
          onRemoveHistoryItem={(id) => setHistory((prev) => prev.filter((h) => h.id !== id))}
          onClose={() => setShowBookmarksModal(false)}
        />
      )}

      {/* 3. Via Menu Bottom Sheet */}
      {showMenuSheet && (
        <MenuSheet
          mode={mode}
          desktopMode={settings.desktopMode}
          onNewTab={handleNewTab}
          onOpenBookmarks={() => setShowBookmarksModal(true)}
          onRefresh={handleRefresh}
          onToggleDesktop={() =>
            handleUpdateSettings({ desktopMode: !settings.desktopMode })
          }
          onOpenSource={() => setSourceViewerUrl(activeTab.url)}
          onOpenCookies={() => setShowCookiesModal(true)}
          onOpenFindInPage={() => showToast('已启动页内查找')}
          onOpenSettings={() => setShowSettingsModal(true)}
          onPanicLock={() => exitToRegularAccount('已快速锁定并切回主模式')}
          onClose={() => setShowMenuSheet(false)}
        />
      )}

      {/* 4. Settings Modal with the secret "关于" 3-click trigger */}
      {showSettingsModal && (
        <SettingsModal
          mode={mode}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onTriggerIsolatedMode={handleTriggerIsolatedFromSettings}
          onExitToRegular={() => exitToRegularAccount('已退出至普通主模式')}
          onResetIsolatedData={handleResetIsolatedData}
          onChangePin={handleChangePin}
          onViewNativeAndroidCode={() => setShowNativeCodeModal(true)}
          onOpenGitHubModal={() => setShowGitHubModal(true)}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* 5. Secret PIN Lock Keypad Modal */}
      {showPinLockModal && (
        <PinLockModal
          onSuccess={enterIsolatedMode}
          onCancel={() => setShowPinLockModal(false)}
          verifyPin={(entered) => StorageService.verifyPin(entered)}
        />
      )}

      {/* 6. Cookie & Storage Isolation Inspector */}
      {showCookiesModal && (
        <CookieStorageModal
          mode={mode}
          cookies={cookies}
          onAddCookie={(ck) => setCookies((prev) => [ck, ...prev])}
          onRemoveCookie={(id) => setCookies((prev) => prev.filter((c) => c.id !== id))}
          onClearCookies={() => setCookies([])}
          onClose={() => setShowCookiesModal(false)}
        />
      )}

      {/* 7. View Page Source Inspector */}
      {sourceViewerUrl && (
        <SourceViewerModal
          url={sourceViewerUrl}
          onClose={() => setSourceViewerUrl(null)}
        />
      )}

      {/* 8. Pure Native Android Zero-Frame Architecture & Kotlin Code Viewer */}
      {showNativeCodeModal && (
        <NativeAndroidViewerModal
          onClose={() => setShowNativeCodeModal(false)}
        />
      )}

      {/* 9. GitHub CI/CD APK Build Modal */}
      {showGitHubModal && (
        <GitHubBuildModal
          onClose={() => setShowGitHubModal(false)}
        />
      )}
    </div>
  );
}
