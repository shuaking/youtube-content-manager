import Image from "next/image";
import { ChevronRightIcon } from "./icons";

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  imageAlt: string;
  span?: 1 | 2;
  priority?: boolean;
}

export function FeatureCard({
  title,
  description,
  image,
  link,
  imageAlt,
  span = 1,
  priority = false,
}: FeatureCardProps) {
  const isExternal = link.startsWith("http");
  const colSpanClass = span === 2 ? "col-span-2" : "col-span-1";

  return (
    <a
      href={link}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`group block ${colSpanClass}`}
    >
      <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl">
        <div className="relative h-[200px] w-full bg-white/5">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="text-xl font-semibold leading-tight text-white">
            {title}
          </h3>

          <p className="flex-1 text-[15px] leading-relaxed text-white/70">
            {description}
          </p>

          <div className="flex justify-end">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/20">
              <ChevronRightIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
