import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import SecondaryFeatures from "@/components/SecondaryFeatures";
import VocabularySection from "@/components/VocabularySection";
import PracticeSection from "@/components/PracticeSection";
import MobileSection from "@/components/MobileSection";
import ProModeSection from "@/components/ProModeSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Fixed Header - overlays all content */}
      <Header />

      {/* Main Content - add top padding to account for fixed header */}
      <main className="min-h-screen pt-[56px]">
        {/* Hero Section */}
        <HeroSection />

        {/* Section 1: 从喜爱的内容中学习 - Netflix, YouTube, Books */}
        <FeaturesGrid />

        {/* Section 2: 语言学习神器 - Bilingual subtitles, Playback, Dictionary, Languages */}
        <SecondaryFeatures />

        {/* Section 3: 掌握每个单词和短语 - Learning Focus, Smart Highlighting */}
        <VocabularySection />

        {/* Section 4: 熟能生巧 - PhrasePump, Anki, Aria, FSI/DLI */}
        <PracticeSection />

        {/* Section 5: 手机和平板 */}
        <MobileSection />

        {/* Section 6: Pro 模式 */}
        <ProModeSection />

        {/* Section 7: 媒体评价 */}
        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
