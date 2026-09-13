import { BookOpen, Check } from 'lucide-react';
import { normalizeWord } from '../utils/wordNormalizer';

interface WordListProps {
  words: string[];
  foundWords: string[];
}

export function WordList({ words, foundWords }: WordListProps) {
  const total = words.length;
  const found = foundWords.length;

  return (
    <div className="flex flex-col gap-3 bg-[#101722]/90 p-4 rounded-2xl border border-[#27384c] shadow-lg shadow-black/40">
      <div className="flex justify-between items-center pb-2 border-b border-[#25364a]">
        <h3 className="font-serif font-bold text-stone-200 flex items-center gap-2 text-sm tracking-wide">
          <BookOpen className="w-4 h-4 text-[#d4a359]" />
          <span>Repertorio de Palabras</span>
        </h3>
        <span className="text-xs font-serif font-bold bg-[#1d2b3c] text-[#eed7a1] border border-[#d4a359]/30 px-2.5 py-0.5 rounded-full">
          {found}/{total}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((word) => {
          const isFound = foundWords.some(fw => normalizeWord(fw) === normalizeWord(word));
          return (
            <div 
              key={word}
              className={`px-3 py-1.5 rounded-xl text-xs font-serif tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 ${
                isFound 
                  ? 'bg-[#143826]/80 text-[#6ee7b7] line-through border border-[#2d6a4f]/70 opacity-60' 
                  : 'bg-[#15202e] text-[#e8ded0] border border-[#2b3c4f] hover:border-[#d4a359]/40'
              }`}
            >
              {isFound && <Check className="w-3.5 h-3.5 text-[#6ee7b7] stroke-[3]" />}
              <span>{word}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
