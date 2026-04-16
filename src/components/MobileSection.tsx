import Image from "next/image";

export default function MobileSection() {
  return (
    <section className="w-full bg-background py-20 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
          {/* Image */}
          <div className="w-full max-w-[400px] flex-1">
            <Image
              src="/images/features/phone-tablet.png"
              alt="Language Reactor on mobile and tablet devices"
              width={400}
              height={500}
              className="w-full"
              style={{ height: 'auto' }}
            />
          </div>

          {/* Text Content */}
          <div className="max-w-[500px] flex-1 text-center md:text-left">
            <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
              <span className="text-3xl leading-none">📱</span>
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                手机和平板
              </h2>
            </div>
            <p className="text-base leading-relaxed text-white/70">
              Language Reactor 同样适用于手机和平板电脑。我们一直在不断改进。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
