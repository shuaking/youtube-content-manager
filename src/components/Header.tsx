"use client";

import Link from "next/link";
import {
  LogoIcon,
  SearchIcon,
  HistoryIcon,
  TranslateIcon,
  UserProfileIcon,
  MenuIcon,
} from "./icons";

export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 w-full h-[56px] z-[1100] bg-transparent backdrop-blur-[3px] border-b border-white/15 py-[7px] flex flex-col text-white"
      style={{
        transition: "left 0.195s cubic-bezier(0.4, 0, 0.6, 1), width 0.195s cubic-bezier(0.4, 0, 0.6, 1)",
      }}
    >
      <div className="flex flex-row items-center h-[42px] min-h-[42px] px-1 w-full relative">
        {/* Logo Container */}
        <div
          className="flex flex-row items-center mx-[5px] ml-[10px] w-[131.823px] h-[29.7396px] opacity-90 hover:opacity-100 transition-opacity duration-200"
        >
          <Link
            href="/"
            className="flex flex-row items-center gap-[6px] px-[10px] py-1 bg-white/6 border border-white/10 rounded-[16px] cursor-pointer text-[13.6px] leading-[20.4px]"
            aria-label="Language Reactor Home"
          >
            <LogoIcon className="w-6 h-6" />
          </Link>
        </div>

        {/* Vertical Divider */}
        <div className="block w-px h-[18px] bg-white/15 mx-1" />

        {/* Icon Group - Search + History */}
        <div className="flex flex-row items-center gap-2 mx-[5px] ml-[15px] opacity-60 hover:opacity-100 transition-opacity duration-200">
          <Link
            href="/search"
            className="opacity-60 hover:opacity-100 transition-opacity duration-200"
            aria-label="Search"
          >
            <SearchIcon
              className="w-[19.1979px] h-[19.1979px]"
              style={{
                color: "oklch(0.6 0 0)",
                transition: "fill 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </Link>
          <Link
            href="/history"
            className="opacity-60 hover:opacity-100 transition-opacity duration-200"
            aria-label="History"
          >
            <HistoryIcon
              className="w-[19.1979px] h-[19.1979px]"
              style={{
                color: "oklch(0.6 0 0)",
                transition: "fill 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </Link>
        </div>

        {/* Vertical Divider */}
        <div className="block w-px h-[18px] bg-white/15 mx-1" />

        {/* Notification Badge */}
        <div className="flex flex-row items-center gap-2 mx-[10px] w-[22.8542px] h-[22.8542px] opacity-60 hover:opacity-100 cursor-pointer transition-opacity duration-200">
          <button
            onClick={() => console.log("Notifications clicked")}
            className="relative"
            aria-label="Notifications"
          >
            <span className="block w-[22.8542px] h-[22.8542px] rounded-full bg-white/10 flex items-center justify-center">
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </span>
          </button>
        </div>

        {/* Spacer - flex-grow */}
        <p className="flex-grow text-base leading-6" />

        {/* Language Selector */}
        <div className="flex flex-row items-center w-[180.854px] h-[40px]">
          <TranslateIcon className="w-[22.8542px] h-[22.8542px] mr-2 text-white" />
          <button
            onClick={() => console.log("Language selector clicked")}
            className="w-[150px] h-[40px] bg-transparent border-none text-white cursor-pointer text-left"
            aria-label="Select language"
          >
            英英语
          </button>
        </div>

        {/* User Profile */}
        <span className="flex flex-row w-[44px] h-[36px] cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => console.log("User profile clicked")}
            className="flex items-center justify-center w-full h-full"
            aria-label="User profile"
          >
            <UserProfileIcon className="w-6 h-6" />
          </button>
        </span>

        {/* Menu Button (Hamburger) */}
        <button
          onClick={() => console.log("Menu clicked")}
          className="flex flex-row justify-center items-center p-[5px] ml-[2px] w-[37.4271px] h-[37.4271px] rounded-full bg-transparent text-white/70 cursor-pointer border-0 hover:bg-white/8"
          style={{
            transition: "background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          aria-label="Open menu"
        >
          <MenuIcon className="w-[27.4271px] h-[27.4271px]" />
        </button>
      </div>
    </header>
  );
}
