import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Copy, 
  Check, 
  Crown, 
  LogIn, 
  Scroll, 
  Send 
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { copyToClipboard } from '../utils/clipboard';
import { ExLibrisStamp } from './ExLibrisStamp';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzleId: string;
  puzzleCode: string;
  puzzleTitle: string;
}

export function ShareModal({
  isOpen,
  onClose,
  puzzleId,
  puzzleCode,
  puzzleTitle,
}: ShareModalProps) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [copiedSolo, setCopiedSolo] = useState(false);
  const [copiedInvitation, setCopiedInvitation] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Guest modal state if user is not logged in
  const [needsNickname, setNeedsNickname] = useState(false);
  const [guestNickname, setGuestNickname] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState('');

  const soloUrl = `${window.location.origin}/play/${puzzleCode}`;

  const handleCopySolo = async () => {
    const ok = await copyToClipboard(soloUrl);
    if (ok) {
      setCopiedSolo(true);
      setTimeout(() => setCopiedSolo(false), 2500);
    } else {
      prompt('Copia este enlace de estudio individual:', soloUrl);
    }
  };

  const handleCopyFormalText = async () => {
    const invitationMessage = `📜 *Invitación de Salón Literario*\n\nTe invito cordialmente a descifrar el lienzo «${puzzleTitle}» conmigo en Sopa de Letras Atelier.\n\nEnlace de acceso directo:\n${soloUrl}\n\n¡Que la agudeza y la calma te acompañen!`;
    const ok = await copyToClipboard(invitationMessage);
    if (ok) {
      setCopiedInvitation(true);
      setTimeout(() => setCopiedInvitation(false), 2500);
    }
  };

  const handleStartDuelCreation = async () => {
    if (!user) {
      setNeedsNickname(true);
      return;
    }
    await doCreateRoom();
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestNickname.trim()) return;
    setGuestLoading(true);
    setGuestError('');
    try {
      const res = await api.post('/auth/guest', { nickname: guestNickname.trim() });
      setUser(res.user, res.token);
      setNeedsNickname(false);
      await doCreateRoom();
    } catch (err: any) {
      setGuestError(err.message || 'Error al ingresar apodo');
    } finally {
      setGuestLoading(false);
    }
  };

  const doCreateRoom = async () => {
    setCreatingRoom(true);
    try {
      const res = await api.post('/rooms', { puzzleId });
      // Build courteous salon invitation text
      const roomUrl = `${window.location.origin}/room/${res.code}`;
      const invitationMessage = `🕯️ *Invitación a la Mesa Literaria*\n\nHe convocado una sesión en la mesa «${res.code}» para descifrar juntos «${puzzleTitle}».\n\nÚnete a la mesa de espera aquí:\n${roomUrl}\n\nArrancaremos la partida en cuanto estemos todos reunidos.`;
      await copyToClipboard(invitationMessage);
      navigate(`/room/${res.code}`);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al convocar la mesa');
    } finally {
      setCreatingRoom(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tarjeta de Invitación y Compartir" maxWidth="max-w-lg">
      <div className="flex flex-col gap-5">
        
        {/* Digital Formal Invitation Card Preview per skills.md */}
        <div 
          className="relative p-5 sm:p-6 rounded-3xl border-2 border-[#d4a359]/50 overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #182230 0%, #101823 100%)',
            boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.1), 0 12px 30px rgba(0,0,0,0.6)'
          }}
        >
          {/* Ornamental corner flourishes */}
          <div className="absolute top-2 left-2 text-[#d4a359]/50 text-xs select-none">✦</div>
          <div className="absolute top-2 right-2 text-[#d4a359]/50 text-xs select-none">✦</div>
          <div className="absolute bottom-2 left-2 text-[#d4a359]/50 text-xs select-none">✦</div>
          <div className="absolute bottom-2 right-2 text-[#d4a359]/50 text-xs select-none">✦</div>

          <div className="flex flex-col items-center text-center gap-2">
            <span className="text-[10px] font-serif font-black uppercase tracking-widest text-[#eed7a1] border-b border-[#d4a359]/30 pb-1 px-4">
              Mano a Mano · Sesión de Salón
            </span>

            <div className="my-1">
              <ExLibrisStamp
                nickname={user?.nickname || 'Anfitrión'}
                seal={user?.monogramSeal}
                ink={user?.monogramInk}
                size="md"
              />
            </div>

            <h3 
              className="text-xl sm:text-2xl font-black text-white tracking-tight"
              style={{ fontFamily: 'Cinzel, Georgia, serif' }}
            >
              «{puzzleTitle}»
            </h3>

            <p className="text-xs text-amber-200/70 font-serif italic max-w-xs">
              Convocada por {user?.nickname ? <strong>{user.nickname}</strong> : 'un anfitrión de letras'}.
            </p>
          </div>
        </div>

        {needsNickname ? (
          /* Inline Guest Name Prompt for Host */
          <div className="bg-[#1b2533] border border-[#d4a359]/40 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#eed7a1] font-serif font-bold text-sm">
              <Crown className="w-4 h-4 text-[#d4a359]" />
              <span>Graba tu Apodo de Anfitrión</span>
            </div>
            <p className="text-xs text-stone-300 font-serif leading-relaxed">
              Ingresa el nombre con el que tus invitados te reconocerán en la mesa de espera:
            </p>
            <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3">
              <Input
                placeholder="Ej: Borges, Gabriel, Hipatia..."
                value={guestNickname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestNickname(e.target.value)}
                required
                minLength={2}
                autoFocus
              />
              {guestError && <span className="text-xs text-rose-400">{guestError}</span>}
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setNeedsNickname(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  className="flex-1 flex items-center justify-center gap-1.5"
                  isLoading={guestLoading}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Abrir Mesa</span>
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* OPTION 1: DUEL WITH FRIENDS (RECOMMENDED) */}
            <div className="bg-[#141f2e] border-2 border-[#d4a359]/40 rounded-2xl p-4 flex flex-col gap-3 transition-all hover:border-[#d4a359]/70 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-serif font-black uppercase tracking-wider text-[#eed7a1] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#d4a359]" />
                  <span>Invitar a la Mesa (Encuentro en Vivo)</span>
                </span>
                <span className="text-[10px] bg-[#c59235]/20 text-[#eed7a1] font-bold px-2 py-0.5 rounded-full border border-[#d4a359]/40">
                  Control de Anfitrión
                </span>
              </div>

              <p className="text-xs text-stone-300 font-serif leading-relaxed">
                Abre una <strong>Mesa de Espera</strong> con una clave poética (ej: <em>roble-tinta-luna</em>). Los invitados aguardan y <strong>tú das la señal de inicio</strong> para resolver juntos.
              </p>

              <Button
                onClick={handleStartDuelCreation}
                isLoading={creatingRoom}
                className="w-full flex items-center justify-center gap-2 py-2.5 font-serif font-bold text-sm shadow-md"
              >
                <Users className="w-4 h-4" />
                <span>Abrir Mesa Compartida & Copiar Invitación</span>
              </Button>
            </div>

            {/* OPTION 2: FORMAL INVITATION TEXT / SOLO DIRECT LINK */}
            <div className="bg-[#0e1622] border border-[#26374a] rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-stone-300 flex items-center gap-1.5">
                  <Scroll className="w-4 h-4 text-[#d4a359]" />
                  <span>Carta de Invitación Formal (WhatsApp / Enlace)</span>
                </span>
              </div>

              <p className="text-[11px] text-stone-400 font-serif leading-relaxed">
                Copia un mensaje de salón pre-redactado listo para enviar a tus amigos o el enlace directo al lienzo:
              </p>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyFormalText}
                  className="flex-1 flex items-center justify-center gap-1.5 font-serif text-xs font-bold"
                >
                  {copiedInvitation ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#6ee7b7] stroke-[3]" />
                      <span className="text-[#6ee7b7]">¡Carta Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span>Copiar Texto Formal</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopySolo}
                  className="flex-1 flex items-center justify-center gap-1.5 font-serif text-xs font-bold"
                >
                  {copiedSolo ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#6ee7b7] stroke-[3]" />
                      <span className="text-[#6ee7b7]">¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
