import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  PenTool, 
  FolderKanban, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X, 
  Volume2, 
  VolumeX, 
  Feather,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { BrandLogo } from './BrandLogo';
import { ExLibrisStamp } from './ExLibrisStamp';
import { ExLibrisModal } from './ExLibrisModal';
import { sounds } from '../utils/soundEffects';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showExLibrisModal, setShowExLibrisModal] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playWordFound();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop & Mobile Main Header - Permanently fixed so it never hides on scroll */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#0a0f16]/95 backdrop-blur-md border-b border-[#25364a]/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="hover:opacity-95 transition-opacity"
            onClick={closeSidebar}
          >
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-serif transition-all ${
                isActive('/') 
                  ? 'bg-[#c59235]/15 text-[#eed7a1] border border-[#d4a359]/40 font-bold shadow-sm' 
                  : 'text-stone-300 hover:text-white hover:bg-[#141f2d]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#d4a359]" />
              <span>Galería</span>
            </Link>
            <Link
              to={user && !user.isGuest ? '/create' : '/login'}
              state={{ returnTo: '/create' }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-serif transition-all ${
                isActive('/create') 
                  ? 'bg-[#c59235]/15 text-[#eed7a1] border border-[#d4a359]/40 font-bold shadow-sm' 
                  : 'text-stone-300 hover:text-white hover:bg-[#141f2d]'
              }`}
            >
              <PenTool className="w-4 h-4 text-[#d4a359]" />
              <span>Abrir Lienzo</span>
            </Link>
            {user && !user.isGuest && (
              <Link
                to="/my-puzzles"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-serif transition-all ${
                  isActive('/my-puzzles') 
                    ? 'bg-[#c59235]/15 text-[#eed7a1] border border-[#d4a359]/40 font-bold shadow-sm' 
                    : 'text-stone-300 hover:text-white hover:bg-[#141f2d]'
                }`}
              >
                <FolderKanban className="w-4 h-4 text-[#d4a359]" />
                <span>Mi Archivo</span>
              </Link>
            )}
          </nav>

          {/* Desktop User / Sound Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
                isMuted
                  ? 'bg-[#121924] border-[#293c52] text-slate-500 hover:text-slate-300'
                  : 'bg-[#c59235]/10 border-[#d4a359]/40 text-[#eed7a1] hover:bg-[#c59235]/20'
              }`}
              title={isMuted ? 'Activar efectos sonoros táctiles' : 'Silenciar sonido'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 bg-[#111925]/90 border border-[#26374a] py-1.5 px-3 rounded-2xl shadow-sm">
                <button
                  onClick={() => setShowExLibrisModal(true)}
                  className="flex items-center gap-2 text-left group"
                  title="Personalizar mi Ex Libris"
                >
                  <ExLibrisStamp
                    nickname={user.nickname}
                    seal={user.monogramSeal}
                    ink={user.monogramInk}
                    size="sm"
                  />
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-xs text-[#f4eedb] group-hover:text-[#eed7a1] transition-colors">
                      {user.nickname}
                    </span>
                    <span className="text-[10px] text-amber-200/60 flex items-center gap-1">
                      <Feather className="w-2.5 h-2.5" />
                      <span>Ex Libris</span>
                    </span>
                  </div>
                </button>
                <button 
                  onClick={logout}
                  className="text-xs text-stone-400 hover:text-rose-400 transition-colors ml-1 pl-2 border-l border-[#26374a] flex items-center gap-1"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="text-xs font-serif font-bold flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="text-xs font-serif font-bold flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarse</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Sound & Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border transition-all ${
                isMuted
                  ? 'bg-[#121924] border-[#293c52] text-slate-500'
                  : 'bg-[#c59235]/15 border-[#d4a359]/40 text-[#eed7a1]'
              }`}
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {user && (
              <button
                onClick={() => setShowExLibrisModal(true)}
                title="Editar mi Ex Libris"
              >
                <ExLibrisStamp
                  nickname={user.nickname}
                  seal={user.monogramSeal}
                  ink={user.monogramInk}
                  size="xs"
                />
              </button>
            )}

            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-slate-800 transition-all border border-[#2a3c50]"
              aria-label="Menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      {/* Structural spacer to offset fixed header without layout shift */}
      <div className="h-16 w-full shrink-0" aria-hidden="true" />

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeSidebar}
          />
          <aside className="relative ml-auto w-full max-w-xs bg-[#0c131c] border-l border-[#27384c] shadow-2xl h-full flex flex-col z-10 text-[#ece4d5]">
            <div className="p-4 border-b border-[#27384c] flex items-center justify-between">
              <BrandLogo size="sm" />
              <button
                onClick={closeSidebar}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {user ? (
              <div 
                onClick={() => {
                  setShowExLibrisModal(true);
                  closeSidebar();
                }}
                className="p-4 mx-4 mt-4 rounded-2xl bg-[#131d2b] border border-[#c59235]/30 flex items-center gap-3 cursor-pointer hover:border-[#d4a359]"
              >
                <ExLibrisStamp
                  nickname={user.nickname}
                  seal={user.monogramSeal}
                  ink={user.monogramInk}
                  size="md"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-serif font-black text-white text-sm truncate">{user.nickname}</span>
                  <span className="text-xs text-amber-200/60 font-serif italic">
                    Toca para editar Ex Libris
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 mx-4 mt-4 rounded-2xl bg-[#131d2b] border border-[#2a3c50] flex flex-col gap-1">
                <p className="text-xs text-amber-200 font-serif font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Bienvenido al Atelier</span>
                </p>
                <p className="text-[11px] text-stone-400 font-serif">
                  Inicia sesión para grabar tus propios lienzos y sellos personales.
                </p>
              </div>
            )}

            <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
              <Link
                to="/"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-serif font-bold ${
                  isActive('/') ? 'bg-[#c59235]/20 text-[#eed7a1] border border-[#d4a359]/40' : 'text-stone-300 hover:bg-[#141f2d]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#d4a359]" />
                <span>Galería de Manuscritos</span>
              </Link>
              <Link
                to={user && !user.isGuest ? '/create' : '/login'}
                state={{ returnTo: '/create' }}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-serif font-bold ${
                  isActive('/create') ? 'bg-[#c59235]/20 text-[#eed7a1] border border-[#d4a359]/40' : 'text-stone-300 hover:bg-[#141f2d]'
                }`}
              >
                <PenTool className="w-4 h-4 text-[#d4a359]" />
                <span>Abrir un Nuevo Lienzo</span>
              </Link>
              {user && !user.isGuest && (
                <Link
                  to="/my-puzzles"
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-serif font-bold ${
                    isActive('/my-puzzles') ? 'bg-[#c59235]/20 text-[#eed7a1] border border-[#d4a359]/40' : 'text-stone-300 hover:bg-[#141f2d]'
                  }`}
                >
                  <FolderKanban className="w-4 h-4 text-[#d4a359]" />
                  <span>Mi Archivo Privado</span>
                </Link>
              )}
            </nav>

            <div className="p-4 border-t border-[#27384c]">
              {user ? (
                <Button 
                  variant="danger" 
                  size="sm" 
                  className="w-full text-xs font-serif"
                  onClick={() => {
                    logout();
                    closeSidebar();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Cerrar Sesión</span>
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    className="w-full text-xs font-serif" 
                    onClick={() => {
                      navigate('/login');
                      closeSidebar();
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full text-xs font-serif" 
                    onClick={() => {
                      navigate('/register');
                      closeSidebar();
                    }}
                  >
                    Registrarse
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Ex Libris Customizer Modal */}
      <ExLibrisModal
        isOpen={showExLibrisModal}
        onClose={() => setShowExLibrisModal(false)}
      />
    </>
  );
}
