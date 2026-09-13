import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  maxWidth?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, maxWidth = 'max-w-md', children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative bg-gradient-to-b from-[#141d29] to-[#0d141e] rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[92dvh] flex flex-col border border-[#c59235]/40 overflow-hidden animate-in zoom-in-95 duration-200 text-[#ece4d5]`}>
        {/* Subtle top brass ambient beam */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#d4a359]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-[#25364a] relative">
          <h2 className="font-serif font-black text-lg sm:text-xl text-white tracking-wide">
            {title}
          </h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
