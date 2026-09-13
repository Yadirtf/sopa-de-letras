import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CreatePuzzle } from './pages/CreatePuzzle';
import { PlayPuzzle } from './pages/PlayPuzzle';
import { Room } from './pages/Room';
import { MyPuzzles } from './pages/MyPuzzles';
import { useAuth } from './hooks/useAuth';

function App() {
  // Initialize auth on load
  useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreatePuzzle />} />
        <Route path="/edit/:id" element={<CreatePuzzle />} />
        <Route path="/my-puzzles" element={<MyPuzzles />} />
        <Route path="/play/:code" element={<PlayPuzzle />} />
        <Route path="/room/:code" element={<Room />} />
      </Routes>
    </div>
  );
}

export default App;
