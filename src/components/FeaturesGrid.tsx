import { FeatureCard } from "./FeatureCard";

const features = [
  {
    title: "Netflix",
    description:
      "浏览器扩展程序让您喜爱的节目变成语言课堂 🍿 Pro模式支持语音识别和机器翻译，帮助您轻松理解内容 🌍",
    image: "/images/features/netflix.webp",
    link: "https://chrome.google.com/webstore/detail/language-learning-with-ne/hoombieeljmmljlkjmnheibnpciblicm",
    imageAlt: "Netflix feature screenshot",
    span: 2 as const,
    priority: true,
  },
  {
    title: "YouTube 和播客",
    description:
      "数千个涵盖各种主题的 YouTube 频道 🧠 通过地道的语言环境提升你的理解能力。快来浏览我们精心挑选的内容目录 🎧",
    image: "/images/features/youtube.webp",
    link: "https://www.languagereactor.com/c/en/yt/t_yt_mix_en",
    imageAlt: "YouTube feature screenshot",
  },
  {
    title: "📑 书籍与网站",
    description:
      "将任何网页导入到 Language Reactor。或上传你喜欢的书籍！配合文字转语音功能一起学习。🎯",
    image: "/images/features/books-and-websites.webp",
    link: "https://www.languagereactor.com/text",
    imageAlt: "Books and websites feature screenshot",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="w-full bg-background py-20 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            从喜爱的内容中学习
          </h2>
          <p className="mx-auto max-w-[700px] text-lg text-white/70">
            Language Reactor 帮助你找到适合你水平和兴趣的内容
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
