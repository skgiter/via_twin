/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AccountMode = 'regular' | 'isolated';

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  createdAt: number;
  folder?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  visitedAt: number;
  icon?: string;
}

export interface TabItem {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  favicon?: string;
  isLoading?: boolean;
  historyStack: string[];
  historyIndex: number;
}

export interface QuickDial {
  id: string;
  title: string;
  url: string;
  iconBg?: string;
  iconText?: string;
}

export interface SiteCookie {
  id: string;
  domain: string;
  name: string;
  value: string;
  updatedAt: number;
  isHttpOnly?: boolean;
}

export interface BrowserSettings {
  searchEngine: 'google' | 'baidu' | 'bing' | 'duckduckgo';
  desktopMode: boolean;
  javascriptEnabled: boolean;
  blockImages: boolean;
  adBlockEnabled: boolean;
  pinLock: string; // PIN for isolated mode
  autoExitOnBlur: boolean; // Auto exit when app loses focus
  autoExitOnVisibilityChange: boolean; // Auto exit on screen lock / tab hidden
  autoExitOnReturnDesktop: boolean; // Auto exit when returning to home screen / launcher
  autoExitTimeoutSeconds: number; // 0 = immediate, 30, 60, 180
  showSecretIndicator: boolean; // subtle indicator in isolated mode
  vibrateFeedback: boolean;
}

export interface AccountDataSnapshot {
  bookmarks: BookmarkItem[];
  history: HistoryItem[];
  tabs: TabItem[];
  activeTabId: string;
  quickDials: QuickDial[];
  cookies: SiteCookie[];
  settings: BrowserSettings;
}
