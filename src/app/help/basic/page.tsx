"use client";

import { useState } from "react";

type HelpTab = "basic" | "export" | "tips" | "save-words" | "changelog" | "faq";

const tabs: { id: HelpTab; label: string }[] = [
  { id: "basic", label: "开始使用" },
  { id: "export", label: "导出指南" },
  { id: "tips", label: "学习提示" },
  { id: "save-words", label: "保存单词" },
  { id: "changelog", label: "更新记录" },
  { id: "faq", label: "FAQ" },
];

export default function HelpBasicPage() {
  const [activeTab, setActiveTab] = useState<HelpTab>("basic");

  return (
    <main className="min-h-screen bg-background pt-[56px]">
      <section className="w-full border-b border-white/10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all ${
                    activeTab === tab.id
                      ? "border-b-2 border-secondary text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
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
              title="全屏"
              className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition-all hover:bg-white/10"
            >
              <span className="mr-1">⛶</span>Fullscreen
            </button>
          </div>
        </div>
      </section>

      <section className="w-full py-12">
        <div className="mx-auto max-w-4xl px-6">
          {activeTab === "basic" && <BasicContent />}
          {activeTab === "export" && <ExportContent />}
          {activeTab === "tips" && <TipsContent />}
          {activeTab === "save-words" && <SaveWordsContent />}
          {activeTab === "changelog" && <ChangelogContent />}
          {activeTab === "faq" && <FaqContent />}
        </div>
      </section>
    </main>
  );
}

function Article({ children }: { children: React.ReactNode }) {
  return (
    <article className="prose prose-invert max-w-none space-y-6 text-white/80">
      {children}
    </article>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-2xl font-bold text-white">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 text-lg font-semibold text-white">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed">{children}</p>;
}

function List({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul className="ml-6 list-disc space-y-2 leading-relaxed">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-white/10 px-2 py-0.5 text-sm font-mono text-white">
      {children}
    </kbd>
  );
}

function BasicContent() {
  return (
    <Article>
      <h1 className="mb-2 text-3xl font-bold text-white">开始使用</h1>

      <H2>观看视频</H2>
      <P>
        安装浏览器扩展程序后，您可在 Netflix 和 YouTube 网站观看视频时享有语言学习的额外功能。本网站内的播放器也提供类似的学习体验。
      </P>
      <List
        items={[
          "点击任意单词，查看词典释义与例句",
          "右键或点击 ☆ 保存单词",
          "每个字幕结束时自动暂停播放（可在设置中开关）",
          "同时显示双语字幕：原语言 + 母语翻译",
          "点击字幕上的句子从该位置开始重播",
        ]}
      />

      <H2>键盘快捷键（播放器）</H2>
      <div className="grid gap-3 rounded-xl border border-white/10 bg-card p-4 sm:grid-cols-2">
        <Shortcut k="Space / K" label="播放 / 暂停" />
        <Shortcut k="← / J" label="后退 5 / 10 秒" />
        <Shortcut k="→ / L" label="前进 5 / 10 秒" />
        <Shortcut k="A" label="上一字幕" />
        <Shortcut k="S" label="重播当前字幕" />
        <Shortcut k="D" label="下一字幕" />
        <Shortcut k="Q" label="自动暂停开关" />
        <Shortcut k="E" label="模糊下一字幕（听力）" />
        <Shortcut k="R" label="保存当前字幕到短语" />
        <Shortcut k="T" label="切换翻译显示" />
        <Shortcut k="Ctrl / ⌘ + C" label="复制当前字幕到剪贴板" />
        <Shortcut k=", / ." label="播放速度 -/+ 0.25x" />
        <Shortcut k="1 - 9" label="跳到视频 10%-90%" />
        <Shortcut k="?" label="显示所有快捷键" />
        <Shortcut k="Esc" label="关闭弹窗" />
      </div>

      <H2>机翻与人工翻译</H2>
      <P>
        设置中可选择显示两种翻译，即机翻与人工翻译。机翻更侧重字面，有助于理解句型结构；人工翻译通常能准确翻译特定说法与习语。
      </P>

      <H2>导入网页与文本</H2>
      <P>
        通过「文本分析」页面粘贴任意英文文本，系统会自动分词、评估难度并生成词汇列表。支持上传 .txt、.srt、.vtt 文件。
      </P>
    </Article>
  );
}

function Shortcut({ k, label }: { k: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-white/70">
      <span>{label}</span>
      <Kbd>{k}</Kbd>
    </div>
  );
}

function ExportContent() {
  return (
    <Article>
      <h1 className="mb-2 text-3xl font-bold text-white">导出指南</h1>

      <H2>导出到 Anki</H2>
      <P>
        前往「已保存项目 → 导出选项」，点击「生成 Anki TSV 文件」。下载后在 Anki 中按以下步骤导入：
      </P>
      <List
        items={[
          "打开 Anki 桌面版（Windows / Mac / Linux）",
          "点击「文件」→「导入」",
          "选择下载的 .tsv 文件",
          "字段分隔符选择「Tab」",
          "启用「允许在字段中使用 HTML」以正确显示例句",
          "选择目标牌组，点击「导入」",
        ]}
      />
      <P>支持的 Anki 客户端：</P>
      <List
        items={[
          "Anki Desktop（Windows / Mac / Linux，免费）",
          "AnkiDroid（Android，免费）",
          "AnkiMobile（iOS，一次性付费）",
          "AnkiWeb（浏览器，导入后可免费复习）",
        ]}
      />

      <H2>导出为 CSV</H2>
      <P>
        在「已保存项目」页面点击「下载 CSV 文件」可获得通用 CSV 格式，方便导入到 Excel、Google Sheets 或其他间隔重复工具。
      </P>

      <H2>导出字幕</H2>
      <P>
        在播放器右上角「导出」菜单可下载当前视频的完整字幕。支持 CSV / JSON / SRT / VTT 四种格式。
      </P>

      <H2>导出对话</H2>
      <P>
        在 Chatbot 页面右上角点击「导出」可下载整段 Aria 对话记录为 txt 文件。
      </P>

      <H2>备份所有数据</H2>
      <P>
        在「设置 → 数据管理」可一键导出所有本地数据（词汇、历史、设置、聊天）为 JSON 文件，方便在其他设备恢复。
      </P>
    </Article>
  );
}

function TipsContent() {
  return (
    <Article>
      <h1 className="mb-2 text-3xl font-bold text-white">学习提示</h1>

      <H2>初级学习者</H2>
      <P>每条字幕建议按以下顺序学习：</P>
      <List
        items={[
          "先不看文字，只听音频一两遍（按 S 重播）",
          "边看原语言字幕边听音频",
          "参考翻译确认完整含义",
          "查询一到两个关键词的词典释义（不必每个词都查）",
          "再听一两遍，直到该句子听来自然熟悉",
          "按 D 到下一字幕重复流程",
        ]}
      />

      <H2>中级学习者</H2>
      <List
        items={[
          "直接听音频，理解应达到 50% 以上",
          "看原语言字幕补全理解",
          "遇到生词用迷你词典快速查询",
          "按 E 键模糊化下一字幕挑战自己",
          "关键句子按 R 保存到短语收藏",
        ]}
      />

      <H2>高级学习者</H2>
      <List
        items={[
          "默认隐藏字幕（设置中开启），训练真实听力",
          "主动查找地道表达与习语",
          "导出词汇到 Anki 进行系统化复习",
          "使用 PhrasePump 强化口语句型",
          "通过 Aria 进行自由对话练习",
        ]}
      />

      <H2>建立每日习惯</H2>
      <List
        items={[
          "每天至少学习 15 分钟，保持连续性",
          "完成仪表板上的每日目标累积 XP",
          "使用 SRS 间隔重复复习，确保长期记忆",
          "周末回顾一周的保存词汇与短语",
        ]}
      />
    </Article>
  );
}

function SaveWordsContent() {
  return (
    <Article>
      <h1 className="mb-2 text-3xl font-bold text-white">保存单词</h1>

      <H2>学习阶段系统</H2>
      <P>
        每个保存的单词都有一个「学习阶段」，用于标识您对该单词的熟悉度：
      </P>
      <List
        items={[
          <span key="k">
            <strong className="text-white">已知（白色）</strong>：您已经掌握的词
          </span>,
          <span key="l">
            <strong className="text-orange-300">学习中（橙色）</strong>：您正在学习、需要复习的词
          </span>,
          <span key="u">
            <strong className="text-white/60">不常用（灰色）</strong>：频率较低、可暂时略过的词
          </span>,
          <span key="i">
            <strong className="text-white/40">忽略</strong>：不需要进入复习流的词
          </span>,
        ]}
      />

      <H2>批量操作</H2>
      <P>
        在「已保存项目 → 标记的词语」页面：
      </P>
      <List
        items={[
          "通过「所有阶段」下拉选择某个阶段筛选",
          "工具栏上的四个阶段按钮会将当前筛选出的全部词汇批量设为该阶段",
          "每个词的详情面板也可单独切换阶段",
        ]}
      />

      <H2>保存途径</H2>
      <List
        items={[
          "播放器：点击单词或按 R 保存当前字幕中词汇",
          "文本分析：点击词汇前的复选框或「保存全部到词汇表」",
          "视频详情页：点击「保存到学习列表」",
          "短语：播放器按 R 将整条字幕保存为短语",
        ]}
      />

      <H2>词汇量基线</H2>
      <P>
        在设置中可设置您的大概已知词汇量（例如 3000 词）。系统会用此基线决定哪些词值得提醒您学习，哪些可判为已知或不常用。
      </P>
    </Article>
  );
}

function ChangelogContent() {
  return (
    <Article>
      <h1 className="mb-2 text-3xl font-bold text-white">更新记录</h1>

      <H3>v0.4.0 — 功能对齐</H3>
      <List
        items={[
          "学习阶段系统：已知 / 学习中 / 不常用 / 忽略",
          "保存的短语：播放器按 R 保存字幕为短语",
          "播放器新增 A/S/D/Q/E/R 快捷键（extension 风格）",
          "字幕模糊模式：默认隐藏字幕，hover 显示",
          "字幕导出支持 SRT / VTT 格式",
          "帮助中心扩展为 6 个标签",
          "设置加入词汇量基线、颜色下划线、双翻译控制",
        ]}
      />

      <H3>v0.3.x — 持久化层</H3>
      <List
        items={[
          "引入 localStorage store + 全站数据联动",
          "/saved-items 读写真实数据 + Anki TSV + CSV 导出",
          "/review 三种模式：闪卡 / 拼写 / 听力（TTS）",
          "/dashboard Level/XP/连续天数从真实数据计算",
          "/history 记录真实活动日志",
          "/chatbot 对话持久化 + Web Speech API 语音输入",
          "/text 真实分词算法 + 点击保存",
        ]}
      />

      <H3>v0.2.x — UI 对齐</H3>
      <List
        items={[
          "媒体目录 8 tab 布局",
          "设置页面改为单页滚动布局",
          "播放器按钮带文字标签",
        ]}
      />
    </Article>
  );
}

function FaqContent() {
  return (
    <Article>
      <h1 className="mb-2 text-3xl font-bold text-white">常见问题</h1>

      <H3>字幕无法加载？</H3>
      <P>
        播放器通过 YouTube transcript API 拉取字幕。如果视频未提供字幕、或该视频被限制、或网络请求失败，可能显示「加载失败」。请尝试其他带字幕的视频。
      </P>

      <H3>数据会丢失吗？</H3>
      <P>
        所有学习数据保存在浏览器 localStorage，清除浏览器数据或切换浏览器后会丢失。建议在「设置 → 数据管理」定期导出 JSON 备份。
      </P>

      <H3>为什么我的词汇显示在 YouTube tab，不在 Netflix？</H3>
      <P>
        词汇归属到保存它的视频所在平台。您可以在词典中手动切换。
      </P>

      <H3>导出 Anki 时例句没有换行？</H3>
      <P>
        Anki 导入时需启用「允许在字段中使用 HTML」选项。本产品的 TSV 文件使用 &lt;br&gt; 标签格式化，未启用 HTML 会显示为纯文本。
      </P>

      <H3>语音识别不工作？</H3>
      <P>
        Web Speech API 仅在 Chrome / Edge 等基于 Chromium 的浏览器可用。Firefox 和 Safari 支持不完整。
      </P>

      <H3>如何更改学习语言？</H3>
      <P>
        在「设置 → 基本设置」切换学习语言。目前主要支持英语，未来会加入更多语言的词典和难度模型。
      </P>

      <H3>Pro 模式有什么不同？</H3>
      <P>
        Pro 模式将在未来版本加入 AI 翻译、语音识别、高级统计分析等功能。当前所有核心功能均免费可用。
      </P>
    </Article>
  );
}
