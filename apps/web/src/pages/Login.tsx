import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const [isGuestMode, setIsGuestMode] = useState(location.state?.guest || false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isGuestMode) {
        if (!nickname) throw new Error('Ingresa un apodo');
        const res = await api.post('/auth/guest', { nickname });
        setUser(res.user, res.token);
      } else {
        if (!email || !password) throw new Error('Completa todos los campos');
        const res = await api.post('/auth/login', { email, password });
        setUser(res.user, res.token);
      }
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090e15] text-[#ede3d2]">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
      
      <Card className="w-full max-w-md p-8 border-[#d4a359]/30 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-[#c59235]/15 border border-[#d4a359]/40 flex items-center justify-center mx-auto mb-4 text-[#eed7a1] shadow-inner">
          {isGuestMode ? <User className="w-7 h-7" /> : <LogIn className="w-7 h-7" />}
        </div>
        <h2 className="text-2xl font-serif font-black text-center mb-6 text-white tracking-wide">
          {isGuestMode ? 'Ingreso como Invitado' : 'Iniciar Sesión'}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isGuestMode ? (
            <Input
              label="Apodo o Monograma"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Ej: AutorSilente"
              required
              minLength={2}
            />
          ) : (
            <>
              <Input
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@biblioteca.com"
                required
              />
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </>
          )}

          {error && <div className="text-rose-400 text-xs font-serif font-semibold">{error}</div>}

          <Button type="submit" isLoading={loading} className="w-full mt-2 font-serif font-bold">
            {isGuestMode ? 'Entrar al Atelier' : 'Acceder a mi Cuenta'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-400 font-serif flex flex-col gap-2">
          {!isGuestMode && (
            <p>
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-[#eed7a1] hover:underline font-bold">Inscríbete aquí</Link>
            </p>
          )}
          <button 
            onClick={() => setIsGuestMode(!isGuestMode)}
            className="text-stone-300 hover:text-white transition-colors"
          >
            {isGuestMode ? 'O accede con tu cuenta registrada' : 'O juega libremente como invitado'}
          </button>
        </div>
      </Card>
      </div>
      <Footer />
    </div>
  );
}
