import Image from "next/image";

const secondaryFeatures = [
  {
    emoji: "👥",
    title: "双语字幕",
    description:
      "通过双语对照提升听力理解能力，了解两种语言之间的意义联系 👂",
    image: "/images/features/bilingual-subtitles.webp",
    imageAlt: "Bilingual subtitles feature",
  },
  {
    emoji: "⏯️",
    title: "精确播放控制",
    description:
      "⚡ 暂停时间。控制播放速度。🎮 使用键盘快捷键和手势操作视频。字幕后自动暂停并循环播放直到点击继续。🖱️",
    image: "/images/features/precise-playback-controls.webp",
    imageAlt: "Precise playback controls feature",
  },
  {
    emoji: "🔍",
    title: "词典与 Lexa AI",
    description:
      "🔍 点击任意单词获取即时翻译。真实语境例句配有原声音频。🎧 AI智能解析词语用法。🌱 自定义显示更多信息！",
    image: "/images/features/dict_and_examples.webp",
    imageAlt: "Dictionary and AI feature",
  },
  {
    emoji: "🌍",
    title: "多语言支持",
    description:
      "学习40多种语言的内容 🔤 查看使用不同书写系统的语言的注音 👀 字幕默认隐藏直到鼠标悬停——完美训练您的听力技能",
    image: "/images/features/world-map.webp",
    imageAlt: "Multi-language support feature",
  },
];

export default function SecondaryFeatures() {
  return (
    <section className="w-full bg-background py-20 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            语言学习神器
          </h2>
          <p className="text-lg text-white/70 md:text-xl">
            让任何内容都易于理解
          </p>
        </div>

        {/* Features List */}
        <div className="flex flex-col gap-12 md:gap-16">
          {secondaryFeatures.map((feature, index) => {
            const isReversed = index % 2 === 1;

            return (
              <div
                key={feature.title}
                className={`flex flex-col items-center gap-8 md:flex-row md:gap-8 ${
                  isReversed ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Image Container */}
                <div className="w-full max-w-[500px] flex-1 md:max-w-[400px] lg:max-w-[500px]">
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      src={feature.image}
                      alt={feature.imageAlt}
                      width={500}
                      height={350}
                      className="w-full"
                      style={{ height: 'auto' }}
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className="max-w-[500px] flex-1 text-center md:text-left">
                  <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
                    <span className="text-3xl leading-none">{feature.emoji}</span>
                    <h3 className="text-xl font-semibold text-white md:text-2xl">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-base leading-relaxed text-white/70">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
