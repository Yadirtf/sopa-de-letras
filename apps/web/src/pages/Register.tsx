import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!nickname || !email || !password) throw new Error('Completa todos los campos');
      const res = await api.post('/auth/register', { nickname, email, password });
      setUser(res.user, res.token);
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
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
          <UserPlus className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-serif font-black text-center mb-6 text-white tracking-wide">
          Inscripción de Autor
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Apodo o Monograma"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="Ej: MaestroDeLetras"
            required
            minLength={2}
          />
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
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />

          {error && <div className="text-rose-400 text-xs font-serif font-semibold">{error}</div>}

          <Button type="submit" isLoading={loading} className="w-full mt-2 font-serif font-bold">
            Grabar Cuenta
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-400 font-serif">
          <p>
            ¿Ya posees cuenta registrada?{' '}
            <Link to="/login" className="text-[#eed7a1] hover:underline font-bold">Inicia Sesión aquí</Link>
          </p>
        </div>
      </Card>
      </div>
      <Footer />
    </div>
  );
}
