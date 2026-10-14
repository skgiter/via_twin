/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BuiltinPageContent {
  title: string;
  url: string;
  domain: string;
  renderedHtml?: string;
  isSpecial?: boolean;
  type?: 'search' | 'article' | 'vault' | 'source' | 'generic';
}

export const MockSitesService = {
  resolveUrl(input: string, searchEngine: string = 'baidu'): { url: string; title: string } {
    const trimmed = input.trim();
    if (!trimmed || trimmed === 'via://home') {
      return { url: 'via://home', title: 'Via' };
    }

    if (trimmed.startsWith('via://') || trimmed.startsWith('view-source:')) {
      return { url: trimmed, title: trimmed };
    }

    // Check if it's a domain or URL
    const isUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(trimmed);
    if (isUrl) {
      const fullUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
        ? trimmed 
        : `https://${trimmed}`;
      const domain = fullUrl.replace(/^https?:\/\//, '').split('/')[0];
      return { url: fullUrl, title: domain };
    }

    // Otherwise treat as search query
    switch (searchEngine) {
      case 'google':
        return {
          url: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
          title: `${trimmed} - Google 搜索`,
        };
      case 'bing':
        return {
          url: `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`,
          title: `${trimmed} - 必应`,
        };
      case 'duckduckgo':
        return {
          url: `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`,
          title: `${trimmed} - DuckDuckGo`,
        };
      case 'baidu':
      default:
        return {
          url: `https://www.baidu.com/s?wd=${encodeURIComponent(trimmed)}`,
          title: `${trimmed} - 百度搜索`,
        };
    }
  },

  getDomainFromUrl(url: string): string {
    if (url.startsWith('via://')) return url.replace('via://', '');
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return url.split('/')[0] || url;
    }
  },
};
