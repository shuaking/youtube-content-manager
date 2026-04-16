import Image from "next/image";
import { ExternalLinkIcon } from "./icons";

export default function HeroSection() {
  return (
    <section className="w-full bg-background">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-16 lg:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="flex-1 max-w-[600px] z-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white mb-5">
              Language Reactor
            </h1>
            <p className="text-base md:text-base lg:text-lg leading-relaxed text-white/70 max-w-[560px] mb-9 mx-auto md:mx-0">
              🚀 探索、理解并从母语材料中学习的完美助手。✨
              体验一种不仅高效，更充满乐趣的沉浸式学习方式！🔥
            </p>
            <div className="flex justify-center md:justify-start">
              <a
                href="https://chrome.google.com/webstore/detail/language-learning-with-ne/hoombieeljmmljlkjmnheibnpciblicm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-secondary text-secondary-foreground rounded-[10px] text-base font-semibold uppercase transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                aria-label="Install Chrome Extension"
              >
                <ExternalLinkIcon className="w-5 h-5" />
                <span>安装 CHROME 扩展</span>
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 relative w-full max-w-[500px] md:max-w-[400px] lg:max-w-[500px]">
            <Image
              src="/images/hero/girl_desk-big.webp"
              alt="Girl learning at desk with Language Reactor"
              width={500}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
