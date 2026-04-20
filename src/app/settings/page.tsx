"use client";

import { languages } from "@/types/catalog";
import { useSettings } from "@/hooks/useStore";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

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
  const [settings, update] = useSettings();

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">设置</h1>
            <p className="text-white/70">自定义您的 Language Reactor 体验</p>
          </div>
          <button
            onClick={() => {
              if (typeof document === "undefined") return;
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10"
            title="全屏"
          >
            ⛶ Fullscreen
          </button>
        </div>

        <Section title="App Installation" icon="📲">
          <p className="mb-3 text-sm leading-relaxed text-white/70">
            Install Language Reactor on your device for a faster, full-screen experience with easy access from your home screen or desktop. To install, open your browser menu and select &quot;Install app&quot; or &quot;Add to Home Screen&quot;.
          </p>
          <div className="flex gap-4 text-xs text-white/50">
            <span>Browser SW: <span className="text-green-400">active</span></span>
            <span>Prompt: <span className="text-white/40">Unavailable</span></span>
          </div>
        </Section>

        <Section title="账户信息" icon="👤">
          <AccountPanel />
        </Section>

        <Section title="基本设置" icon="⚙️">
          <div className="space-y-4">
            <SelectRow
              label="学习语言"
              value={settings.learningLang}
              onChange={(v) => update({ learningLang: v })}
              options={languages.map((l) => ({ value: l.code, label: `${l.flag} ${l.nativeName}` }))}
            />
            <SelectRow
              label="翻译语言"
              value={settings.translationLang}
              onChange={(v) => update({ translationLang: v })}
              options={uiLanguages}
            />
          </div>
        </Section>

        <Section title="词汇标记" icon="🖍️">
          <p className="mb-3 text-sm text-white/60">
            智能高亮和难度标记，登录后自动同步学习进度
          </p>
          <CheckboxRow
            label="智能高亮已保存词汇"
            hint="识别复数、动词变位等词形变化"
            checked={settings.smartHighlight}
            onChange={(v) => update({ smartHighlight: v })}
          />
          <CheckboxRow
            label="学习阶段颜色下划线"
            hint="在视频和文本中为每个词按阶段显示颜色下划线（可能增加视觉噪音）"
            checked={settings.colorUnderlines}
            onChange={(v) => update({ colorUnderlines: v })}
          />
          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-white/80">
              词汇量基线
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={500}
                max={30000}
                step={500}
                value={settings.vocabSize}
                onChange={(e) => update({ vocabSize: Number(e.target.value) })}
                className="w-32 rounded-lg border border-white/10 bg-background px-4 py-2 text-sm text-white outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
              />
              <span className="text-sm text-white/60">个单词</span>
            </div>
            <p className="mt-2 text-xs text-white/50">
              您大概已知的词汇量，用于自动判断哪些词值得提醒您学习。
            </p>
          </div>
        </Section>

        <Section title="词典" icon="📖">
          <CheckboxRow
            label="显示迷你词典"
            checked={settings.showMiniDict}
            onChange={(v) => update({ showMiniDict: v })}
          />
          <CheckboxRow
            label="单击时朗读单词"
            checked={settings.speakOnClick}
            onChange={(v) => update({ speakOnClick: v })}
          />
          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-white/80">
              用户自定义词典网址
            </label>
            <input
              type="text"
              placeholder="http://www.example.com?q=WORD"
              value={settings.customDictUrl}
              onChange={(e) => update({ customDictUrl: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-background px-4 py-2 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
            />
            <p className="mt-2 text-xs text-white/50">
              使用 <code className="rounded bg-white/10 px-1">WORD</code> 作为占位符
            </p>
          </div>
        </Section>

        <Section title="字幕与播放" icon="🎬">
          <CheckboxRow
            label="字幕后自动暂停"
            hint="播放到每条字幕结尾时自动暂停"
            checked={settings.autoPause}
            onChange={(v) => update({ autoPause: v })}
          />
          <CheckboxRow
            label="默认隐藏字幕"
            hint="鼠标悬停时显示，训练听力"
            checked={settings.hideSubtitles}
            onChange={(v) => update({ hideSubtitles: v })}
          />
          <CheckboxRow
            label="显示注音（假名/拼音）"
            hint="为使用不同书写系统的语言显示发音"
            checked={settings.showFurigana}
            onChange={(v) => update({ showFurigana: v })}
          />
          <CheckboxRow
            label="显示机器翻译"
            hint="侧重字面含义，帮助理解句型"
            checked={settings.showMachineTranslation}
            onChange={(v) => update({ showMachineTranslation: v })}
          />
          <CheckboxRow
            label="显示人工翻译"
            hint="准确表达习语和文化语境"
            checked={settings.showHumanTranslation}
            onChange={(v) => update({ showHumanTranslation: v })}
          />
        </Section>

        <Section title="其他选项" icon="🌐">
          <SelectRow
            label="UI Language / 界面语言"
            value={settings.uiLang}
            onChange={(v) => update({ uiLang: v })}
            options={uiLanguages}
          />
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://github.com/shuaking/youtube-content-manager/releases"
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

        <Section title="数据管理" icon="🗃️">
          <p className="mb-4 text-sm text-white/60">
            所有学习数据（词汇、历史、设置、聊天）存储在本地浏览器的 localStorage 中。
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const data = {
                  savedWords: JSON.parse(localStorage.getItem("lr.savedWords") || "[]"),
                  history: JSON.parse(localStorage.getItem("lr.history") || "[]"),
                  settings: JSON.parse(localStorage.getItem("lr.settings") || "{}"),
                  chat: JSON.parse(localStorage.getItem("lr.chat") || "[]"),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `language-reactor-backup-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-all hover:opacity-90"
            >
              导出所有数据
            </button>
            <button
              onClick={() => {
                if (!confirm("确定清除所有本地数据吗？此操作不可撤销。")) return;
                ["lr.savedWords", "lr.history", "lr.settings", "lr.chat"].forEach((k) =>
                  localStorage.removeItem(k)
                );
                location.reload();
              }}
              className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20"
            >
              清除所有数据
            </button>
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

function AccountPanel() {
  const auth = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  if (!auth.configured) {
    return (
      <div>
        <p className="mb-2 text-white">Supabase 未配置</p>
        <p className="text-sm text-white/60">
          应用正在本地模式运行，所有数据仅保存在浏览器中。管理员可在环境变量中配置{" "}
          <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_SUPABASE_URL</code> 和{" "}
          <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          启用云端账户同步。
        </p>
      </div>
    );
  }

  if (auth.loading) {
    return <p className="text-white/60">正在加载账户状态...</p>;
  }

  if (auth.user) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-white">{auth.user.email}</p>
          <p className="mt-1 text-sm text-white/60">
            已登录 · 用户 ID: {auth.user.id.slice(0, 8)}...
          </p>
        </div>
        <button
          onClick={() => auth.signOut()}
          className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white transition-all hover:bg-white/10"
        >
          退出登录
        </button>
      </div>
    );
  }

  const submit = async () => {
    setSubmitting(true);
    setMessage(null);
    const fn = mode === "signin" ? auth.signIn : auth.signUp;
    const { error } = await fn(email, password);
    if (error) {
      setMessage({ text: error, ok: false });
    } else if (mode === "signup") {
      setMessage({ text: "注册成功！请查收邮件完成验证。", ok: true });
    } else {
      setMessage({ text: "登录成功", ok: true });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("signin")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            mode === "signin"
              ? "bg-secondary text-secondary-foreground"
              : "bg-white/5 text-white/70"
          }`}
        >
          登录
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            mode === "signup"
              ? "bg-secondary text-secondary-foreground"
              : "bg-white/5 text-white/70"
          }`}
        >
          注册
        </button>
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
        autoComplete="email"
        className="w-full rounded-lg border border-white/10 bg-background px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="密码"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        className="w-full rounded-lg border border-white/10 bg-background px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/20 focus:ring-2 focus:ring-secondary/50"
      />
      <button
        onClick={submit}
        disabled={!email || !password || submitting}
        className="w-full rounded-lg bg-secondary px-4 py-2 font-semibold text-secondary-foreground transition-all hover:opacity-90 disabled:opacity-30"
      >
        {submitting ? "处理中..." : mode === "signin" ? "登录" : "注册"}
      </button>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.ok
              ? "border border-green-500/30 bg-green-500/10 text-green-400"
              : "border border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
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
