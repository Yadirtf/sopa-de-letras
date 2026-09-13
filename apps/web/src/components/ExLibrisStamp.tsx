export type SealId = 'pluma' | 'laurel' | 'luna' | 'tomo' | 'astrolabio' | 'candil' | 'llave' | 'flor';
export type InkId = 'bosque' | 'nogal' | 'lapis' | 'lacre' | 'laton';

export interface InkColorDef {
  id: InkId;
  name: string;
  colorHex: string;
  bgHex: string;
  borderHex: string;
  glowHex: string;
  lightHex: string;
}

export const INK_PALETTES: Record<InkId, InkColorDef> = {
  bosque: {
    id: 'bosque',
    name: 'Tinta Bosque',
    colorHex: '#6ee7b7',
    bgHex: '#143826',
    borderHex: '#2d6a4f',
    glowHex: 'rgba(45, 106, 79, 0.45)',
    lightHex: '#a7f3d0',
  },
  nogal: {
    id: 'nogal',
    name: 'Tinta Nogal',
    colorHex: '#fcd34d',
    bgHex: '#3d2510',
    borderHex: '#7f4f24',
    glowHex: 'rgba(127, 79, 36, 0.45)',
    lightHex: '#fef3c7',
  },
  lapis: {
    id: 'lapis',
    name: 'Tinta Índigo',
    colorHex: '#93c5fd',
    bgHex: '#142544',
    borderHex: '#2563eb',
    glowHex: 'rgba(37, 99, 235, 0.45)',
    lightHex: '#bfdbfe',
  },
  lacre: {
    id: 'lacre',
    name: 'Tinta Lacre',
    colorHex: '#fca5a5',
    bgHex: '#421417',
    borderHex: '#991b1b',
    glowHex: 'rgba(153, 27, 27, 0.45)',
    lightHex: '#fecaca',
  },
  laton: {
    id: 'laton',
    name: 'Tinta Oro Viejo',
    colorHex: '#fef08a',
    bgHex: '#3a2707',
    borderHex: '#b45309',
    glowHex: 'rgba(180, 83, 9, 0.45)',
    lightHex: '#fef9c3',
  },
};

export const SEALS: { id: SealId; name: string; icon: string; desc: string }[] = [
  { id: 'pluma', name: 'Pluma Estilográfica', icon: '✒️', desc: 'Para almas literarias y creadoras' },
  { id: 'laurel', name: 'Corona de Laurel', icon: '🌿', desc: 'Emblema de victoria y nobleza' },
  { id: 'luna', name: 'Astro Nocturno', icon: '🌙', desc: 'Para mentes que resuelven a la luz de las velas' },
  { id: 'tomo', name: 'Tomo Encuadernado', icon: '📖', desc: 'Para devoradores de bibliotecas' },
  { id: 'astrolabio', name: 'Rosa de los Vientos', icon: '🧭', desc: 'Para navegantes del tablero' },
  { id: 'candil', name: 'Candil de Estudio', icon: '🕯️', desc: 'Luz tenue para la máxima concentración' },
  { id: 'llave', name: 'Llave de Cifras', icon: '🗝️', desc: 'Custodio de palabras secretas' },
  { id: 'flor', name: 'Flor de Lis', icon: '⚜️', desc: 'Sello heráldico de distinción clásica' },
];

interface ExLibrisStampProps {
  nickname?: string;
  seal?: SealId | string;
  ink?: InkId | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ExLibrisStamp({
  nickname = 'A',
  seal = 'pluma',
  ink = 'nogal',
  size = 'md',
  showLabel = false,
  className = '',
  onClick,
}: ExLibrisStampProps) {
  const safeInk = (INK_PALETTES[ink as InkId] ? ink : 'nogal') as InkId;
  const inkDef = INK_PALETTES[safeInk];
  const initial = (nickname?.trim()?.charAt(0) || 'E').toUpperCase();

  const sealObj = SEALS.find(s => s.id === seal) || SEALS[0];

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const ringPads = {
    xs: 'border',
    sm: 'border-[1.5px]',
    md: 'border-2',
    lg: 'border-2',
    xl: 'border-[3px]',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''} ${className}`}
      title={`Ex Libris: ${nickname} · Sello ${sealObj.name} · ${inkDef.name}`}
    >
      {/* Antique Seal Stamp */}
      <div
        className={`relative ${sizeClasses[size]} shrink-0 rounded-full flex items-center justify-center font-serif transition-shadow duration-300 ${ringPads[size]}`}
        style={{
          backgroundColor: inkDef.bgHex,
          borderColor: inkDef.borderHex,
          boxShadow: `0 2px 10px ${inkDef.glowHex}, inset 0 1px 3px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.5)`,
          color: inkDef.colorHex,
        }}
      >
        {/* Decorative inner dotted border ring */}
        <div 
          className="absolute inset-[2px] rounded-full border border-dashed opacity-40 pointer-events-none"
          style={{ borderColor: inkDef.colorHex }}
        />

        {/* Monogram Initial & Micro Icon */}
        <div className="relative flex items-center justify-center font-black tracking-tight" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
          <span>{initial}</span>
          <span 
            className="absolute -bottom-1 -right-1 text-[8px] sm:text-[10px] filter drop-shadow-sm select-none pointer-events-none" 
            style={{ transform: size === 'xs' || size === 'sm' ? 'scale(0.7)' : 'scale(0.95)' }}
          >
            {sealObj.icon}
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="flex flex-col min-w-0">
          <span className="font-serif font-bold text-sm text-parchment-100 truncate leading-tight">
            {nickname}
          </span>
          <span className="text-[10px] text-parchment-400 font-sans tracking-wide">
            {inkDef.name}
          </span>
        </div>
      )}
    </div>
  );
}
