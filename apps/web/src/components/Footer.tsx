import { Link } from 'react-router-dom';
import { 
  Feather, 
  BookOpen, 
  Users, 
  Scroll,
  Heart
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ExLibrisStamp } from './ExLibrisStamp';
import { useAuth } from '../hooks/useAuth';

export function Footer() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#070b10] border-t border-[#1d2a3a] text-[#ede3d2] relative overflow-hidden mt-auto">
      {/* Subtle Atmospheric Watermark */}
      <div className="absolute right-0 bottom-0 pointer-events-none select-none opacity-5 translate-x-12 translate-y-12">
        <Feather className="w-96 h-96 text-[#d4a359]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="inline-block hover:opacity-95 transition-opacity">
              <BrandLogo size="md" />
            </Link>

            <p className="text-stone-400 font-serif text-sm leading-relaxed max-w-sm">
              Un santuario tipográfico para el descifrado pausado y los duelos entre amigos. 
              Donde cada sopa de letras se convierte en un lienzo y cada jugador deja su monograma grabado en lacre.
            </p>

            {/* Atelier Stamp Badge */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0f1722] border border-[#233346] w-fit mt-2">
              <ExLibrisStamp nickname={user?.nickname || 'Atelier'} size="sm" seal="shield" ink="brass" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xs text-[#eed7a1]">
                  Atelier Literario Certificado
                </span>
                <span className="text-[11px] text-stone-400 font-serif italic">
                  Resolución armónica y tinta algorítmica
                </span>
              </div>
            </div>
          </div>

          {/* Column 1: Lienzos & Archivo */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#eed7a1] flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Lienzos</span>
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-serif text-stone-400">
              <li>
                <Link to="/" className="hover:text-[#eed7a1] transition-colors flex items-center gap-1.5">
                  <span>Galería de Manuscritos</span>
                </Link>
              </li>
              <li>
                <Link to={user && !user.isGuest ? '/create' : '/login'} state={{ returnTo: '/create' }} className="hover:text-[#eed7a1] transition-colors flex items-center gap-1.5">
                  <span>Abrir Nuevo Lienzo</span>
                </Link>
              </li>
              <li>
                <Link to={user && !user.isGuest ? '/my-puzzles' : '/login'} state={{ returnTo: '/my-puzzles' }} className="hover:text-[#eed7a1] transition-colors flex items-center gap-1.5">
                  <span>Mi Archivo Privado</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: El Salón */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#eed7a1] flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>El Salón</span>
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-serif text-stone-400">
              <li>
                <button 
                  onClick={() => {
                    const el = document.getElementById('seccion-unirse');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-[#eed7a1] transition-colors text-left"
                >
                  Unirse por Clave Poética
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const el = document.getElementById('ritual-atelier');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-[#eed7a1] transition-colors text-left"
                >
                  El Ritual del Atelier
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const el = document.getElementById('galeria-manuscritos');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-[#eed7a1] transition-colors text-left"
                >
                  Convocar Duelo con Amigos
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Filosofía */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#eed7a1] flex items-center gap-2">
              <Scroll className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Filosofía</span>
            </h4>
            <p className="text-stone-400 font-serif italic text-xs leading-relaxed">
              «Las palabras son el mapa de nuestra memoria; descifrarlas en compañía es volver a encontrarnos.»
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 font-serif mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Salones en Vivo Operativos</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Credits & Copyright */}
        <div className="pt-8 border-t border-[#1d2a3a] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-serif text-stone-400">
          <div className="flex items-center gap-2">
            <span>© {currentYear} Sopa de Letras — Atelier Literario.</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-stone-400 hidden sm:inline">Todos los manuscritos preservados.</span>
          </div>

          <div className="flex items-center gap-1 text-stone-400">
            <span>Elaborado con</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline mx-0.5" />
            <span>y devoción por las letras</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
