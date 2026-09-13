interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export function BrandLogo({ size = 'md', showSubtitle = false, className = '' }: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-sm tracking-wider',
    md: 'text-base sm:text-lg tracking-wider',
    lg: 'text-xl sm:text-2xl tracking-widest',
    xl: 'text-2xl sm:text-3xl tracking-widest',
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Handcrafted Literary Bookplate Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 group`}>
        {/* Warm Ambient Gold Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#b88636] via-[#d4a359] to-[#eed7a1] rounded-2xl blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Intaglio Wax / Brass Seal */}
        <div 
          className={`relative w-full h-full rounded-xl sm:rounded-2xl border border-[#d4a359]/60 flex items-center justify-center shadow-lg overflow-hidden`}
          style={{
            background: 'linear-gradient(135deg, #1b2838 0%, #0c141d 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 0 3px 8px rgba(0,0,0,0.6)',
          }}
        >
          {/* Inner ornamental filigree border */}
          <div className="absolute inset-[2px] rounded-lg sm:rounded-xl border border-dashed border-[#d4a359]/30 pointer-events-none" />

          {/* Central Calligraphic Monogram */}
          <div className="relative flex items-center justify-center font-serif text-[#f4eedb] font-black" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
            <span className="leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#fff2d6] via-[#d4a359] to-[#9a6e29]">
              S
            </span>
            <span className="absolute -bottom-1 -right-1 text-[8px] sm:text-[10px] text-[#eed7a1] opacity-90 filter drop-shadow">
              ✒️
            </span>
          </div>
        </div>
      </div>

      {/* Editorial Title & Atelier Tag */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span 
            className={`font-black uppercase text-white ${titleSizes[size]}`}
            style={{ fontFamily: 'Cinzel, Georgia, serif' }}
          >
            Sopa <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eed7a1] via-[#d4a359] to-[#b88636]">de Letras</span>
          </span>
          <span className="text-[9px] sm:text-[10px] font-serif uppercase tracking-widest px-1.5 py-0.5 rounded border border-[#d4a359]/40 bg-[#c59235]/10 text-[#d4a359] font-bold">
            Atelier
          </span>
        </div>

        {showSubtitle && (
          <span className="text-[11px] sm:text-xs text-amber-200/60 font-serif italic tracking-wide">
            Estudio literario de palabras y duelos
          </span>
        )}
      </div>
    </div>
  );
}
