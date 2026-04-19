"use client";

import { useState } from "react";
import { languages } from "@/types/catalog";

const uiLanguages = [
  { value: "zh-CN", label: "中文（简体）" },
  { value: "zh-TW", label: "中文（繁體）" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

export default function SettingsPage() {
  const [learningLang, setLearningLang] = useState("en");
  const [translationLang, setTranslationLang] = useState("zh-CN");
  const [uiLang, setUiLang] = useState("zh-CN");
  const [showMiniDict, setShowMiniDict] = useState(true);
  const [speakOnClick, setSpeakOnClick] = useState(true);
  const [customDictUrl, setCustomDictUrl] = useState("");
  const [autoPause, setAutoPause] = useState(true);
  const [hideSubtitles, setHideSubtitles] = useState(false);
  const [smartHighlight, setSmartHighlight] = useState(true);
  const [showFurigana, setShowFurigana] = useState(false);

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">设置</h1>
            <p className="text-white/70">自定义您的 Language Reactor 体验</p>
          </div>
          <button
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10"
            title="全屏"
          >
            ⛶ Fullscreen
          </button>
        </div>

        {/* App Installation */}
        <Section title="App Installation" icon="📲">
          <p className="mb-3 text-sm leading-relaxed text-white/70">
            Install Language Reactor on your device for a faster, full-screen experience with easy access from your home screen or desktop. To install, open your browser menu and select &quot;Install app&quot; or &quot;Add to Home Screen&quot;.
          </p>
          <div className="flex gap-4 text-xs text-white/50">
            <span>Browser SW: <span className="text-green-400">active</span></span>
            <span>Prompt: <span className="text-white/40">Unavailable</span></span>
          </div>
        </Section>

        {/* Account Info */}
        <Section title="账户信息" icon="👤">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">未登录</p>
              <p className="mt-1 text-sm text-white/60">登录后可同步进度、保存词汇和使用 Pro 功能</p>
            </div>
            <button className="rounded-lg bg-secondary px-6 py-2 font-semibold text-secondary-foreground transition-all hover:opacity-90">
              登录
            </button>
          </div>
        </Section>

        {/* Basic Settings */}
        <Section title="基本设置" icon="⚙️">
          <div className="space-y-4">
            <SelectRow
              label="学习语言"
              value={learningLang}
              onChange={setLearningLang}
              options={languages.map((l) => ({ value: l.code, label: `${l.flag} ${l.nativeName}` }))}
            />
            <SelectRow
              label="翻译语言"
              value={translationLang}
              onChange={setTranslationLang}
              options={uiLanguages}
            />
          </div>
        </Section>

        {/* Vocabulary Marking */}
        <Section title="词汇标记" icon="🖍️">
          <p className="mb-3 text-sm text-white/60">
            智能高亮和难度标记，登录后自动同步学习进度
          </p>
          <CheckboxRow
            label="智能高亮已保存词汇"
            hint="识别复数、动词变位等词形变化"
            checked={smartHighlight}
            onChange={setSmartHighlight}
          />
          <button className="mt-3 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10">
            登录以启用更多词汇功能
          </button>
        </Section>

        {/* Dictionary */}
        <Section title="词典" icon="📖">
          <CheckboxRow
            label="显示迷你词典"
            checked={showMiniDict}
            onChange={setShowMiniDict}
          />
          <CheckboxRow
            label="单击时朗读单词"
            checked={speakOnClick}
            onChange={setSpeakOnClick}
          />
          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-white/80">
              用户自定义词典网址
            </label>
            <input
              type="text"
              placeholder="http://www.example.com?q=WORD"
              value={customDictUrl}
              onChange={(e) => setCustomDictUrl(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-background px-4 py-2 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
            />
            <p className="mt-2 text-xs text-white/50">
              使用 <code className="rounded bg-white/10 px-1">WORD</code> 作为占位符
            </p>
          </div>
        </Section>

        {/* Subtitles & Playback */}
        <Section title="字幕与播放" icon="🎬">
          <CheckboxRow
            label="字幕后自动暂停"
            hint="播放到每条字幕结尾时自动暂停"
            checked={autoPause}
            onChange={setAutoPause}
          />
          <CheckboxRow
            label="默认隐藏字幕"
            hint="鼠标悬停时显示，训练听力"
            checked={hideSubtitles}
            onChange={setHideSubtitles}
          />
          <CheckboxRow
            label="显示注音（假名/拼音）"
            hint="为使用不同书写系统的语言显示发音"
            checked={showFurigana}
            onChange={setShowFurigana}
          />
        </Section>

        {/* Other Options */}
        <Section title="其他选项" icon="🌐">
          <SelectRow
            label="UI Language / 界面语言"
            value={uiLang}
            onChange={setUiLang}
            options={uiLanguages}
          />
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://github.com/anthropics/claude-code/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-secondary hover:underline"
            >
              最新更新
            </a>
            <span className="text-white/30">•</span>
            <span className="text-sm text-white/60">版本 0.3.1</span>
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-card p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      {children}
    </section>
  );
}

function SelectRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/20 bg-background px-4 py-2 text-sm text-white outline-none focus:border-secondary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="mb-3 flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer"
      />
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-white/50">{hint}</div>}
      </div>
    </label>
  );
}
