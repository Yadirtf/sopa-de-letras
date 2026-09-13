import { useState } from 'react';
import { Feather, Check, Sparkles, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { SEALS, INK_PALETTES, ExLibrisStamp, SealId, InkId } from './ExLibrisStamp';
import { Button } from './ui/Button';

interface ExLibrisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExLibrisModal({ isOpen, onClose }: ExLibrisModalProps) {
  const { user, updateMonogram } = useAuthStore();
  const [selectedSeal, setSelectedSeal] = useState<SealId>((user?.monogramSeal as SealId) || 'pluma');
  const [selectedInk, setSelectedInk] = useState<InkId>((user?.monogramInk as InkId) || 'nogal');

  if (!isOpen) return null;

  const handleSave = () => {
    updateMonogram(selectedSeal, selectedInk);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92dvh] flex flex-col bg-[#121924] border border-[#c59235]/40 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden text-parchment-100 animate-in zoom-in-95 duration-200">
        {/* Subtle decorative parchment light */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#c59235]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between pb-3.5 border-b border-[#2a384c]">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-[#d4a359]" />
            <h3 className="font-serif font-bold text-lg text-white tracking-wide">
              Tu Sello Personal (Ex Libris)
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 py-2 min-h-0">

        {/* Live Preview of the Seal */}
        <div className="py-6 flex flex-col items-center justify-center gap-2 bg-[#0c121b]/80 border border-[#2a384c] rounded-2xl my-4">
          <ExLibrisStamp
            nickname={user?.nickname || 'Autor'}
            seal={selectedSeal}
            ink={selectedInk}
            size="xl"
          />
          <div className="text-center mt-1">
            <span className="font-serif font-black text-base text-white tracking-wider">
              {user?.nickname || 'Tú'}
            </span>
            <p className="text-xs text-amber-200/70 italic font-serif">
              «{SEALS.find(s => s.id === selectedSeal)?.name} · {INK_PALETTES[selectedInk]?.name}»
            </p>
          </div>
        </div>

        {/* Section 1: Choose Seal Icon */}
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-xs font-serif font-semibold tracking-wider text-amber-200/90 uppercase">
            1. Escoge tu Emblema Heráldico
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SEALS.map(s => {
              const isSelected = selectedSeal === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSeal(s.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-[#c59235]/20 border-[#d4a359] shadow-md shadow-[#c59235]/20 scale-105'
                      : 'bg-[#182333] border-[#2a384c] text-slate-300 hover:border-slate-500'
                  }`}
                  title={s.desc}
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-[10px] font-medium truncate w-full text-center">
                    {s.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Choose Ink Essence */}
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-xs font-serif font-semibold tracking-wider text-amber-200/90 uppercase">
            2. Elige tu Tintero de Autor
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(INK_PALETTES) as InkId[]).map(inkKey => {
              const def = INK_PALETTES[inkKey];
              const isSelected = selectedInk === inkKey;
              return (
                <button
                  key={inkKey}
                  type="button"
                  onClick={() => setSelectedInk(inkKey)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border-white shadow-md scale-105'
                      : 'border-[#2a384c] hover:border-slate-500'
                  }`}
                  style={{
                    backgroundColor: def.bgHex,
                  }}
                  title={def.name}
                >
                  <div 
                    className="w-4 h-4 rounded-full border border-white/40 shadow-inner flex items-center justify-center"
                    style={{ backgroundColor: def.borderHex }}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                  <span className="text-[9px] font-serif font-bold text-slate-200 truncate w-full text-center">
                    {def.name.replace('Tinta ', '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 flex gap-2 pt-3 border-t border-[#2a384c]">
          <Button variant="secondary" onClick={onClose} className="flex-1 text-xs">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1 text-xs font-bold flex items-center justify-center gap-1.5 bg-[#b88636] hover:bg-[#d4a359] text-slate-950">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grabar Sello</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
