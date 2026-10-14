/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Github,
  Play,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Cpu,
  FolderGit2,
  Workflow,
  Sparkles,
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const GitHubBuildModal: React.FC<Props> = ({ onClose }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const gitCommand = `git remote add origin ${repoUrl || 'https://github.com/YOUR_USERNAME/via-browser.git'}
git branch -M main
git push -u origin main`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(gitCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-60 flex flex-col justify-between items-center p-4 sm:p-6 select-none overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-5 my-auto">
        {/* Top Title */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <span>GitHub 云端自动打包 APK</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  CI/CD 就绪
                </span>
              </h2>
              <p className="text-[10px] text-neutral-400">已配置 .github/workflows/build-android-apk.yml</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Direct Download Banner for Latest Release */}
        <div className="bg-gradient-to-r from-blue-900/40 to-emerald-900/40 border border-blue-500/40 rounded-2xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-neutral-100">最新 Android 原生安装包 (v1.0.4)</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
              6.35 MB
            </span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            已在云端全自动编译构建完成！具备真实移动端原网页渲染、上下栏滑动自隐藏、双列多标签卡片管理与 0 帧防窥锁退。
          </p>
          <div className="flex items-center gap-2 pt-1">
            <a
              href="https://github.com/skgiter/via_twin/releases/download/v1.0.4/ViaBrowser_Parallel_v1.0.4.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>直接下载 APK (v1.0.4)</span>
            </a>
            <a
              href="https://github.com/skgiter/via_twin/releases/tag/v1.0.4"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-xl flex items-center justify-center gap-1 transition-colors border border-neutral-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>发行页</span>
            </a>
          </div>
        </div>

        {/* Workflow Info Banner */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
            <Workflow className="w-4 h-4 text-emerald-400" />
            <span>GitHub Actions 自动化流水线已装配</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            本项目已包含完整的纯原生 Android 编译环境（JDK 17 + Android SDK 34 + Gradle 8.2 + 0帧防窥Kotlin代码）。
            代码推送到 GitHub 后，GitHub 免费虚拟机将**自动执行 `./gradlew assembleDebug`** 并生成 APK 安装包！
          </p>
        </div>

        {/* Step-by-Step Guide */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-neutral-300">
            连接并推送到你的 GitHub：
          </div>

          {/* Input Repo URL */}
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">输入你的 GitHub 仓库地址（可选，用于自动替换命令）：</label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/你的名字/via-browser.git"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 font-mono focus:outline-none focus:border-neutral-500"
            />
          </div>

          {/* Terminal Command Snippet */}
          <div className="relative bg-neutral-950 border border-neutral-800 rounded-xl p-3 font-mono text-xs text-neutral-300">
            <pre className="overflow-x-auto whitespace-pre leading-relaxed select-all">
              {gitCommand}
            </pre>
            <button
              onClick={handleCopyCmd}
              className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[10px] font-sans flex items-center gap-1 transition-colors border border-neutral-700"
            >
              {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCmd ? '已复制' : '复制命令'}</span>
            </button>
          </div>
        </div>

        {/* How to download the APK after push */}
        <div className="bg-neutral-850 border border-neutral-800 rounded-xl p-3 space-y-2">
          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>推送后如何在 GitHub 上直接下载 APK：</span>
          </div>
          <ol className="list-decimal list-inside text-[11px] text-neutral-400 space-y-1 leading-relaxed">
            <li>打开你的 GitHub 仓库页面，点击顶部的 <strong>Actions</strong> 标签页。</li>
            <li>系统已自动开始运行 <strong>Build Android APK</strong> 任务（通常耗时约 1~2 分钟）。</li>
            <li>编译完成后，点击该运行记录，在底部的 <strong>Artifacts (产物)</strong> 列表即可直接点击下载 <strong>ViaBrowser-Parallel-Debug-APK</strong>！</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 hover:bg-white text-neutral-900 text-xs font-semibold rounded-xl transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
