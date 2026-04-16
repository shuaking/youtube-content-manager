"use client";

import { useState } from "react";

const settingsTabs = [
  { id: "general", label: "常规" },
  { id: "subtitles", label: "字幕" },
  { id: "playback", label: "播放" },
  { id: "vocabulary", label: "词汇" },
  { id: "account", label: "账户" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">设置</h1>
          <p className="text-white/70">自定义您的 Language Reactor 体验</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto border-b border-white/10 pb-2">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-lg px-6 py-2 font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-secondary text-secondary-foreground"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="rounded-2xl border border-white/10 bg-card p-8">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "subtitles" && <SubtitleSettings />}
          {activeTab === "playback" && <PlaybackSettings />}
          {activeTab === "vocabulary" && <VocabularySettings />}
          {activeTab === "account" && <AccountSettings />}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-4">
          <button className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10">
            重置为默认
          </button>
          <button className="rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90">
            保存设置
          </button>
        </div>
      </div>
    </main>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">常规设置</h2>

      <SettingItem
        label="界面语言"
        description="选择 Language Reactor 的显示语言"
      >
        <select className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none transition-all focus:border-secondary">
          <option>中文（简体）</option>
          <option>English</option>
          <option>日本語</option>
          <option>Español</option>
        </select>
      </SettingItem>

      <SettingItem
        label="自动启动"
        description="在 Netflix 和 YouTube 上自动激活扩展"
      >
        <Toggle />
      </SettingItem>

      <SettingItem
        label="键盘快捷键"
        description="启用键盘快捷键控制播放和字幕"
      >
        <Toggle defaultChecked />
      </SettingItem>

      <SettingItem
        label="主题"
        description="选择界面主题"
      >
        <select className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none transition-all focus:border-secondary">
          <option>深色</option>
          <option>浅色</option>
          <option>跟随系统</option>
        </select>
      </SettingItem>
    </div>
  );
}

function SubtitleSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">字幕设置</h2>

      <SettingItem
        label="显示双语字幕"
        description="同时显示原文和翻译字幕"
      >
        <Toggle defaultChecked />
      </SettingItem>

      <SettingItem
        label="字幕位置"
        description="选择字幕在屏幕上的位置"
      >
        <select className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none transition-all focus:border-secondary">
          <option>底部</option>
          <option>顶部</option>
          <option>侧边</option>
        </select>
      </SettingItem>

      <SettingItem
        label="字体大小"
        description="调整字幕文字大小"
      >
        <input
          type="range"
          min="12"
          max="32"
          defaultValue="16"
          className="w-full"
        />
      </SettingItem>

      <SettingItem
        label="自动隐藏字幕"
        description="鼠标悬停时才显示字幕"
      >
        <Toggle />
      </SettingItem>

      <SettingItem
        label="高亮已保存词汇"
        description="在字幕中高亮显示您保存的词汇"
      >
        <Toggle defaultChecked />
      </SettingItem>
    </div>
  );
}

function PlaybackSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">播放设置</h2>

      <SettingItem
        label="自动暂停"
        description="每句字幕后自动暂停"
      >
        <Toggle />
      </SettingItem>

      <SettingItem
        label="默认播放速度"
        description="设置视频的默认播放速度"
      >
        <select className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none transition-all focus:border-secondary">
          <option>0.5x</option>
          <option>0.75x</option>
          <option selected>1.0x</option>
          <option>1.25x</option>
          <option>1.5x</option>
          <option>2.0x</option>
        </select>
      </SettingItem>

      <SettingItem
        label="循环播放"
        description="重复播放当前句子"
      >
        <Toggle />
      </SettingItem>

      <SettingItem
        label="跳过片头片尾"
        description="自动跳过 Netflix 的片头和片尾"
      >
        <Toggle defaultChecked />
      </SettingItem>
    </div>
  );
}

function VocabularySettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">词汇设置</h2>

      <SettingItem
        label="自动保存点击的词汇"
        description="点击词汇时自动添加到已保存列表"
      >
        <Toggle />
      </SettingItem>

      <SettingItem
        label="显示词频"
        description="显示词汇在语料库中的使用频率"
      >
        <Toggle defaultChecked />
      </SettingItem>

      <SettingItem
        label="词汇难度等级"
        description="根据难度等级标记词汇"
      >
        <Toggle defaultChecked />
      </SettingItem>

      <SettingItem
        label="导出格式"
        description="选择导出到 Anki 的卡片格式"
      >
        <select className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none transition-all focus:border-secondary">
          <option>基础格式</option>
          <option>带截图</option>
          <option>带音频</option>
          <option>完整格式</option>
        </select>
      </SettingItem>
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">账户设置</h2>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">当前计划</h3>
            <p className="text-sm text-white/60">免费版</p>
          </div>
          <a
            href="/pro-mode"
            className="rounded-lg bg-secondary px-4 py-2 font-semibold text-secondary-foreground transition-all hover:opacity-90"
          >
            升级到 Pro
          </a>
        </div>
      </div>

      <SettingItem
        label="邮箱地址"
        description="用于接收通知和重置密码"
      >
        <input
          type="email"
          placeholder="your@email.com"
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white outline-none transition-all focus:border-secondary"
        />
      </SettingItem>

      <SettingItem
        label="数据同步"
        description="在多个设备间同步您的词汇和设置"
      >
        <Toggle defaultChecked />
      </SettingItem>

      <SettingItem
        label="邮件通知"
        description="接收学习进度和新功能通知"
      >
        <Toggle />
      </SettingItem>

      <div className="mt-8 border-t border-white/10 pt-8">
        <h3 className="mb-4 font-semibold text-white">危险区域</h3>
        <div className="space-y-4">
          <button className="w-full rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-left text-red-400 transition-all hover:bg-red-500/20">
            <div className="font-semibold">清除所有数据</div>
            <div className="text-sm text-red-400/70">
              删除所有保存的词汇和学习记录
            </div>
          </button>
          <button className="w-full rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-left text-red-400 transition-all hover:bg-red-500/20">
            <div className="font-semibold">删除账户</div>
            <div className="text-sm text-red-400/70">
              永久删除您的账户和所有数据
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingItem({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-8 border-b border-white/5 pb-6 last:border-0">
      <div className="flex-1">
        <h3 className="mb-1 font-semibold text-white">{label}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <button
      onClick={() => setChecked(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        checked ? "bg-secondary" : "bg-white/20"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
