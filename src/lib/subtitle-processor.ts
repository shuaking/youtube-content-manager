import nlp from "compromise";

export interface ProcessedWord {
  text: string;
  startIndex: number;
  endIndex: number;
  saved: boolean;
  difficulty?: "beginner" | "intermediate" | "advanced";
  translation?: string;
  definition?: string;
}

const beginnerWords = new Set([
  "a", "an", "the", "is", "are", "am", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "should", "could",
  "can", "may", "might", "must", "shall", "i", "you", "he", "she", "it", "we", "they",
  "me", "him", "her", "us", "them", "my", "your", "his", "its", "our", "their",
  "this", "that", "these", "those", "what", "which", "who", "when", "where", "why", "how",
  "and", "or", "but", "if", "because", "as", "until", "while", "of", "at", "by", "for",
  "with", "about", "against", "between", "into", "through", "during", "before", "after",
  "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
  "again", "further", "then", "once", "here", "there", "all", "both", "each", "few",
  "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same",
  "so", "than", "too", "very", "yes", "no", "hello", "hi", "bye", "thanks", "please",
  "sorry", "good", "bad", "big", "small", "new", "old", "happy", "sad", "hot", "cold",
  "go", "come", "get", "make", "take", "see", "know", "think", "want", "like", "love",
  "eat", "drink", "sleep", "work", "play", "read", "write", "speak", "listen", "watch"
]);

const intermediateWords = new Set([
  "although", "however", "therefore", "moreover", "furthermore", "nevertheless",
  "consequently", "meanwhile", "otherwise", "besides", "instead", "rather",
  "achieve", "acquire", "analyze", "approach", "assess", "assume", "benefit",
  "concept", "consist", "constitute", "context", "contract", "create", "data",
  "define", "derive", "design", "distinct", "distribute", "economy", "environment",
  "establish", "estimate", "evident", "export", "factor", "finance", "formula",
  "function", "identify", "income", "indicate", "individual", "interpret", "involve",
  "issue", "labor", "legal", "legislate", "maintain", "major", "method", "occur",
  "percent", "period", "policy", "principle", "proceed", "process", "require",
  "research", "respond", "role", "section", "sector", "significant", "similar",
  "source", "specific", "structure", "theory", "vary", "achieve", "appropriate",
  "attitude", "circumstance", "community", "complex", "comprehensive", "concentrate"
]);

export function classifyDifficulty(word: string): "beginner" | "intermediate" | "advanced" {
  const lower = word.toLowerCase();

  if (beginnerWords.has(lower)) {
    return "beginner";
  }

  if (intermediateWords.has(lower)) {
    return "intermediate";
  }

  if (word.length <= 4) {
    return "beginner";
  }

  if (word.length <= 8) {
    return "intermediate";
  }

  return "advanced";
}

export function tokenizeText(text: string): ProcessedWord[] {
  const words: ProcessedWord[] = [];
  let currentIndex = 0;

  const doc = nlp(text);
  const terms = doc.terms().out("array");

  for (const term of terms) {
    const startIndex = text.indexOf(term, currentIndex);
    if (startIndex === -1) continue;

    const endIndex = startIndex + term.length;
    const isWord = /^[a-zA-Z]+$/.test(term);

    if (isWord && term.length > 1) {
      const difficulty = classifyDifficulty(term);
      words.push({
        text: term,
        startIndex,
        endIndex,
        saved: false,
        difficulty,
        translation: undefined,
        definition: undefined,
      });
    } else {
      words.push({
        text: term,
        startIndex,
        endIndex,
        saved: false,
      });
    }

    currentIndex = endIndex;
  }

  return words;
}

export async function translateText(text: string, targetLang: string = "zh-CN"): Promise<string> {
  // 翻译提供商列表（按优先级排序）
  const providers = [
    // Provider 1: LibreTranslate (开源，免费)
    async () => {
      const response = await fetch("https://libretranslate.com/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: "en",
          target: targetLang === "zh-CN" ? "zh" : targetLang,
          format: "text",
        }),
      });
      const data = await response.json();
      if (data.translatedText) {
        return data.translatedText;
      }
      throw new Error("LibreTranslate failed");
    },

    // Provider 2: MyMemory
    async () => {
      const encodedText = encodeURIComponent(text);
      const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translation = data.responseData.translatedText;
        // 检查是否是配额警告
        if (!translation.includes("MYMEMORY WARNING")) {
          return translation;
        }
      }
      throw new Error("MyMemory failed or quota exceeded");
    },

    // Provider 3: Lingva Translate (Google Translate 代理)
    async () => {
      const target = targetLang === "zh-CN" ? "zh" : targetLang;
      const response = await fetch(`https://lingva.ml/api/v1/en/${target}/${encodeURIComponent(text)}`);
      const data = await response.json();
      if (data.translation) {
        return data.translation;
      }
      throw new Error("Lingva failed");
    },
  ];

  // 尝试每个提供商，直到成功
  for (let i = 0; i < providers.length; i++) {
    try {
      const translation = await providers[i]();
      if (translation && translation.trim() !== "") {
        return translation;
      }
    } catch (error) {
      console.warn(`Translation provider ${i + 1} failed:`, error);
      // 如果不是最后一个提供商，继续尝试下一个
      if (i === providers.length - 1) {
        console.error("All translation providers failed");
        return "";
      }
    }
  }

  return "";
}

export async function translateBatch(texts: string[], targetLang: string = "zh-CN"): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < texts.length; i += 5) {
    const batch = texts.slice(i, i + 5);
    const promises = batch.map(text => translateText(text, targetLang));
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);

    if (i + 5 < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}
