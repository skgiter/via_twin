/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Play,
  Tv,
  Flame,
  Film,
  Gamepad2,
  Cpu,
  Music,
  ExternalLink,
  Share2,
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
  Globe,
} from 'lucide-react';

interface Props {
  url: string;
  onNavigate: (url: string) => void;
  onViewSource: (url: string) => void;
}

interface VideoItem {
  id: string;
  title: string;
  up: string;
  plays: string;
  danmaku: string;
  duration: string;
  tag: string;
  coverBg: string;
}

export const BilibiliRenderer: React.FC<Props> = ({ url, onNavigate, onViewSource }) => {
  const [activeCategory, setActiveCategory] = useState('推荐');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'app' | 'iframe'>('app');

  const categories = ['推荐', '热门', '动画', '游戏', '科技', '数码', '影视', '音乐'];

  const videos: VideoItem[] = [
    {
      id: 'bv1',
      title: '【4K超清】2026 最新旗舰芯片与移动端底层架构深度解析',
      up: '影视飓风',
      plays: '168.4万',
      danmaku: '3.6万',
      duration: '14:28',
      tag: '科技',
      coverBg: 'from-blue-600 to-indigo-800',
    },
    {
      id: 'bv2',
      title: '当程序员在手机上实现0帧防窥与平行隔离空间...',
      up: '极客开源实验室',
      plays: '92.1万',
      danmaku: '1.8万',
      duration: '08:45',
      tag: '数码',
      coverBg: 'from-pink-600 to-rose-800',
    },
    {
      id: 'bv3',
      title: '【原神/星铁】全角色战斗机制与深渊实战满星配队指南',
      up: '次元攻略菌',
      plays: '245.0万',
      danmaku: '6.2万',
      duration: '21:10',
      tag: '游戏',
      coverBg: 'from-amber-600 to-orange-800',
    },
    {
      id: 'bv4',
      title: '【何同学】我们做了一个能自动追踪光线的悬浮桌面',
      up: '老师好我叫何同学',
      plays: '512.6万',
      danmaku: '14.2万',
      duration: '11:32',
      tag: '科技',
      coverBg: 'from-emerald-600 to-teal-800',
    },
    {
      id: 'bv5',
      title: '周深 / 华语年度金曲震撼现场（4K 60帧杜比音效收藏版）',
      up: '音乐热歌榜',
      plays: '380.2万',
      danmaku: '9.4万',
      duration: '04:55',
      tag: '音乐',
      coverBg: 'from-purple-600 to-violet-900',
    },
    {
      id: 'bv6',
      title: '4K超清纪录片：国家地理拍摄的中国自然绝美奇境',
      up: '国家地理视界',
      plays: '198.7万',
      danmaku: '4.1万',
      duration: '32:00',
      tag: '影视',
      coverBg: 'from-cyan-600 to-blue-900',
    },
  ];

  const filteredVideos = activeCategory === '推荐'
    ? videos
    : activeCategory === '热门'
    ? [...videos].reverse()
    : videos.filter((v) => v.tag === activeCategory || activeCategory === '推荐');

  if (viewMode === 'iframe') {
    return (
      <div className="flex-1 w-full bg-neutral-900 flex flex-col relative overflow-hidden">
        {/* Top Control Bar */}
        <div className="h-9 px-3 bg-[#FB7299] flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('app')}
              className="text-[11px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
            >
              返回精简版
            </button>
            <span className="truncate max-w-[160px] text-[11px]">m.bilibili.com 原网</span>
          </div>

          <a
            href="https://m.bilibili.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-white text-[#FB7299] text-[10px] font-semibold px-2 py-0.5 rounded"
          >
            <span>新窗口打开</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        <iframe
          src="https://m.bilibili.com"
          title="Bilibili Mobile"
          className="w-full flex-1 border-none bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-[#18191c] text-neutral-100 flex flex-col overflow-y-auto select-none">
      {/* Bilibili Iconic Pink Mobile Header */}
      <header className="sticky top-0 z-20 bg-[#FB7299] px-3 py-2.5 shadow-md flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeVideo && (
              <button
                onClick={() => {
                  setActiveVideo(null);
                  setIsPlaying(false);
                }}
                className="text-white p-1 hover:bg-white/20 rounded-full transition-colors mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base">
              <Tv className="w-5 h-5 text-white" />
              <span>bilibili</span>
              <span className="text-[10px] bg-white text-[#FB7299] px-1 py-0.2 rounded font-bold ml-0.5">
                移动端
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('iframe')}
              className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-full font-medium transition-colors flex items-center gap-1"
              title="切换到 iframe 原网嵌入"
            >
              <Globe className="w-3 h-3" />
              <span>原网模式</span>
            </button>
            <a
              href="https://m.bilibili.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] bg-white text-[#FB7299] px-2 py-1 rounded-full font-bold shadow-xs hover:bg-neutral-100 transition-colors flex items-center gap-1"
            >
              <span>外链直达</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Bilibili Mobile Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索视频、UP主、番剧..."
            className="w-full bg-white/90 focus:bg-white text-neutral-900 placeholder-neutral-500 text-xs rounded-full pl-8 pr-4 py-1.5 focus:outline-none shadow-inner"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
        </div>
      </header>

      {/* Video Detail Playback View */}
      {activeVideo ? (
        <div className="p-3 space-y-3 animate-in fade-in duration-200">
          {/* Player Mock Screen */}
          <div
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-full aspect-video rounded-2xl bg-gradient-to-br ${activeVideo.coverBg} relative flex flex-col items-center justify-center cursor-pointer shadow-xl overflow-hidden border border-neutral-700`}
          >
            {isPlaying ? (
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#FB7299] border-t-transparent animate-spin mb-3" />
                <div className="text-xs text-neutral-300">正在播放高码率流媒体...</div>
                <div className="text-[10px] text-neutral-500 mt-1">点击画面暂停</div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 px-1.5 py-0.5 rounded text-white font-mono">
                  {activeVideo.duration}
                </span>
                <span className="absolute top-2 left-2 text-[10px] bg-[#FB7299] px-2 py-0.5 rounded text-white font-bold">
                  B站 4K超清
                </span>
              </>
            )}
          </div>

          {/* Video Information */}
          <div className="space-y-1.5">
            <h1 className="text-sm font-semibold text-neutral-100 leading-snug">
              {activeVideo.title}
            </h1>
            <div className="flex items-center gap-3 text-[11px] text-neutral-400">
              <span className="text-[#FB7299] font-medium">UP: {activeVideo.up}</span>
              <span>{activeVideo.plays} 播放</span>
              <span>{activeVideo.danmaku} 弹幕</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-around py-2 border-y border-neutral-800 text-xs text-neutral-300">
            <button className="flex flex-col items-center gap-1 hover:text-[#FB7299]">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-[10px]">点赞</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-[#FB7299]">
              <Flame className="w-4 h-4" />
              <span className="text-[10px]">投币</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-[#FB7299]">
              <Share2 className="w-4 h-4" />
              <span className="text-[10px]">分享</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-[#FB7299]">
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px]">评论 (428)</span>
            </button>
          </div>

          {/* Comments preview */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-neutral-200">热门评论 (精选)</div>
            <div className="bg-[#222427] rounded-xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-neutral-300">@极客探索者</span>
                <span className="text-neutral-500 text-[10px]">2小时前</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                用 Via 浏览器看 B 站确实清爽，没有杂七杂八的开屏广告，加载速度直接拉满！
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Channel Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 bg-[#222427] border-b border-neutral-800 text-xs shrink-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#FB7299] text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Video Grid (2 columns on mobile like official Bilibili) */}
          <div className="p-3 grid grid-cols-2 gap-3 flex-1">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className="bg-[#222427] hover:bg-[#2a2c30] rounded-xl overflow-hidden cursor-pointer transition-all border border-neutral-800/80 flex flex-col group"
              >
                {/* Thumbnail */}
                <div
                  className={`aspect-video w-full bg-gradient-to-br ${video.coverBg} relative flex items-center justify-center`}
                >
                  <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white translate-x-0.5" />
                  </div>
                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 px-1 rounded text-white font-mono">
                    {video.duration}
                  </span>
                </div>

                {/* Video Info */}
                <div className="p-2 flex-1 flex flex-col justify-between gap-1.5">
                  <h3 className="text-xs font-medium text-neutral-100 line-clamp-2 leading-snug group-hover:text-[#FB7299] transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="truncate max-w-[80px]">{video.up}</span>
                    <span className="text-[#FB7299]">{video.plays}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom helper */}
          <div className="p-3 text-center border-t border-neutral-800/80 bg-[#1e2023] mt-auto">
            <p className="text-[11px] text-neutral-400">
              已加载 Bilibili 移动精简版 · 支持完整视频与弹幕交互
            </p>
            <div className="flex justify-center gap-3 mt-2">
              <button
                onClick={() => setViewMode('iframe')}
                className="text-[11px] text-[#FB7299] hover:underline"
              >
                切换为原网 iframe 视图
              </button>
              <span className="text-neutral-600">·</span>
              <a
                href="https://m.bilibili.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#FB7299] hover:underline"
              >
                在新窗口直接访问原站
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
