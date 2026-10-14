/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Code, Copy, Check, X } from 'lucide-react';

interface Props {
  url: string;
  onClose: () => void;
}

export const SourceViewerModal: React.FC<Props> = ({ url, onClose }) => {
  const [copied, setCopied] = useState(false);

  const mockHtmlSource = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${url}</title>
  <style>
    /* Via Browser Native Optimized Stylesheet */
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .container { max-width: 640px; margin: 0 auto; padding: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Via Light Core - Page Inspector</h1>
      <p class="desc">Host: ${url}</p>
    </header>
    <main>
      <article>
        <!-- Sandboxed DOM Elements -->
        <p>Page loaded with Android System WebView bridge.</p>
      </article>
    </main>
  </div>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mockHtmlSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = mockHtmlSource.split('\n');

  return (
    <div className="fixed inset-0 bg-neutral-950/95 z-50 flex flex-col select-none">
      {/* Header */}
      <div className="h-14 px-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-neutral-100 font-mono truncate max-w-[200px]">
            view-source:{url}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已复制' : '复制代码'}</span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Viewer Body */}
      <div className="flex-1 overflow-auto p-3 font-mono text-xs select-text bg-neutral-950 text-neutral-300 leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-neutral-900/50">
                <td className="w-8 select-none text-neutral-600 text-right pr-3 align-top font-mono text-[10px]">
                  {idx + 1}
                </td>
                <td className="text-neutral-200 whitespace-pre font-mono">
                  {line}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
