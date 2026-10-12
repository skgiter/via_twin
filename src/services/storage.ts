/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AccountDataSnapshot,
  AccountMode,
  BookmarkItem,
  BrowserSettings,
  HistoryItem,
  QuickDial,
  SiteCookie,
  TabItem,
} from '../types/browser';

const STORAGE_PREFIX = 'via_browser_v2_';

const DEFAULT_SETTINGS: BrowserSettings = {
  searchEngine: 'baidu',
  desktopMode: false,
  javascriptEnabled: true,
  blockImages: false,
  adBlockEnabled: true,
  pinLock: '1234', // default PIN if none set
  autoExitOnBlur: true,
  autoExitOnVisibilityChange: true,
  autoExitOnReturnDesktop: true,
  autoExitTimeoutSeconds: 30, // 30 seconds idle auto lock
  showSecretIndicator: true,
  vibrateFeedback: true,
};

const DEFAULT_REGULAR_QUICK_DIALS: QuickDial[] = [
  { id: 'qd-1', title: '百度', url: 'https://www.baidu.com', iconBg: '#2932E1', iconText: '度' },
  { id: 'qd-2', title: '哔哩哔哩', url: 'https://www.bilibili.com', iconBg: '#FB7299', iconText: 'B' },
  { id: 'qd-3', title: '维基百科', url: 'https://zh.wikipedia.org', iconBg: '#4B5563', iconText: 'W' },
  { id: 'qd-4', title: 'GitHub', url: 'https://github.com', iconBg: '#24292E', iconText: 'Git' },
  { id: 'qd-5', title: '知乎', url: 'https://www.zhihu.com', iconBg: '#0066FF', iconText: '知' },
  { id: 'qd-6', title: 'V2EX', url: 'https://v2ex.com', iconBg: '#333333', iconText: 'V2' },
  { id: 'qd-7', title: 'Hacker News', url: 'https://news.ycombinator.com', iconBg: '#FF6600', iconText: 'Y' },
  { id: 'qd-8', title: 'DuckDuckGo', url: 'https://duckduckgo.com', iconBg: '#DE5833', iconText: 'Duck' },
];

const DEFAULT_REGULAR_BOOKMARKS: BookmarkItem[] = [
  { id: 'bm-1', title: '百度一下，你就知道', url: 'https://www.baidu.com', createdAt: Date.now() - 86400000 * 2 },
  { id: 'bm-2', title: '维基百科 (Wikipedia)', url: 'https://zh.wikipedia.org', createdAt: Date.now() - 86400000 },
  { id: 'bm-3', title: 'GitHub 极客代码社区', url: 'https://github.com', createdAt: Date.now() - 3600000 },
];

const DEFAULT_REGULAR_HISTORY: HistoryItem[] = [
  { id: 'h-1', title: '百度搜索：今日热点资讯', url: 'https://www.baidu.com/s?wd=今日热点资讯', visitedAt: Date.now() - 3600000 * 3 },
  { id: 'h-2', title: '哔哩哔哩 热门视频推荐', url: 'https://www.bilibili.com/video', visitedAt: Date.now() - 3600000 * 1 },
];

const DEFAULT_REGULAR_COOKIES: SiteCookie[] = [
  { id: 'c-1', domain: 'baidu.com', name: 'BAIDUID', value: '4F89D8A27848C17C2F:FG=1', updatedAt: Date.now() - 86400000 },
  { id: 'c-2', domain: 'bilibili.com', name: 'buvid3', value: 'b_f87a32-88ef-4122-bc5d', updatedAt: Date.now() - 86400000 },
];

// Completely segregated isolated data (Parallel private vault)
const DEFAULT_ISOLATED_QUICK_DIALS: QuickDial[] = [
  { id: 'iqd-1', title: '加密笔记', url: 'via://vault-notes', iconBg: '#059669', iconText: '密' },
  { id: 'iqd-2', title: '隐私搜索', url: 'https://duckduckgo.com', iconBg: '#DC2626', iconText: '隐' },
  { id: 'iqd-3', title: '暗网情报站', url: 'via://threat-intel', iconBg: '#475569', iconText: 'Tor' },
  { id: 'iqd-4', title: '瑞士质押金库', url: 'via://crypto-vault', iconBg: '#D97706', iconText: '金' },
  { id: 'iqd-5', title: 'ProtonMail', url: 'https://proton.me', iconBg: '#6D28D9', iconText: 'Mail' },
  { id: 'iqd-6', title: 'Signal 文档', url: 'https://signal.org', iconBg: '#2563EB', iconText: 'Sig' },
];

const DEFAULT_ISOLATED_BOOKMARKS: BookmarkItem[] = [
  { id: 'ibm-1', title: '绝密工作台与API密钥', url: 'via://vault-notes#keys', createdAt: Date.now() - 86400000 * 5 },
  { id: 'ibm-2', title: '隐私无痕搜索引擎 DuckDuckGo', url: 'https://duckduckgo.com', createdAt: Date.now() - 86400000 * 3 },
  { id: 'ibm-3', title: '零知识加密备份协议', url: 'via://zk-backup', createdAt: Date.now() - 86400000 },
];

const DEFAULT_ISOLATED_HISTORY: HistoryItem[] = [
  { id: 'ih-1', title: 'DuckDuckGo 匿名检索：端到端加密体系', url: 'https://duckduckgo.com/?q=e2ee+protocol', visitedAt: Date.now() - 7200000 },
  { id: 'ih-2', title: '私有节点管理控制台', url: 'via://threat-intel/nodes', visitedAt: Date.now() - 3600000 },
];

const DEFAULT_ISOLATED_COOKIES: SiteCookie[] = [
  { id: 'ic-1', domain: 'duckduckgo.com', name: 'privacy_token', value: 'anon_sec_991823749827', updatedAt: Date.now() - 86400000 },
  { id: 'ic-2', domain: 'vault-notes', name: 'session_auth', value: 'bearer_iso_77216a88bc', updatedAt: Date.now() - 3600000 },
];

function createDefaultTab(id: string): TabItem {
  return {
    id,
    title: 'Via',
    url: 'via://home',
    displayUrl: '',
    historyStack: ['via://home'],
    historyIndex: 0,
    isLoading: false,
  };
}

// Light obfuscation & encryption container for Isolated vault
function encryptPayload(raw: string, key: string): string {
  try {
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return 'ENC_' + btoa(encodeURIComponent(result));
  } catch {
    return 'RAW_' + btoa(encodeURIComponent(raw));
  }
}

function decryptPayload(encrypted: string, key: string): string {
  try {
    if (encrypted.startsWith('ENC_')) {
      const rawBase = decodeURIComponent(atob(encrypted.slice(4)));
      let result = '';
      for (let i = 0; i < rawBase.length; i++) {
        const charCode = rawBase.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    }
    if (encrypted.startsWith('RAW_')) {
      return decodeURIComponent(atob(encrypted.slice(4)));
    }
    return encrypted;
  } catch {
    return encrypted;
  }
}

export const StorageService = {
  loadAccountData(mode: AccountMode): AccountDataSnapshot {
    const isIsolated = mode === 'isolated';
    const storageKey = `${STORAGE_PREFIX}${mode}_snapshot`;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        let parsedString = raw;
        if (isIsolated) {
          const pin = this.getIsolatedPin();
          parsedString = decryptPayload(raw, pin);
        }
        const data = JSON.parse(parsedString);
        return {
          bookmarks: data.bookmarks || [],
          history: data.history || [],
          tabs: data.tabs && data.tabs.length > 0 ? data.tabs : [createDefaultTab('tab-init')],
          activeTabId: data.activeTabId || (data.tabs?.[0]?.id || 'tab-init'),
          quickDials: data.quickDials || (isIsolated ? DEFAULT_ISOLATED_QUICK_DIALS : DEFAULT_REGULAR_QUICK_DIALS),
          cookies: data.cookies || (isIsolated ? DEFAULT_ISOLATED_COOKIES : DEFAULT_REGULAR_COOKIES),
          settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to parse storage snapshot for mode:', mode, e);
    }

    // Return defaults for this mode
    const defaultTab = createDefaultTab(`tab-${mode}-1`);
    const initialSnapshot: AccountDataSnapshot = {
      bookmarks: isIsolated ? DEFAULT_ISOLATED_BOOKMARKS : DEFAULT_REGULAR_BOOKMARKS,
      history: isIsolated ? DEFAULT_ISOLATED_HISTORY : DEFAULT_REGULAR_HISTORY,
      tabs: [defaultTab],
      activeTabId: defaultTab.id,
      quickDials: isIsolated ? DEFAULT_ISOLATED_QUICK_DIALS : DEFAULT_REGULAR_QUICK_DIALS,
      cookies: isIsolated ? DEFAULT_ISOLATED_COOKIES : DEFAULT_REGULAR_COOKIES,
      settings: { ...DEFAULT_SETTINGS },
    };

    // Save initial snapshot
    this.saveAccountData(mode, initialSnapshot);
    return initialSnapshot;
  },

  saveAccountData(mode: AccountMode, data: AccountDataSnapshot): void {
    const isIsolated = mode === 'isolated';
    const storageKey = `${STORAGE_PREFIX}${mode}_snapshot`;

    try {
      const json = JSON.stringify(data);
      if (isIsolated) {
        const pin = this.getIsolatedPin();
        const encrypted = encryptPayload(json, pin);
        localStorage.setItem(storageKey, encrypted);
      } else {
        localStorage.setItem(storageKey, json);
      }
    } catch (e) {
      console.error('Failed to save storage snapshot for mode:', mode, e);
    }
  },

  getIsolatedPin(): string {
    return localStorage.getItem(`${STORAGE_PREFIX}security_pin`) || '1234';
  },

  setIsolatedPin(pin: string): void {
    localStorage.setItem(`${STORAGE_PREFIX}security_pin`, pin);
  },

  hasCustomPin(): boolean {
    return localStorage.getItem(`${STORAGE_PREFIX}security_pin`) !== null;
  },

  verifyPin(enteredPin: string): boolean {
    const stored = this.getIsolatedPin();
    return enteredPin.trim() === stored.trim();
  },

  clearIsolatedData(): void {
    localStorage.removeItem(`${STORAGE_PREFIX}isolated_snapshot`);
  },
};
