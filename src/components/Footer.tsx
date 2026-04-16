import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-background py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Language Reactor
            </h3>
            <p className="text-sm leading-relaxed text-white/60">
              以前是 Language Learning with Netflix
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              探索、理解并从母语材料中学习的完美助手
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              快速链接
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help/basic"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  帮助
                </Link>
              </li>
              <li>
                <Link
                  href="/pro-mode"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  Pro 模式
                </Link>
              </li>
              <li>
                <a
                  href="https://forum.languagelearningwithnetflix.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  论坛
                </a>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  设置
                </Link>
              </li>
            </ul>
          </div>

          {/* Install Section */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              开始使用
            </h4>
            <a
              href="https://chrome.google.com/webstore/detail/language-learning-with-ne/hoombieeljmmljlkjmnheibnpciblicm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-secondary-foreground transition-all hover:opacity-90"
            >
              安装 Chrome 扩展
            </a>
            <p className="mt-4 text-xs text-white/50">2,000,000+ 用户</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-white/50">
              © {currentYear} Language Reactor. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-white/50 transition-colors hover:text-white"
              >
                隐私政策
              </a>
              <a
                href="#"
                className="text-sm text-white/50 transition-colors hover:text-white"
              >
                使用条款
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
