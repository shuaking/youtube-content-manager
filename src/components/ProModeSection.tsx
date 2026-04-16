import { ChevronRightIcon } from "./icons";

export default function ProModeSection() {
  return (
    <section className="w-full bg-background py-20 md:py-16 lg:py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Icon and Title */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="text-4xl leading-none">💎</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Pro 模式 - 可选
          </h2>
        </div>

        {/* Description */}
        <p className="mb-8 text-lg leading-relaxed text-white/70">
          Language Reactor 已经内置了许多实用的免费功能。Pro
          模式为您的体验增添了一些特别的光彩。 ✨
        </p>

        {/* CTA Button */}
        <a
          href="https://www.languagereactor.com/pro-mode"
          className="group inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/20"
        >
          <span>了解更多</span>
          <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}
